import type { Tactic } from "./schema";

/** Manipulation tactics: a short label and one Hinglish line the debrief shows the player. */
export const TACTICS_INFO: Record<Tactic, { label: string; explanation: string }> = {
  "small-win-first": {
    label: "Small win first",
    explanation: "Pehle thode paise dete hain, taaki tum unpe bada bharosa kar lo.",
  },
  "pay-to-earn": {
    label: "Pay to earn",
    explanation: "Kamane se pehle paise bharne ko kehte hain. Asli kaam mein aisa kabhi nahi hota.",
  },
  urgency: {
    label: "Urgency",
    explanation: "Time ka pressure daalte hain taaki tum soch na sako ya kisi se pooch na sako.",
  },
  "social-proof": {
    label: "Social proof",
    explanation: "Fake members aur screenshots se lagta hai ki sab kama rahe hain.",
  },
  "sunk-cost": {
    label: "Sunk cost",
    explanation: "Ek baar paise de diye, toh woh 'unlock' karne ke naam pe aur maangte hain.",
  },
  authority: {
    label: "Authority",
    explanation: "Police, bank ya officer ban ke darate hain taaki tum bina check kiye maan lo.",
  },
  isolation: {
    label: "Isolation",
    explanation: "Kehte hain kisi ko mat batana, taaki koi tumhe warn na kar sake.",
  },
  "too-good-to-be-true": {
    label: "Too good to be true",
    explanation: "Kaam ke hisaab se paisa ya inaam bahut zyada hai.",
  },
  flattery: {
    label: "Flattery",
    explanation: "Tareef aur 'aap special selected ho' sun ke guard neeche aa jaata hai.",
  },
  impersonation: {
    label: "Impersonation",
    explanation: "Kisi jaan-pehchaan wale ya bharosemand insaan ki nakal karte hain.",
  },
};
