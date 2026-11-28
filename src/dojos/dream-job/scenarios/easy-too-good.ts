import { defineScenario } from "@/engine/define";
import { pickPanels } from "../content/evidence";
import { pickRedFlags } from "../content/red-flags";
import { REAL_WORLD_ACTION } from "../content/universe";

/**
 * Easy: LI-EASY-01 ("Too good to be true"). Source: docs/scenarios/dream-job/blueprint.docx,
 * section 2. Its follow-up email (gmail-easy-01) is played in the inbox triage scenario.
 */
export const easyTooGood = defineScenario({
  id: "easy-too-good",
  dojoId: "dream-job",
  title: { en: "Too good to be true", hinglish: "Itna achha ki sach na lage" },
  summary: {
    en: "A recruiter says you're selected for a ₹40,000 internship. All you have to do is pay.",
    hinglish:
      "Ek recruiter kehta hai ki tum ₹40,000 ki internship ke liye select ho gaye. Bas tumhe paise bharne hain.",
  },
  legit: false,
  primer: {
    title: { en: "Too good to be true", hinglish: "Itna achha ki sach na lage" },
    body: {
      en: "Read the recruiter's message, flag the parts that look suspicious, then decide what to do.",
      hinglish:
        "Recruiter ka message padho, jo hissa suspicious lage use flag karo, phir decide karo kya karna hai.",
    },
    setup: {
      en: "You're Ananya, a final-year economics student. You've been sending internship applications for weeks and heard nothing back. One morning, a LinkedIn message pops up.",
      hinglish:
        "Tum Ananya ho, economics final year ki student. Hafton se internship applications bhej rahi ho, par kahin se jawab nahi aaya. Ek subah LinkedIn pe ek message aata hai.",
    },
    watchFor: [
      {
        en: "Do I remember applying for this?",
        hinglish: "Kya mujhe yaad hai ki maine iske liye apply kiya tha?",
      },
      {
        en: "Does the pay make sense for the work?",
        hinglish: "Kya kaam ke hisaab se pay sahi lagta hai?",
      },
      {
        en: "Is anyone asking me for money, and why?",
        hinglish: "Kya koi mujhse paise maang raha hai, aur kyun?",
      },
    ],
  },
  startNodeId: "li-dm",

  nodes: {
    "li-dm": {
      kind: "thread",
      app: "linkedin",
      contact: {
        name: { en: "Karan Sethi", hinglish: "Karan Sethi" },
        subtitle: "HR Associate | Nexora Technologies",
      },
      messages: [
        { id: "li-easy-date", from: "system", text: "19 November 2026, 09:12", delayMs: 300 },
        {
          id: "li-easy-offer",
          from: "them",
          time: "09:12",
          delayMs: 1200,
          segments: [
            { text: "Hi Ananya! I’m Karan from the hiring team at Nexora Technologies. " },
            {
              id: "li-easy-selected",
              text: "Congratulations! We have reviewed your profile and you have been selected for our Work-From-Home Business Research Internship at Nexora Technologies.",
              redFlagId: "li-never-applied",
            },
            { text: " " },
            {
              id: "li-easy-pay",
              text: "You will receive ₹40,000 per month for just two hours of work per day.",
              redFlagId: "li-pay-too-high",
            },
            { text: " " },
            {
              id: "li-easy-no-interview",
              text: "No interview is needed because the hiring team has already shortlisted you from LinkedIn.",
              redFlagId: "li-no-interview",
            },
            {
              text: "\n\nThe role involves basic online research, spreadsheet updates and data entry; ",
            },
            {
              id: "li-easy-vague",
              text: "the complete job description will be shared after registration.",
              redFlagId: "li-vague-duties",
            },
            { text: " To reserve your seat, " },
            {
              id: "li-easy-fee",
              text: "pay a refundable registration and verification fee of ₹1,499",
              redFlagId: "li-fee",
            },
            { text: " " },
            { id: "li-easy-deadline", text: "by 8:00 PM today", redFlagId: "li-urgency" },
            { text: " to our " },
            {
              id: "li-easy-upi",
              text: "HR coordinator’s UPI ID: karan.sethi@okaxis",
              redFlagId: "li-personal-upi",
            },
            { text: ".\n\n" },
            {
              id: "li-easy-seats",
              text: "Only two seats are left, and the offer will automatically expire tonight.",
              redFlagId: "li-urgency",
            },
            {
              text: " Reply “YES” and send the payment screenshot to receive your offer letter.",
            },
          ],
        },
      ],
      evidence: ["karan-profile", "nexora-company", "nexora-careers"],
      choices: [
        {
          label: {
            en: "Reply “YES” and pay the ₹1,499 fee",
            hinglish: "“YES” reply karo aur ₹1,499 ki fee bharo",
          },
          nextNodeId: "li-paid",
        },
        { label: { en: "Don't reply", hinglish: "Reply mat karo" }, nextNodeId: "safe" },
      ],
    },

    "li-paid": {
      kind: "outcome",
      result: "loss",
      title: { en: "₹1,499 gone", hinglish: "₹1,499 gaye" },
      body: {
        en: "You paid the “refundable” fee to karan.sethi@okaxis, an individual's UPI ID, not Nexora. Genuine recruitment never needs a registration fee.",
        hinglish:
          "Tumne “refundable” fee karan.sethi@okaxis ko bhari, jo kisi ek insaan ki UPI ID hai, Nexora ki nahi. Genuine recruitment mein kabhi registration fee nahi lagti.",
      },
      moneyDelta: -1499,
      rewindToNodeId: "li-dm",
    },
    safe: {
      kind: "outcome",
      result: "safe",
      title: { en: "You didn't pay", hinglish: "Tumne paise nahi diye" },
      body: {
        en: "You didn't reply and kept your ₹1,499. Nexora's own careers page lists this internship at ₹18,000 a month, with no fee to apply. A real employer never asks you to pay to get hired.",
        hinglish:
          "Tumne reply nahi kiya aur tumhare ₹1,499 bach gaye. Nexora ke apne careers page pe yeh internship ₹18,000 mahine ki hai, aur apply karne ki koi fee nahi. Asli employer hire karne ke liye kabhi paise nahi maangta.",
      },
    },
  },

  evidence: {
    ...pickPanels(["karan-profile", "nexora-company", "nexora-careers"]),
  },
  redFlags: pickRedFlags([
    "li-never-applied",
    "li-pay-too-high",
    "li-no-interview",
    "li-vague-duties",
    "li-fee",
    "li-personal-upi",
    "li-urgency",
  ]),

  debrief: {
    rule: {
      en: "A real employer does not charge you to get a job.",
      hinglish: "Asli employer job dene ke liye tumse paise nahi leta.",
    },
    summary: {
      en: "An unsolicited offer, instant selection, unusually high pay, vague duties and a payment deadline are not separate little inconveniences; together they are a strong scam pattern. Verify the vacancy through the company website you find independently.",
      hinglish:
        "Bina maange offer, turant selection, bahut zyada pay, gol-mol kaam aur payment ki deadline, yeh alag-alag chhoti baatein nahi hain; saath mein yeh ek pakka scam pattern hain. Vacancy ko company ki us website se verify karo jo tumne khud dhoondhi ho.",
    },
    realWorldAction: REAL_WORLD_ACTION,
  },
});
