import { describe, expect, it } from "vitest";
import { computeDebrief, type RunRecord } from "@/engine/scoring";
import { richScenario, validScenario } from "./fixtures";

const run = (partial: Partial<RunRecord>): RunRecord => ({
  seen: [],
  flagged: [],
  visited: [],
  classifications: {},
  ...partial,
});

describe("computeDebrief", () => {
  it("splits red flags into caught, missed and not reached", () => {
    const result = computeDebrief(
      validScenario(),
      run({ seen: ["m1", "m2"], flagged: ["m2"], visited: ["start"] }),
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

  it("counts a flagged item with no red flag as a false alarm", () => {
    const result = computeDebrief(validScenario(), run({ seen: ["m1", "m2"], flagged: ["m1"] }));
    expect(result.falseAlarms).toEqual([{ id: "m1", text: { en: "Hello" }, where: "message" }]);
  });

  it("carries the tactic, the evidence text and where it was", () => {
    const [flag] = computeDebrief(validScenario(), run({ seen: ["m2"], flagged: ["m2"] })).caught;
    expect(flag).toMatchObject({
      tactic: "pay-to-earn",
      evidenceText: { en: "Send ₹500 to earn ₹5,000" },
      where: "message",
    });
  });
});

describe("computeDebrief with evidence", () => {
  it("catches a flag on a single phrase", () => {
    const result = computeDebrief(
      richScenario(),
      run({ seen: ["dm-1", "dm-pay", "dm-role"], flagged: ["dm-pay"], visited: ["dm"] }),
    );
    expect(result.caught.map((f) => f.redFlagId)).toEqual(["fee"]);
    expect(result.caught[0]?.evidenceText).toEqual({ en: "Pay ₹999 to register." });
  });

  it("treats a flagged harmless phrase as a false alarm", () => {
    const result = computeDebrief(
      richScenario(),
      run({ seen: ["dm-role"], flagged: ["dm-role"], visited: ["dm"] }),
    );
    expect(result.falseAlarms.map((a) => a.id)).toEqual(["dm-role"]);
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
    const result = computeDebrief(
      richScenario(),
      run({
        seen: ["p-joined", "reply-to-field"],
        flagged: ["p-joined", "reply-to-field"],
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
