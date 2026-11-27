import { describe, expect, it } from "vitest";
import { computeDebrief, POINTS, rankFor, type RunRecord } from "@/engine/scoring";
import { collectFlaggables } from "@/engine/evidence";
import { mediumWhatsapp } from "@/dojos/dream-job/scenarios/medium-whatsapp";
import { flagsById, makeFlag, richScenario, validScenario } from "./fixtures";

const run = (partial: Partial<RunRecord>): RunRecord => ({
  seen: [],
  flags: {},
  visited: [],
  classifications: {},
  ...partial,
});

describe("computeDebrief", () => {
  it("splits red flags into caught, missed and not reached", () => {
    const s = validScenario();
    const result = computeDebrief(
      s,
      run({
        seen: ["m1", "m2"],
        flags: flagsById(makeFlag(s, "m2", { phrase: "Send ₹500", tactic: "pay-to-earn" })),
        visited: ["start"],
      }),
    );
    expect(result.caught.map((f) => f.redFlagId)).toEqual(["pay-first"]);
    expect(result.missed).toEqual([]);
    expect(result.notReached.map((f) => f.redFlagId)).toEqual(["hurry"]);
    expect(result.falseAlarms).toEqual([]);
  });

  it("counts a seen but unflagged red flag as missed", () => {
    const result = computeDebrief(validScenario(), run({ seen: ["m1", "m2", "m3"] }));
    expect(result.missed.map((f) => f.redFlagId)).toEqual(["pay-first", "hurry"]);
    expect(result.caught).toEqual([]);
  });

  it("counts a highlight that catches nothing as a false alarm", () => {
    const s = validScenario();
    const flag = makeFlag(s, "m1", { phrase: "Hello", tactic: "urgency" });
    const result = computeDebrief(s, run({ seen: ["m1", "m2"], flags: flagsById(flag) }));
    expect(result.falseAlarms).toEqual([{ id: flag.id, text: "Hello", tactic: "urgency" }]);
  });

  it("puts a found red flag with the wrong reason in 'spotted'", () => {
    const s = validScenario();
    const flag = makeFlag(s, "m2", { phrase: "Send ₹500 to earn", tactic: "urgency" });
    const result = computeDebrief(s, run({ seen: ["m2"], flags: flagsById(flag) }));
    expect(result.caught).toEqual([]);
    expect(result.spotted.map((f) => f.redFlagId)).toEqual(["pay-first"]);
    expect(result.spotted[0]?.player).toMatchObject({
      text: "Send ₹500 to earn ₹5,000",
      tactic: "urgency",
    });
  });

  it("carries the tactic, the evidence text and where it was", () => {
    const s = validScenario();
    const flag = makeFlag(s, "m2", { phrase: "₹5,000", tactic: "pay-to-earn" });
    const [caught] = computeDebrief(s, run({ seen: ["m2"], flags: flagsById(flag) })).caught;
    expect(caught).toMatchObject({
      tactic: "pay-to-earn",
      evidenceText: { en: "Send ₹500 to earn ₹5,000" },
      where: "message",
    });
  });
});

describe("score", () => {
  const s = validScenario();
  const right = makeFlag(s, "m2", { phrase: "Send ₹500", tactic: "pay-to-earn" });

  it("gives points for the right reason and takes them for false alarms", () => {
    const alarm = makeFlag(s, "m1", { phrase: "Hello", tactic: "urgency" });
    const result = computeDebrief(
      s,
      run({ seen: ["m1", "m2", "m3"], flags: flagsById(right, alarm) }),
    );
    expect(result.score.points).toBe(POINTS.rightReason + POINTS.falseAlarm);
    expect(result.score.max).toBe(2 * POINTS.rightReason);
  });

  it("adds a bonus only for a good note on a flag that caught something", () => {
    const good = { verdict: "good" as const, feedback: "Spot on." };
    const withNote = { ...right, note: "pay first", judge: good };
    const alarm = { ...makeFlag(s, "m1", { phrase: "Hello" }), note: "x", judge: good };
    const result = computeDebrief(s, run({ seen: ["m2"], flags: flagsById(withNote, alarm) }));
    expect(result.score.points).toBe(POINTS.rightReason + POINTS.goodNote + POINTS.falseAlarm);
  });

  it("counts a spot-on explanation with no reason picked as caught", () => {
    const words = makeFlag(s, "m2", { phrase: "Send ₹500" });
    const good = {
      ...words,
      note: "they want money before I earn",
      judge: { verdict: "good" as const, feedback: "Yes." },
    };
    const partial = { ...good, judge: { verdict: "partial" as const, feedback: "Close." } };
    const caught = computeDebrief(s, run({ seen: ["m2"], flags: flagsById(good) }));
    expect(caught.caught).toHaveLength(1);
    expect(caught.score.points).toBe(POINTS.rightReason + POINTS.goodNote);
    const spotted = computeDebrief(s, run({ seen: ["m2"], flags: flagsById(partial) }));
    expect(spotted.spotted).toHaveLength(1);
    expect(spotted.score.points).toBe(POINTS.wrongReason);
  });

  it("never goes below zero, so flagging everything ranks as a rookie", () => {
    const words = ["Hello", "Send", "₹500", "to", "earn", "₹5,000"];
    const flags = words.map((w, i) => ({
      ...makeFlag(s, i === 0 ? "m1" : "m2", { phrase: w, tactic: "flattery" }),
      id: `f${i}`,
    }));
    const result = computeDebrief(s, run({ seen: ["m1", "m2"], flags: flagsById(...flags) }));
    expect(result.score.points).toBeGreaterThanOrEqual(0);
    expect(result.score.rank).toBe("rookie");
  });

  it("ranks by share of the maximum, and rewards restraint when nothing was there", () => {
    expect(rankFor(9, 9, 0)).toBe("scam-proof");
    expect(rankFor(4, 9, 0)).toBe("sharp");
    expect(rankFor(3, 9, 0)).toBe("rookie");
    expect(rankFor(0, 0, 0)).toBe("scam-proof");
    expect(rankFor(0, 0, 1)).toBe("sharp");
    expect(rankFor(0, 0, 3)).toBe("rookie");
  });
});

describe("computeDebrief with evidence", () => {
  it("catches a red flag hidden inside a longer message", () => {
    const s = richScenario();
    const flag = makeFlag(s, "dm-1", { phrase: "Pay ₹999", tactic: "pay-to-earn" });
    const result = computeDebrief(
      s,
      run({ seen: ["dm-1", "dm-pay"], flags: flagsById(flag), visited: ["dm"] }),
    );
    expect(result.caught.map((f) => f.redFlagId)).toEqual(["fee"]);
    expect(result.caught[0]?.evidenceText).toEqual({ en: "Pay ₹999 to register." });
  });

  it("treats a flagged harmless sentence as a false alarm", () => {
    const s = richScenario();
    const flag = makeFlag(s, "dm-1", { phrase: "in Bengaluru", tactic: "authority" });
    const result = computeDebrief(
      s,
      run({ seen: ["dm-1"], flags: flagsById(flag), visited: ["dm"] }),
    );
    expect(result.falseAlarms.map((a) => a.text)).toEqual(["The role is in Bengaluru."]);
  });

  it("catches a phrase inside an email paragraph", () => {
    const s = richScenario();
    const flag = makeFlag(s, "mail/body/0", { phrase: "Candidate", tactic: "no-real-process" });
    const result = computeDebrief(
      s,
      run({ seen: ["e-greeting"], flags: flagsById(flag), visited: ["mail"] }),
    );
    expect(result.caught.map((f) => f.redFlagId)).toEqual(["generic"]);
  });

  it("separates 'didn't check' from 'never reached'", () => {
    // On the email screen, but the sender details and attachment were never opened.
    const result = computeDebrief(
      richScenario(),
      run({ seen: ["dm-1", "dm-pay", "e-greeting"], visited: ["dm", "mail"] }),
    );
    const ids = (flags: { redFlagId: string }[]) => flags.map((f) => f.redFlagId).toSorted();
    expect(ids(result.missed)).toEqual(["fee", "generic"]);
    // The profile panel hangs off `dm`, which was visited, so its dates count as not inspected.
    expect(ids(result.notInspected)).toEqual(["apk", "dates", "lookalike", "reply-to"]);
    expect(result.notReached).toEqual([]);
  });

  it("counts a flag on an evidence field and on the reply composer", () => {
    const s = richScenario();
    const result = computeDebrief(
      s,
      run({
        seen: ["p-joined", "reply-to-field"],
        flags: flagsById(
          makeFlag(s, "p-joined", { tactic: "impersonation" }),
          makeFlag(s, "reply-to-field", { tactic: "impersonation" }),
        ),
        visited: ["dm", "mail", "reply"],
      }),
    );
    const caught = Object.fromEntries(result.caught.map((f) => [f.redFlagId, f.where]));
    expect(caught).toEqual({ dates: "panel-field", "reply-to": "to" });
  });

  it("scores the inbox triage", () => {
    const right = computeDebrief(richScenario(), run({ classifications: { "t-real": "legit" } }));
    expect(right.triage).toMatchObject([{ itemId: "t-real", correct: "legit", isCorrect: true }]);
    const wrong = computeDebrief(richScenario(), run({ classifications: { "t-real": "scam" } }));
    expect(wrong.triage[0]?.isCorrect).toBe(false);
    const none = computeDebrief(richScenario(), run({}));
    expect(none.triage[0]).toMatchObject({ chosen: undefined, isCorrect: false });
  });
});

describe("score only covers the route the player played (medium-whatsapp)", () => {
  const s = mediumWhatsapp;
  const items = collectFlaggables(s);
  /** A run with no flags that saw everything on screen at each visited node. */
  const played = (visited: string[]): RunRecord =>
    run({
      visited,
      seen: items
        .filter((i) => !i.hidden && i.nodeIds.some((n) => visited.includes(n)))
        .map((i) => i.id),
    });
  const scored = (r: ReturnType<typeof computeDebrief>) =>
    r.caught.length + r.spotted.length + r.missed.length + r.notInspected.length;
  const total = Object.keys(s.redFlags).length;
  const LINKEDIN = ["li-open", "li-move"];

  it.each([
    ["declines WhatsApp", [...LINKEDIN, "safe-early"], 2],
    ["pays the deposit", [...LINKEDIN, "wa-screen", "wa-paid"], 5],
    ["reports the email", [...LINKEDIN, "wa-screen", "gmail-medium", "safe"], total],
    ["sends the reply", [...LINKEDIN, "wa-screen", "gmail-medium", "reply", "reply-sent"], total],
  ])("%s: scores only the red flags on that route", (_name, visited, expected) => {
    const result = computeDebrief(s, played(visited));
    expect(scored(result)).toBe(expected);
    expect(result.notReached).toHaveLength(total - expected);
    expect(result.score.max).toBe(expected * POINTS.rightReason);
  });

  it("still scores a branch the player played and then rewound away from", () => {
    const result = computeDebrief(
      s,
      played([...LINKEDIN, "wa-screen", "wa-paid", "gmail-medium", "safe"]),
    );
    expect(result.notReached).toEqual([]);
    expect(result.score.max).toBe(total * POINTS.rightReason);
  });

  it("leaves the WhatsApp and email red flags out when the player stopped on LinkedIn", () => {
    const result = computeDebrief(s, played([...LINKEDIN, "safe-early"]));
    expect(result.notReached.map((f) => f.redFlagId)).not.toContain("li-off-platform");
    expect(result.notReached.map((f) => f.redFlagId)).toContain("wa-deposit");
  });
});
