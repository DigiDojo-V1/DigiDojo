import { defineScenario } from "@/engine/define";

/** Placeholder until this dojo's first real scenario lands. Delete it then. */
export const comingSoon = defineScenario({
  id: "coming-soon",
  dojoId: "trust-me-bro",
  title: "Coming soon",
  summary: "Scenarios for this dojo are being built.",
  legit: false,
  startNodeId: "coming-soon",
  nodes: {
    "coming-soon": {
      kind: "outcome",
      result: "safe",
      title: "Coming soon",
      body: "This dojo is still being built. Check back soon!",
    },
  },
  redFlags: {},
  debrief: {
    rule: "Whenever someone asks for money or an OTP, stop and think.",
    realWorldAction: "Scammed? Call 1930 right away and report at cybercrime.gov.in.",
  },
});
