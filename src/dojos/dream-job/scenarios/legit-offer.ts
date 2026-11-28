import { defineScenario } from "@/engine/define";
import { documentsFor, EMAIL_LEGIT } from "../content/emails";
import { pickPanels } from "../content/evidence";
import { REAL_WORLD_ACTION } from "../content/universe";

/**
 * Control: GMAIL-LEGIT-03. A genuine offer. Rejecting it is a missed opportunity, and any flag
 * is a false alarm. Source: docs/scenarios/dream-job/blueprint.docx, section 4A.
 */
export const legitOffer = defineScenario({
  id: "legit-offer",
  dojoId: "dream-job",
  title: { en: "The written offer", hinglish: "Likha hua offer" },
  summary: {
    en: "After two interviews, an offer arrives. Accept it or walk away?",
    hinglish: "Do interviews ke baad ek offer aata hai. Accept karoge ya chhod doge?",
  },
  legit: true,
  primer: {
    title: { en: "The written offer", hinglish: "Likha hua offer" },
    body: {
      en: "Open the email, check who sent it and what it asks of you, then decide whether to accept.",
      hinglish:
        "Email kholo, check karo ki kisne bheja aur tumse kya maang raha hai, phir decide karo ki accept karna hai ya nahi.",
    },
    setup: {
      en: "You're Ananya. You've had two interviews with Nexora Technologies for a Business Research Intern role. Today, an email with a written offer lands in your inbox.",
      hinglish:
        "Tum Ananya ho. Business Research Intern role ke liye Nexora Technologies ke saath tumhare do interviews ho chuke hain. Aaj tumhare inbox mein ek likhe hue offer wala email aata hai.",
    },
  },
  startNodeId: "gmail-legit",

  nodes: {
    "gmail-legit": {
      kind: "email",
      app: "gmail",
      email: EMAIL_LEGIT,
      evidence: ["nexora-careers", "nexora-company"],
      choices: [
        {
          label: {
            en: "Accept through the official careers portal",
            hinglish: "Official careers portal se accept karo",
          },
          nextNodeId: "accepted",
        },
        {
          label: {
            en: "Reject it. Job offers by email are always scams",
            hinglish: "Reject karo. Email pe aane wale job offers hamesha scam hote hain",
          },
          nextNodeId: "missed",
        },
      ],
    },
    accepted: {
      kind: "outcome",
      result: "safe",
      title: { en: "You start on 1 December", hinglish: "Tum 1 December se shuru karoge" },
      body: {
        en: "This offer was verifiable: the official domain, two named interviews, a named manager, the role reference, the official careers portal and no fee.",
        hinglish:
          "Yeh offer verify ho sakta tha: official domain, do interviews jinke naam pata the, manager ka naam, role reference, official careers portal aur koi fee nahi.",
      },
    },
    missed: {
      kind: "outcome",
      result: "missed-opportunity",
      title: { en: "You turned down a real offer", hinglish: "Tumne ek asli offer thukra diya" },
      body: {
        en: "This one was genuine. It came from priya.nair@nexora.example after two named interviews, matched the role discussed, used careers.nexora.example and asked for no money. Documents come only after acceptance, through the verified process.",
        hinglish:
          "Yeh wala genuine tha. Yeh do interviews ke baad priya.nair@nexora.example se aaya, jis role ki baat hui thi usi se match karta tha, careers.nexora.example use karta tha aur koi paisa nahi maangta tha. Documents sirf accept karne ke baad, verified process se dene hote hain.",
      },
      rewindToNodeId: "gmail-legit",
    },
  },

  evidence: { ...pickPanels(["nexora-careers", "nexora-company"]), ...documentsFor([EMAIL_LEGIT]) },
  redFlags: {},

  debrief: {
    rule: {
      en: "Not every opportunity is a scam. Recognise a verifiable offer too.",
      hinglish: "Har mauka scam nahi hota. Verify ho sakne wale offer ko bhi pehchano.",
    },
    summary: {
      en: "The sender and Reply-To use the official company domain. The email follows two named interview stages and matches the role discussed. It includes a named reporting manager, role reference, stipend, duration and start date. The acceptance portal is on the official careers host, and no fee is requested.",
      hinglish:
        "Sender aur Reply-To dono official company domain use karte hain. Email do interview rounds ke baad aaya, jinke naam pata the, aur jis role ki baat hui thi usi se match karta hai. Usmein reporting manager ka naam, role reference, stipend, duration aur start date hai. Acceptance portal official careers host pe hai, aur koi fee nahi maangi gayi.",
    },
    realWorldAction: REAL_WORLD_ACTION,
  },
});
