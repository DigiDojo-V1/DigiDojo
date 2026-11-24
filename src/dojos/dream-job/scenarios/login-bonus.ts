import { defineScenario } from "@/engine/define";
import { EMAIL_LOGIN, redFlagIdsIn } from "../content/emails";
import { pickPanels } from "../content/evidence";
import { pickRedFlags } from "../content/red-flags";
import { REAL_WORLD_ACTION } from "../content/universe";

/**
 * Bonus: gmail-login-06 ("No money, just your login"). Source: blueprint section 4B.
 * The game never shows a password field: choosing to sign in goes straight to the outcome.
 */
export const loginBonus = defineScenario({
  id: "login-bonus",
  dojoId: "dream-job",
  title: "No money, just your login",
  summary: "Bonus: your candidate account is ready. Just sign in.",
  legit: false,
  startNodeId: "gmail-login",

  nodes: {
    "gmail-login": {
      kind: "email",
      app: "gmail",
      email: EMAIL_LOGIN,
      evidence: ["nexora-careers"],
      choices: [
        {
          label: "Complete onboarding and sign in with your mailbox password",
          nextNodeId: "mailbox-taken",
        },
        { label: "Don't sign in, and report the email", nextNodeId: "safe" },
      ],
    },
    "mailbox-taken": {
      kind: "outcome",
      result: "compromised",
      title: "Your mailbox was taken over",
      body: "The portal at nexora.example.candidate-portal.example was fake. With your password, the scammers took over your mailbox and sent messages to your contacts. (No password was asked for or stored: this is a simulation.)",
      rewindToNodeId: "gmail-login",
    },
    safe: {
      kind: "outcome",
      result: "safe",
      title: "You kept your password",
      body: "The link said careers.nexora.example but went to candidate-portal.example. A recruiter never needs your personal email password.",
    },
  },

  evidence: pickPanels(["nexora-careers"]),
  redFlags: pickRedFlags(redFlagIdsIn([EMAIL_LOGIN])),

  debrief: {
    rule: "A recruiter never needs your email password.",
    summary:
      "Check the actual link destination: a link can display a familiar company name while going elsewhere. The official careers host is careers.nexora.example; nexora.example.candidate-portal.example is a different site.",
    realWorldAction: REAL_WORLD_ACTION,
  },
});
