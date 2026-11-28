import { describe, expect, it } from "vitest";
import { cardAlert } from "@/dojos/authority/scenarios/card-alert";
import { kycCall } from "@/dojos/authority/scenarios/kyc-call";
import { capParts, fallbackReport, scoreConversation, sumParts } from "@/engine/call-score";
import {
  ACCENT_RULE,
  agentInstructions,
  CallReportSchema,
  liveCallNode,
  possibleSignals,
  REPORTED_SIGNAL,
  type CallTurn,
} from "@/engine/live-call";
import { handleCallReport, LIVE_TEMPERATURE, liveConfig, type JsonJudge } from "@/server/call-api";
import { getScenario } from "@/dojos/registry";

const kycNode = liveCallNode(kycCall, "kyc-call")!;
const alertNode = liveCallNode(cardAlert, "alert-call")!;

const said = (...lines: [CallTurn["who"], string][]): CallTurn[] =>
  lines.map(([who, text], i) => ({ who, text, atMs: i * 4000 }));

const facts = (over: Partial<Parameters<typeof scoreConversation>[1]> = {}) => ({
  signals: [],
  endedBy: "player" as const,
  durationMs: 120_000,
  flags: [],
  transcript: [],
  ...over,
});

describe("scoring a call from the conversation", () => {
  it("gives full marks for questioning, refusing and hanging up to verify", () => {
    const score = scoreConversation(
      kycNode,
      facts({
        durationMs: 60_000,
        transcript: said(
          ["caller", "Your account freezes in two hours."],
          ["player", "Who is this? Which branch are you calling from?"],
          ["player", "Why would the bank call me for this?"],
          ["player", "No, I won't share anything. I'll call the bank myself."],
        ),
      }),
      false,
    );
    expect(score.parts).toEqual({ secrets: 4, questions: 2, pressure: 2, exit: 2 });
    expect(score.rating).toBe(10);
    expect(score.goodMoves.map((m) => m.key)).toEqual(
      expect.arrayContaining(["keptSecrets", "askedQuestion", "refused", "hungUp", "verify"]),
    );
    expect(score.goodMoves.find((m) => m.key === "askedQuestion")?.quote).toContain("Who is this");
  });

  it("caps the call when the code is read out", () => {
    const score = scoreConversation(
      kycNode,
      facts({ signals: ["otp-sms.read"], endedBy: "caller" }),
      false,
    );
    expect(score.parts.secrets).toBe(0);
    expect(score.parts.pressure).toBe(0);
    expect(score.rating).toBeLessThanOrEqual(2.5);
    expect(score.mistakes.map((m) => m.key)).toContain("sharedCode");
  });

  it("takes points off for card details said out loud, with the words as the quote", () => {
    const score = scoreConversation(
      kycNode,
      facts({
        transcript: said(
          ["caller", "Please confirm your account number."],
          ["player", "It's five zero two one zero zero three four four eight two one"],
          ["player", "Aadhaar ends 7319"],
        ),
      }),
      false,
    );
    expect(score.leaks).toBe(2);
    expect(score.parts.secrets).toBe(1);
    const shared = score.mistakes.filter((m) => m.key === "sharedDetail");
    expect(shared).toHaveLength(2);
    expect(shared[1]?.quote).toBe("Aadhaar ends 7319");
  });

  it("marks staying on the line without saying no", () => {
    const score = scoreConversation(
      kycNode,
      facts({ endedBy: "caller", transcript: said(["player", "Okay, okay. Tell me what to do."]) }),
      false,
    );
    expect(score.parts.exit).toBe(0);
    expect(score.mistakes.map((m) => m.key)).toContain("stayedOn");
  });

  it("rewards reporting a scam number, and marks reporting a genuine caller", () => {
    const scam = scoreConversation(
      kycNode,
      facts({ signals: [REPORTED_SIGNAL], durationMs: 200_000 }),
      false,
    );
    expect(scam.parts.exit).toBe(2);
    expect(scam.goodMoves.map((m) => m.key)).toContain("reported");

    const genuine = scoreConversation(alertNode, facts({ signals: [REPORTED_SIGNAL] }), true);
    expect(genuine.parts.exit).toBe(0);
    expect(genuine.mistakes.map((m) => m.key)).toContain("reportedGenuine");
  });

  it("on a genuine call, rewards verifying and marks brushing it off", () => {
    const checked = scoreConversation(
      alertNode,
      facts({
        endedBy: "caller",
        transcript: said(["player", "No, that wasn't me. I'll call the number on my card too."]),
      }),
      true,
    );
    expect(checked.parts.exit).toBe(2);
    expect(checked.parts.pressure).toBe(2);

    const brushed = scoreConversation(
      alertNode,
      facts({ durationMs: 8000, transcript: said(["player", "Not interested"]) }),
      true,
    );
    expect(brushed.mistakes.map((m) => m.key)).toContain("dismissedGenuine");
  });

  it("keeps parts in range and adds them up", () => {
    const parts = capParts({ secrets: 9, questions: -1, pressure: 1.26, exit: Number.NaN }, false);
    expect(parts).toEqual({ secrets: 4, questions: 0, pressure: 1.5, exit: 0 });
    expect(sumParts(parts)).toBe(5.5);
    // Handing over a code or money caps the whole call at 2.5.
    expect(sumParts(capParts({ secrets: 4, questions: 2, pressure: 2, exit: 2 }, true))).toBe(2.5);
  });

  it("builds a valid rough report, with moments the UI words", () => {
    const report = fallbackReport(kycNode, facts({ transcript: said(["player", "Who is this?"]) }));
    expect(CallReportSchema.safeParse(report).success).toBe(true);
    expect(report.analysed).toBe(false);
    expect(report.rating).toBe(sumParts(report.parts));
    expect(report.goodMoves.every((m) => m.key !== undefined && m.why === "")).toBe(true);
  });
});

describe("reporting the caller", () => {
  it("is a signal every call can record, explained to the judge", async () => {
    expect(possibleSignals(kycNode)).toContain(REPORTED_SIGNAL);
    const prompts: string[] = [];
    const judge: JsonJudge = {
      async generateJson({ prompt }) {
        prompts.push(prompt);
        return {
          outcome_id: "kept-safe",
          scores: { secrets: 4, questions: 1, pressure: 2, exit: 0 },
          summary: "",
          good_moves: [],
          mistakes: [],
          do_better: [],
          heard: [],
          flag_matches: [],
        };
      },
    };
    const result = await handleCallReport(
      {
        dojoId: kycCall.dojoId,
        scenarioId: kycCall.id,
        nodeId: "kyc-call",
        locale: "en",
        transcript: said(["player", "My Aadhaar ends 7319"]),
        flags: [],
        signals: [REPORTED_SIGNAL],
        endedBy: "player",
        durationMs: 100_000,
      },
      { judge, allow: async () => true, withinDailyCap: async () => true, getScenario },
    );
    expect(prompts[0]).toContain("reported it as fraud");
    const { report } = result.body as { report: { parts: Record<string, number>; rating: number } };
    // A report filed lifts the exit mark; a detail said aloud caps the secrets mark.
    expect(report.parts.exit).toBe(1.5);
    expect(report.parts.secrets).toBe(2.5);
    expect(report.rating).toBe(7);
  });
});

describe("the caller keeps one accent", () => {
  it("tells the voice to hold one Indian accent whatever the language", () => {
    for (const locale of ["en", "hinglish"] as const) {
      expect(agentInstructions(kycCall, kycNode, locale)).toContain(ACCENT_RULE);
    }
    expect(ACCENT_RULE).toContain("only the words change, never the voice");
  });

  it("runs the voice a little cooler than the default", () => {
    expect(liveConfig(kycCall, kycNode, "en").temperature).toBe(LIVE_TEMPERATURE);
    expect(LIVE_TEMPERATURE).toBeLessThan(1);
  });
});
