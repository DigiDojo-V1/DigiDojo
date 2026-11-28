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
  title: { en: "No money, just your login", hinglish: "Paisa nahi, bas tumhara login" },
  summary: {
    en: "Bonus: your candidate account is ready. Just sign in.",
    hinglish: "Bonus: tumhara candidate account ready hai. Bas sign in karo.",
  },
  legit: false,
  primer: {
    title: { en: "No money, just your login", hinglish: "Paisa nahi, bas tumhara login" },
    body: {
      en: "Read the email, check where it wants to take you, then decide what to do.",
      hinglish:
        "Email padho, check karo ki woh tumhe kahan le jaana chahta hai, phir decide karo kya karna hai.",
    },
    setup: {
      en: "You're Ananya. You've been applying for internships, and an email says your candidate account is ready. All you have to do is sign in to see your offer documents.",
      hinglish:
        "Tum Ananya ho. Tum internships ke liye apply kar rahi ho, aur ek email kehta hai ki tumhara candidate account ready hai. Offer documents dekhne ke liye bas sign in karna hai.",
    },
  },
  startNodeId: "gmail-login",

  nodes: {
    "gmail-login": {
      kind: "email",
      app: "gmail",
      email: EMAIL_LOGIN,
      evidence: ["nexora-careers"],
      choices: [
        {
          label: {
            en: "Complete onboarding and sign in with your mailbox password",
            hinglish: "Onboarding poora karo aur apne email password se sign in karo",
          },
          nextNodeId: "mailbox-taken",
        },
        {
          label: {
            en: "Don't sign in, and report the email",
            hinglish: "Sign in mat karo, aur email report karo",
          },
          nextNodeId: "safe",
        },
      ],
    },
    "mailbox-taken": {
      kind: "outcome",
      result: "compromised",
      title: { en: "Your mailbox was taken over", hinglish: "Tumhara email account hack ho gaya" },
      body: {
        en: "The portal at nexora.example.candidate-portal.example was fake. With your password, the scammers took over your mailbox and sent messages to your contacts. (No password was asked for or stored: this is a simulation.)",
        hinglish:
          "nexora.example.candidate-portal.example wala portal fake tha. Tumhare password se scammers ne tumhara mailbox le liya aur tumhare contacts ko messages bheje. (Koi password na maanga gaya, na store hua: yeh simulation hai.)",
      },
      rewindToNodeId: "gmail-login",
    },
    safe: {
      kind: "outcome",
      result: "safe",
      title: { en: "You kept your password", hinglish: "Tumhara password safe raha" },
      body: {
        en: "The link said careers.nexora.example but went to candidate-portal.example. A recruiter never needs your personal email password.",
        hinglish:
          "Link pe careers.nexora.example likha tha par woh candidate-portal.example pe gaya. Kisi recruiter ko kabhi tumhare personal email ka password nahi chahiye.",
      },
    },
  },

  evidence: pickPanels(["nexora-careers"]),
  redFlags: pickRedFlags(redFlagIdsIn([EMAIL_LOGIN])),

  debrief: {
    rule: {
      en: "A recruiter never needs your email password.",
      hinglish: "Kisi recruiter ko kabhi tumhara email password nahi chahiye.",
    },
    summary: {
      en: "Check the actual link destination: a link can display a familiar company name while going elsewhere. The official careers host is careers.nexora.example; nexora.example.candidate-portal.example is a different site.",
      hinglish:
        "Link ka asli destination check karo: link pe jaani-pehchaani company ka naam dikh sakta hai par woh kahin aur le ja sakta hai. Official careers host careers.nexora.example hai; nexora.example.candidate-portal.example ek alag site hai.",
    },
    realWorldAction: REAL_WORLD_ACTION,
  },
});
