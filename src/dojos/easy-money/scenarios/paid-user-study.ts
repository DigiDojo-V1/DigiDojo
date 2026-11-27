import { defineScenario } from "@/engine/define";
import { EMAIL_STUDY } from "../content/emails";
import { pickPanels } from "../content/evidence";

/**
 * Legit twin: a genuine paid user-research invite. Rejecting it is a missed opportunity, and
 * any flag is a false alarm. Source: docs/scenarios/easy-money/paid-user-study.md.
 */
export const paidUserStudy = defineScenario({
  id: "paid-user-study",
  dojoId: "easy-money",
  title: "Paid for your opinion",
  summary:
    "A startup offers ₹500 for a 30-minute video call about how you split bills. Accept or ignore?",
  legit: true,
  primer: {
    title: "Not every offer is a scam",
    body: "Some companies really do pay students for their time and opinions. Check who's asking, what they want from you, and which way the money flows.",
    setup:
      "You're Rohan. Last Friday at your college fest, you filled in a short form at a startup's stall to join their student research panel. Today, an email arrives.",
  },
  startNodeId: "study-invite",

  nodes: {
    "study-invite": {
      kind: "email",
      app: "gmail",
      email: EMAIL_STUDY,
      evidence: ["kosha-research-page"],
      choices: [
        { label: "Book a slot on their research page", nextNodeId: "booked" },
        { label: "Ignore it. Nobody pays ₹500 for a chat", nextNodeId: "missed" },
      ],
    },
    booked: {
      kind: "outcome",
      result: "safe",
      title: "₹500 for your opinion",
      body: "You booked through their own research page and talked for 30 minutes. The ₹500 reached your UPI three days later. You gave your time, nothing else.",
      moneyDelta: 500,
    },
    missed: {
      kind: "outcome",
      result: "missed-opportunity",
      title: "You turned down a real ₹500",
      body: "This one was genuine: you'd signed up yourself, the email came from the same domain as Kosha's own research page, it named the researcher, and it paid after the work while asking for nothing but your time.",
      rewindToNodeId: "study-invite",
    },
  },

  evidence: pickPanels(["kosha-research-page", "consent-form"]),
  redFlags: {},

  debrief: {
    rule: "Getting paid for real work is normal. Paying to get paid, or lending your account, isn't.",
    summary:
      "This invite checked out. You had signed up yourself, the email came from the same domain as Kosha's own research page, it named the researcher, and ₹500 fits a one-off 30-minute call. The money flowed one way, to you, after the work. It asked for no fee, no bank login and no app. Compare the task scam: a small payout first, then a “prepaid task” where you send the money.",
    realWorldAction:
      "Not sure an offer is real? Find the company's website yourself and contact them from there. If you've already paid someone, call 1930 and report at cybercrime.gov.in.",
  },
});
