import { defineScenario } from "@/engine/define";

/** Placeholder until this dojo's first real scenario lands. Delete it then. */
export const comingSoon = defineScenario({
  id: "coming-soon",
  dojoId: "dream-job",
  title: "Coming soon",
  summary: "Is dojo ke scenarios abhi ban rahe hain.",
  legit: false,
  startNodeId: "coming-soon",
  nodes: {
    "coming-soon": {
      kind: "outcome",
      result: "safe",
      title: "Coming soon",
      body: "Yeh dojo abhi ban raha hai. Jald hi wapas aana!",
    },
  },
  redFlags: {},
  debrief: {
    rule: "Jab bhi koi paise ya OTP maange, ruko aur socho.",
    realWorldAction: "Fraud hua? Turant 1930 pe call karo aur cybercrime.gov.in pe report karo.",
  },
});
