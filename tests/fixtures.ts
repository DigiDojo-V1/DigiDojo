import type { Scenario } from "@/engine/schema";

/** A small valid scenario. Tests clone it and break one rule at a time. */
export function validScenario(): Scenario {
  return {
    id: "fixture",
    dojoId: "easy-money",
    title: "Fixture",
    summary: "A test scenario.",
    legit: false,
    primer: { title: "Primer", body: "Watch out." },
    startNodeId: "start",
    nodes: {
      start: {
        kind: "thread",
        app: "whatsapp",
        contact: { name: "Stranger" },
        messages: [
          { id: "m1", from: "them", text: "Hello" },
          { id: "m2", from: "them", text: "Send ₹500 to earn ₹5,000", redFlagId: "pay-first" },
        ],
        choices: [
          { label: "Pay", nextNodeId: "follow-up" },
          { label: "Block", nextNodeId: "safe" },
        ],
      },
      "follow-up": {
        kind: "thread",
        app: "whatsapp",
        contact: { name: "Stranger" },
        messages: [{ id: "m3", from: "them", text: "Only 2 minutes left!", redFlagId: "hurry" }],
        choices: [{ label: "Pay again", nextNodeId: "lost" }],
      },
      safe: { kind: "outcome", result: "safe", title: "Safe", body: "You blocked them." },
      lost: {
        kind: "outcome",
        result: "loss",
        title: "Lost",
        body: "You lost ₹1,000.",
        moneyDelta: -1000,
        rewindToNodeId: "start",
      },
    },
    redFlags: {
      "pay-first": { label: "Pay first", tactic: "pay-to-earn", explanation: "Pay to earn." },
      hurry: { label: "Hurry", tactic: "urgency", explanation: "Fake deadline." },
    },
    debrief: { rule: "Never pay to earn.", realWorldAction: "Call 1930." },
  };
}
