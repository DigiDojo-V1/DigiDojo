import { defineScenario } from "@/engine/define";
import { documentsFor, EMAIL_EASY, redFlagIdsIn } from "../content/emails";
import { pickPanels } from "../content/evidence";
import { pickRedFlags } from "../content/red-flags";
import { REAL_WORLD_ACTION } from "../content/universe";

/**
 * Easy: LI-EASY-01 ("Too good to be true") → gmail-easy-01 ("The offer letter that came from
 * nowhere"). Source: docs/scenarios/dream-job/blueprint.docx, sections 2 and 3.
 */
export const easyTooGood = defineScenario({
  id: "easy-too-good",
  dojoId: "dream-job",
  title: "Too good to be true",
  summary:
    "A recruiter says you're selected for a ₹40,000 internship. Then an offer letter arrives.",
  legit: false,
  primer: {
    title: "Too good to be true",
    body: "Read the recruiter's message and tap the parts that look suspicious. Then check the email that follows.",
  },
  startNodeId: "li-dm",

  nodes: {
    "li-dm": {
      kind: "thread",
      app: "linkedin",
      contact: { name: "Karan Sethi", subtitle: "HR Associate | Nexora Technologies" },
      messages: [
        { id: "li-easy-date", from: "system", text: "19 November 2026, 09:12", delayMs: 300 },
        {
          id: "li-easy-offer",
          from: "them",
          time: "09:12",
          delayMs: 1200,
          segments: [
            { text: "Hi Ananya! " },
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
        { label: "Reply “YES” and pay the ₹1,499 fee", nextNodeId: "li-paid" },
        { label: "Don't reply", nextNodeId: "gmail-easy" },
      ],
    },

    "gmail-easy": {
      kind: "email",
      app: "gmail",
      email: EMAIL_EASY,
      evidence: ["nexora-careers"],
      choices: [
        { label: "Pay ₹2,999 to the UPI ID", nextNodeId: "mail-paid" },
        { label: "Delete the email and report it as a scam", nextNodeId: "safe" },
      ],
    },

    "li-paid": {
      kind: "outcome",
      result: "loss",
      title: "₹1,499 gone",
      body: "You paid the “refundable” fee to karan.sethi@okaxis, an individual's UPI ID, not Nexora. Genuine recruitment never needs a registration fee.",
      moneyDelta: -1499,
      rewindToNodeId: "li-dm",
    },
    "mail-paid": {
      kind: "outcome",
      result: "loss",
      title: "₹2,999 gone",
      body: "You paid ₹2,999 to karan.sethi@okaxis, an individual's UPI ID. No joining confirmation arrived. Genuine recruitment never needs a registration or verification fee.",
      moneyDelta: -2999,
      rewindToNodeId: "gmail-easy",
    },
    safe: {
      kind: "outcome",
      result: "safe",
      title: "You didn't pay",
      body: "You ignored the message and reported the email. Nexora's own careers page lists this internship at ₹18,000 a month, not ₹40,000 with a fee.",
    },
  },

  evidence: {
    ...pickPanels(["karan-profile", "nexora-company", "nexora-careers"]),
    ...documentsFor([EMAIL_EASY]),
  },
  redFlags: pickRedFlags([
    "li-never-applied",
    "li-pay-too-high",
    "li-no-interview",
    "li-vague-duties",
    "li-fee",
    "li-personal-upi",
    "li-urgency",
    ...redFlagIdsIn([EMAIL_EASY]),
  ]),

  debrief: {
    rule: "A real employer does not charge you to get a job.",
    summary:
      "An unsolicited offer, instant selection, unusually high pay, vague duties and a payment deadline are not separate little inconveniences; together they are a strong scam pattern. The sender's display name is editable text: the real sender address is what matters. Verify the vacancy through the company website you find independently.",
    realWorldAction: REAL_WORLD_ACTION,
  },
});
