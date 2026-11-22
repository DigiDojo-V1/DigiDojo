import { describe, expect, it } from "vitest";
import { priorTranscript } from "@/engine/transcript";
import { validScenario } from "./fixtures";

describe("priorTranscript", () => {
  it("is empty on the first node", () => {
    expect(priorTranscript(validScenario(), [{ nodeId: "start" }])).toEqual([]);
  });

  it("carries earlier messages and the chosen reply into the same chat", () => {
    const bubbles = priorTranscript(validScenario(), [
      { nodeId: "start", choiceLabel: "Pay" },
      { nodeId: "follow-up" },
    ]);
    expect(bubbles.map((b) => [b.from, b.text])).toEqual([
      ["them", "Hello"],
      ["them", "Send ₹500 to earn ₹5,000"],
      ["me", "Pay"],
    ]);
    expect(bubbles.at(-1)?.flaggable).toBe(false);
  });

  it("starts fresh when the contact changes", () => {
    const s = validScenario();
    const followUp = s.nodes["follow-up"];
    if (followUp?.kind !== "thread") throw new Error("fixture");
    followUp.contact = { name: "Someone else" };
    expect(
      priorTranscript(s, [{ nodeId: "start", choiceLabel: "Pay" }, { nodeId: "follow-up" }]),
    ).toEqual([]);
  });
});
