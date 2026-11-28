import { describe, expect, it } from "vitest";
import { z } from "zod";
import { kycCall } from "@/dojos/authority/scenarios/kyc-call";
import { digitalArrest } from "@/dojos/authority/scenarios/digital-arrest";
import {
  agentInstructions,
  agentTools,
  callRedFlagIds,
  cleanRating,
  fallbackReport,
  fillCode,
  liveCallNode,
  liveFlagTactics,
  makeCode,
  possibleSignals,
  ratingBand,
  resolveOutcome,
  saidCode,
  spokenDigits,
  type CallReport,
  type LiveCallRecord,
} from "@/engine/live-call";
import { ScenarioSchema, type ScenarioInput } from "@/engine/schema";
import { computeDebrief } from "@/engine/scoring";

const kycNode = liveCallNode(kycCall, "kyc-call")!;
const arrestNode = liveCallNode(digitalArrest, "arrest-call")!;

describe("spotting a code read out loud", () => {
  it("turns number words into digits", () => {
    expect(spokenDigits("It's four eight two, nine one three")).toBe("482913");
    expect(spokenDigits("double four seven, triple nine")).toBe("447999");
    expect(spokenDigits("char aath do nau ek teen")).toBe("482913");
    expect(spokenDigits("OTP is 482 913")).toBe("482913");
  });

  it("catches the code, even with one digit lost or misheard", () => {
    expect(saidCode("the code is 4 8 2 9 1 3", "482913")).toBe(true);
    expect(saidCode("four eight two nine three", "482913")).toBe(true);
    expect(saidCode("four eight two nine one eight", "482913")).toBe(true);
  });

  it("doesn't fire on other numbers or a refusal", () => {
    expect(saidCode("No, I won't read it. My account ends 4821.", "482913")).toBe(false);
    expect(saidCode("I'm hanging up and calling 1930", "482913")).toBe(false);
    expect(saidCode("", "482913")).toBe(false);
  });

  it("makes six-digit codes and fills them in", () => {
    expect(makeCode(() => 0)).toBe("100000");
    expect(makeCode(() => 0.999999)).toMatch(/^\d{6}$/);
    expect(fillCode("{otp} is your OTP", "123456")).toBe("123456 is your OTP");
  });
});

describe("where a call leads", () => {
  it("lets money or a code decide outright", () => {
    expect(resolveOutcome(kycNode, ["otp-sms.read"], "kept-safe").id).toBe("handed-over");
    expect(resolveOutcome(kycNode, ["kyc-fee.paid"]).id).toBe("handed-over");
  });

  it("otherwise takes the judge's pick, or the default", () => {
    expect(resolveOutcome(kycNode, [], "shared-details").id).toBe("shared-details");
    expect(resolveOutcome(kycNode, ["kyc-fee.declined"], "made-up").id).toBe("kept-safe");
    expect(resolveOutcome(kycNode, []).id).toBe("kept-safe");
  });

  it("lists every signal the call can record", () => {
    expect(possibleSignals(kycNode).toSorted()).toEqual(
      ["kyc-fee.declined", "kyc-fee.paid", "otp-sms.read"].toSorted(),
    );
    expect(possibleSignals(arrestNode)).toContain("brother.sent");
    expect(possibleSignals(arrestNode)).toContain("warrant.opened");
  });

  it("rates on the guide's bands", () => {
    expect(ratingBand(1)).toBe("vulnerable");
    expect(ratingBand(6.5)).toBe("moderate");
    expect(ratingBand(9.5)).toBe("savvy");
    expect(cleanRating(7.3)).toBe(7.5);
    expect(cleanRating(42)).toBe(10);
    expect(cleanRating(Number.NaN)).toBe(0);
  });

  it("gives a rough report without the judge", () => {
    const lost = fallbackReport(kycNode, {
      signals: ["otp-sms.read"],
      endedBy: "caller",
      durationMs: 200_000,
      flags: [],
    });
    expect(lost.outcomeId).toBe("handed-over");
    expect(lost.rating).toBeLessThan(4);
    expect(lost.analysed).toBe(false);
    const quick = fallbackReport(kycNode, {
      signals: [],
      endedBy: "player",
      durationMs: 40_000,
      flags: [],
    });
    expect(ratingBand(quick.rating)).toBe("savvy");
  });
});

describe("voice agent setup", () => {
  it("builds instructions from the scenario, in the player's language", () => {
    const en = agentInstructions(kycCall, kycNode, "en");
    expect(en).toContain("Rohan Mehra");
    expect(en).toContain("Priya Nair");
    expect(en).toContain("BXKPN4821Q");
    expect(en).toContain('"otp-sms"');
    expect(en).toContain("Indian English");
    expect(en).toContain("SAFETY RULE");
    expect(agentInstructions(kycCall, kycNode, "hinglish")).toContain("Hinglish");
  });

  it("declares end_call, and trigger_event limited to the call's events", () => {
    const [tool] = agentTools(kycNode);
    const names = tool!.functionDeclarations.map((f) => f.name);
    expect(names).toEqual(["end_call", "trigger_event"]);
    const trigger = tool!.functionDeclarations[1]!.parametersJsonSchema as {
      properties: { event: { enum: string[] } };
    };
    expect(trigger.properties.event.enum.toSorted()).toEqual(["kyc-fee", "otp-sms"]);
  });

  it("offers flag reasons that include every tactic the caller uses", () => {
    const tactics = liveFlagTactics(kycCall, kycNode);
    for (const id of callRedFlagIds(kycNode)) {
      expect(tactics).toContain(kycCall.redFlags[id]!.tactic);
    }
  });
});

/** The KYC scenario with one live-call field changed, to test the schema's rules. */
function brokenKyc(change: (node: Record<string, unknown>) => void): string[] {
  const input = structuredClone(kycCall) as unknown as ScenarioInput;
  change(input.nodes["kyc-call"] as unknown as Record<string, unknown>);
  const result = ScenarioSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((i) => i.message);
}

describe("live-call schema", () => {
  it("accepts the authority scenarios", () => {
    const result = ScenarioSchema.safeParse(kycCall);
    expect(result.success ? "" : z.prettifyError(result.error)).toBe("");
  });

  it("rejects a missing scripted call", () => {
    expect(brokenKyc((n) => (n.scriptedNodeId = "nowhere"))).toContainEqual(
      expect.stringContaining('"nowhere" is not a node'),
    );
  });

  it("rejects a signal the call can't produce", () => {
    expect(
      brokenKyc((n) => {
        (n.outcomes as { events?: string[] }[])[0]!.events = ["otp-sms.paid"];
      }),
    ).toContainEqual(expect.stringContaining("can't happen on this call"));
  });

  it("needs a default outcome last", () => {
    expect(
      brokenKyc((n) => {
        const outcomes = n.outcomes as unknown[];
        n.outcomes = [...outcomes.slice(1), outcomes[0]];
      }),
    ).toContainEqual(expect.stringContaining("the last outcome is the default"));
  });

  it("rejects an OTP message without a place for the code", () => {
    expect(
      brokenKyc((n) => {
        const events = n.events as Record<string, { text: string }>;
        events["otp-sms"]!.text = "Your OTP is here";
      }),
    ).toContainEqual(expect.stringContaining('must contain "{otp}"'));
  });

  it("rejects an unknown red flag in the agent's lines", () => {
    expect(
      brokenKyc((n) => {
        (n.agent as { stages: { redFlagIds?: string[] }[] }).stages[0]!.redFlagIds = ["nope"];
      }),
    ).toContainEqual(expect.stringContaining('redFlagId "nope" is not defined'));
  });

  it("allows one hang-up choice per call screen, and only on call screens", () => {
    const input = structuredClone(kycCall) as unknown as ScenarioInput;
    const open = input.nodes["kyc-open"];
    if (open?.kind !== "thread") throw new Error("fixture");
    open.choices = open.choices.map((c) => ({ ...c, hangUp: true }));
    const after = input.nodes["kyc-after"];
    if (after?.kind !== "thread") throw new Error("fixture");
    after.choices[0] = { ...after.choices[0]!, hangUp: true };
    const result = ScenarioSchema.safeParse(input);
    const messages = result.success ? [] : result.error.issues.map((i) => i.message);
    expect(messages).toContainEqual(expect.stringContaining("at most one hangUp"));
    expect(messages).toContainEqual(expect.stringContaining('app "call"'));
  });
});

describe("scoring a live call", () => {
  const report = (over: Partial<CallReport>): CallReport => ({
    outcomeId: "kept-safe",
    rating: 8,
    summary: "",
    goodMoves: [],
    mistakes: [],
    doBetter: [],
    heard: [],
    flagMatches: [],
    analysed: true,
    ...over,
  });
  const record = (over: Partial<LiveCallRecord>): LiveCallRecord => ({
    nodeId: "kyc-call",
    transcript: [],
    flags: [],
    signals: [],
    endedBy: "player",
    durationMs: 60_000,
    outcomeId: "kept-safe",
    report: report({}),
    ...over,
  });
  const run = (liveCalls: Record<string, LiveCallRecord>) => ({
    seen: [],
    flags: {},
    visited: ["kyc-call", "kyc-after"],
    classifications: {},
    liveCalls,
  });

  it("counts what the caller said, caught or missed", () => {
    const result = computeDebrief(
      kycCall,
      run({
        "kyc-call": record({
          flags: [
            { quote: "frozen in two hours", tactic: "urgency", atMs: 9_000 },
            { quote: "employee ID NN-48213", tactic: "flattery", atMs: 20_000 },
            { quote: "good afternoon", tactic: "fear", atMs: 1_000 },
          ],
          report: report({
            heard: [
              { redFlagId: "kyc-freeze-deadline", quote: "frozen in two hours" },
              { redFlagId: "kyc-fake-id", quote: "employee ID NN-48213" },
              { redFlagId: "kyc-asks-details", quote: "your PAN and date of birth" },
            ],
            flagMatches: ["kyc-freeze-deadline", "kyc-fake-id", null],
          }),
        }),
      }),
    );
    expect(result.caught.map((f) => f.redFlagId)).toEqual(["kyc-freeze-deadline"]);
    expect(result.caught[0]!.where).toBe("call");
    expect(result.spotted.map((f) => f.redFlagId)).toEqual(["kyc-fake-id"]);
    expect(result.missed.map((f) => f.redFlagId)).toEqual(["kyc-asks-details"]);
    expect(result.falseAlarms.map((f) => f.text)).toEqual(["good afternoon"]);
    // 3 + 1 - 1 = 3 points out of 3 red flags heard (9).
    expect(result.score).toMatchObject({ points: 3, max: 9 });
  });

  it("ignores calls still waiting for their review", () => {
    const result = computeDebrief(
      kycCall,
      run({
        "kyc-call": record({
          report: "pending",
          flags: [{ quote: "x", tactic: "urgency", atMs: 0 }],
        }),
      }),
    );
    expect(result.caught).toEqual([]);
    expect(result.falseAlarms).toEqual([]);
  });

  it("doesn't punish flags when only a rough report came back", () => {
    const result = computeDebrief(
      kycCall,
      run({
        "kyc-call": record({
          report: report({ analysed: false, flagMatches: [null] }),
          flags: [{ quote: "frozen in two hours", tactic: "urgency", atMs: 9_000 }],
        }),
      }),
    );
    expect(result.falseAlarms).toEqual([]);
    expect(result.score.points).toBe(0);
  });
});
