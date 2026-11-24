import { defineScenario } from "@/engine/define";
import { documentsFor, EMAIL_MEDIUM, redFlagIdsIn } from "../content/emails";
import { pickPanels } from "../content/evidence";
import { pickRedFlags } from "../content/red-flags";
import { REAL_WORLD_ACTION } from "../content/universe";

/**
 * Medium: LI-MED-02 ("Let's continue on WhatsApp") → gmail-medium-02 ("The polished email
 * with the hidden clause"). Source: docs/scenarios/dream-job/blueprint.docx, sections 2 and 3.
 * The opening message is plausible on purpose and carries no red flag.
 */
export const mediumWhatsapp = defineScenario({
  id: "medium-whatsapp",
  dojoId: "dream-job",
  title: "Let's continue on WhatsApp",
  summary:
    "A normal-looking recruiter message, then a WhatsApp screening and a polished offer email.",
  legit: false,
  primer: {
    title: "Read the whole conversation",
    body: "Don't flag the first message just because it's a recruiter. Watch how the conversation develops.",
  },
  startNodeId: "li-open",

  nodes: {
    "li-open": {
      kind: "thread",
      app: "linkedin",
      contact: {
        name: "Aditi Sharma",
        subtitle: "Senior Talent Acquisition Executive | Nexora Technologies",
      },
      messages: [
        { id: "li-med-date", from: "system", text: "20 November 2026, 11:05", delayMs: 300 },
        {
          id: "li-med-m1",
          from: "them",
          delayMs: 1200,
          text: "Hi Ananya, I came across your profile and noticed your economics coursework and Excel-based project. We have an opening for a Business Research Intern at Nexora Technologies in Bengaluru (hybrid). The internship runs for three months and offers ₹18,000 per month. The role involves desk research, cleaning basic data in Excel and preparing short market summaries.\n\nI would like to arrange a short introductory discussion. Are you available tomorrow between 11:00 AM and 2:00 PM? I can share the detailed role description before the call.",
        },
      ],
      evidence: ["aditi-profile", "nexora-company", "nexora-careers"],
      choices: [
        {
          label:
            "Thanks for reaching out. I’m interested. Please share the official job description and details of the interview process. I’m available tomorrow after 12:00 PM.",
          nextNodeId: "li-move",
        },
      ],
    },

    "li-move": {
      kind: "thread",
      app: "linkedin",
      contact: {
        name: "Aditi Sharma",
        subtitle: "Senior Talent Acquisition Executive | Nexora Technologies",
      },
      messages: [
        {
          id: "li-med-m2",
          from: "them",
          delayMs: 1400,
          segments: [
            { text: "Thanks, Ananya. " },
            {
              id: "li-med-whatsapp",
              text: "Our team is handling first-round screening on WhatsApp because our video calendar is full.",
              redFlagId: "li-off-platform",
            },
            { text: " Please message +91 90000 12345 and mention reference NX-INT-42. " },
            {
              id: "li-med-text-only",
              text: "The screening will be a short text conversation with three questions. We do not need to schedule a video call at this stage.",
              redFlagId: "li-text-only-interview",
            },
          ],
        },
      ],
      evidence: ["aditi-profile", "nexora-company", "nexora-careers"],
      choices: [
        { label: "Continue to WhatsApp", nextNodeId: "wa-screen" },
        {
          label: "Decline the WhatsApp screening and check Nexora's careers page instead",
          nextNodeId: "safe-early",
        },
      ],
    },

    "wa-screen": {
      kind: "thread",
      app: "whatsapp",
      contact: { name: "+91 90000 12345", subtitle: "Ref NX-INT-42" },
      messages: [
        {
          id: "wa-inert",
          from: "system",
          text: "Simulated chat. This number can't be called or messaged.",
          delayMs: 300,
        },
        {
          id: "wa-me-hello",
          from: "me",
          text: "Hello, this is Ananya. I’m here for the Business Research Intern screening.",
          delayMs: 600,
        },
        {
          id: "wa-questions",
          from: "system",
          text: "Three screening questions later",
          delayMs: 900,
        },
        {
          id: "wa-m3",
          from: "them",
          delayMs: 1500,
          segments: [
            {
              id: "wa-selected",
              text: "Your answers were excellent. Congratulations, you are selected!",
              redFlagId: "wa-thin-selection",
            },
            { text: " " },
            {
              id: "wa-deposit",
              text: "To allocate your company laptop, please pay a refundable security deposit of ₹2,499",
              redFlagId: "wa-deposit",
            },
            { text: " " },
            {
              id: "wa-partner",
              text: "to our equipment partner.",
              redFlagId: "wa-unverified-payee",
            },
            {
              text: " The amount will be returned with your first stipend or when you return the laptop. Make the payment today so we can dispatch it before onboarding.",
            },
          ],
        },
      ],
      choices: [
        { label: "Pay the ₹2,499 deposit", nextNodeId: "wa-paid" },
        { label: "Don't pay", nextNodeId: "gmail-medium" },
      ],
    },

    "gmail-medium": {
      kind: "email",
      app: "gmail",
      email: EMAIL_MEDIUM,
      evidence: ["nexora-company"],
      choices: [
        { label: "Reply to confirm acceptance", nextNodeId: "reply" },
        { label: "Don't reply, and report the email", nextNodeId: "safe" },
      ],
    },

    reply: {
      kind: "compose",
      app: "gmail",
      to: {
        id: "reply-to-field",
        address: "nexora.onboarding.desk@gmail.com",
        redFlagId: "mail-reply-to-mismatch",
      },
      subject: "Re: Offer Letter: Business Research Intern | Nexora Technologies",
      body: "Thank you. I confirm my acceptance of the offer.",
      choices: [
        { label: "Send", nextNodeId: "reply-sent" },
        { label: "Don't send. Go back and check the email", nextNodeId: "gmail-medium" },
      ],
    },

    "wa-paid": {
      kind: "outcome",
      result: "loss",
      title: "₹2,499 deposit gone",
      body: "The “equipment partner” was not Nexora, and the deposit never came back. Genuine recruitment does not require a laptop or refundable deposit.",
      moneyDelta: -2499,
      rewindToNodeId: "wa-screen",
    },
    "reply-sent": {
      kind: "outcome",
      result: "loss",
      title: "Your reply went to Gmail",
      body: "Your acceptance went to nexora.onboarding.desk@gmail.com, not Nexora. The “onboarding desk” pointed you to clause 8.4 and you paid the ₹2,499 laptop deposit. A refundable fee is still a fee.",
      moneyDelta: -2499,
      rewindToNodeId: "gmail-medium",
    },
    "safe-early": {
      kind: "outcome",
      result: "safe",
      title: "You stayed on the official process",
      body: "You declined a text-only screening on WhatsApp. A real recruiter can interview you with identifiable people through the company's own process.",
    },
    safe: {
      kind: "outcome",
      result: "safe",
      title: "You didn't reply",
      body: "You reported the email instead of replying. Nothing was paid and nothing was shared.",
    },
  },

  evidence: {
    ...pickPanels(["aditi-profile", "nexora-company", "nexora-careers"]),
    ...documentsFor([EMAIL_MEDIUM]),
  },
  redFlags: pickRedFlags([
    "li-off-platform",
    "li-text-only-interview",
    "wa-thin-selection",
    "wa-deposit",
    "wa-unverified-payee",
    ...redFlagIdsIn([EMAIL_MEDIUM]),
  ]),

  debrief: {
    rule: "Do not judge a recruiter only by the first message. Read the whole conversation.",
    summary:
      "The first message was designed to look normal. The scam becomes visible later: the recruiter avoids a proper interview, shifts the conversation to WhatsApp and asks for a “refundable” laptop deposit. A polished email does not make the sender genuine: tap the sender name to inspect the full From and Reply-To fields, open the offer letter and read the terms, and check the To field on the reply screen before sending.",
    realWorldAction: REAL_WORLD_ACTION,
  },
});
