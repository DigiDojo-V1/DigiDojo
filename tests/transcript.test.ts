import { describe, expect, it } from "vitest";
import { priorTranscript } from "@/engine/transcript";
import { validScenario } from "./fixtures";

describe("priorTranscript", () => {
  it("is empty on the first node", () => {
    expect(priorTranscript(validScenario(), [{ nodeId: "start" }], "en")).toEqual([]);
  });

  it("carries earlier messages and the chosen reply into the same chat", () => {
    const bubbles = priorTranscript(
      validScenario(),
      [{ nodeId: "start", choiceLabel: { en: "Pay" } }, { nodeId: "follow-up" }],
      "en",
    );
    expect(bubbles.map((b) => [b.from, b.text])).toEqual([
      ["them", "Hello"],
      ["them", "Send ₹500 to earn ₹5,000"],
      ["me", "Pay"],
    ]);
    expect(bubbles.at(-1)?.flaggable).toBe(false);
  });

  it("shows Hinglish when present and English otherwise", () => {
    const s = validScenario();
    const start = s.nodes.start;
    if (start?.kind !== "thread") throw new Error("fixture");
    start.messages[0]!.text = { en: "Hello", hinglish: "Namaste" };
    const trail = [{ nodeId: "start", choiceLabel: { en: "Pay" } }, { nodeId: "follow-up" }];
    expect(priorTranscript(s, trail, "hinglish").map((b) => b.text)).toEqual([
      "Namaste",
      "Send ₹500 to earn ₹5,000",
      "Pay",
    ]);
    expect(priorTranscript(s, trail, "en")[0]?.text).toBe("Hello");
  });

  it("starts fresh when the contact changes", () => {
    const s = validScenario();
    const followUp = s.nodes["follow-up"];
    if (followUp?.kind !== "thread") throw new Error("fixture");
    followUp.contact = { name: { en: "Someone else" } };
    expect(
      priorTranscript(
        s,
        [{ nodeId: "start", choiceLabel: { en: "Pay" } }, { nodeId: "follow-up" }],
        "en",
      ),
    ).toEqual([]);
  });
});
