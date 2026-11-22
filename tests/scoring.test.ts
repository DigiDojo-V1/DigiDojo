import { describe, expect, it } from "vitest";
import { computeDebrief } from "@/engine/scoring";
import { validScenario } from "./fixtures";

describe("computeDebrief", () => {
  it("splits red flags into caught, missed and not reached", () => {
    const result = computeDebrief(validScenario(), ["m1", "m2"], ["m2"]);
    expect(result.caught.map((f) => f.redFlagId)).toEqual(["pay-first"]);
    expect(result.missed).toEqual([]);
    expect(result.notReached.map((f) => f.redFlagId)).toEqual(["hurry"]);
    expect(result.falseAlarms).toEqual([]);
  });

  it("counts a seen but unflagged red flag as missed", () => {
    const result = computeDebrief(validScenario(), ["m1", "m2", "m3"], []);
    expect(result.missed.map((f) => f.redFlagId)).toEqual(["pay-first", "hurry"]);
    expect(result.caught).toEqual([]);
  });

  it("counts a flagged message with no red flag as a false alarm", () => {
    const result = computeDebrief(validScenario(), ["m1", "m2"], ["m1"]);
    expect(result.falseAlarms).toEqual([{ messageId: "m1", text: { en: "Hello" } }]);
  });

  it("carries the tactic and the message text", () => {
    const [flag] = computeDebrief(validScenario(), ["m2"], ["m2"]).caught;
    expect(flag).toMatchObject({
      tactic: "pay-to-earn",
      messageText: { en: "Send ₹500 to earn ₹5,000" },
    });
  });
});
