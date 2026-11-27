import type { EmailInput } from "@/engine/schema";
import { KOSHA, PLAYER } from "./universe";

/**
 * The Easy Money emails. Every address, link and file is simulation data: links are shown as
 * text and never opened.
 */

/** `study-invite`: Kosha's genuine paid research invite (the legit twin). */
export const EMAIL_STUDY = {
  displayName: `Meera Iyer | ${KOSHA.name}`,
  from: { id: "study-from", address: `meera.iyer@${KOSHA.domain}` },
  replyTo: { id: "study-reply-to", address: `meera.iyer@${KOSHA.domain}` },
  to: { id: "study-to", address: PLAYER.email },
  date: "25 Nov 2026, 10:40",
  subject: "Your Kosha research session: 30 min, ₹500 thank-you",
  preview:
    "Thanks for joining our student panel at your college fest. Pick a slot for a 30-minute call.",
  body: [
    [{ text: "Hi Rohan," }],
    [
      {
        text: "Thanks for joining the Kosha student research panel at our stall at your college fest last Friday.",
      },
    ],
    [
      {
        text: "We're redesigning how students split bills in the Kosha app, and we'd like to hear how you do it today. It's a 30-minute video call with me. There are no right or wrong answers, and you don't need to install anything.",
      },
    ],
    [
      {
        text: "As a thank-you, we pay ₹500 to your UPI ID within 3 working days after the session. We will never ask you to pay anything, or for your bank login, card details or an OTP.",
      },
    ],
    [
      {
        text: `If you'd like to take part, pick a slot on our research page: ${KOSHA.researchHost}. The consent form is attached so you can read what we record before you decide.`,
      },
    ],
    [{ text: "If you'd rather not, just ignore this email." }],
    [{ text: "Thanks,\nMeera Iyer\nUser Researcher, Kosha" }],
  ],
  attachments: [
    {
      id: "study-consent-file",
      shownName: "Kosha_Research_Consent.pdf",
      fullName: "Kosha_Research_Consent.pdf",
      actualType: "PDF document",
      documentId: "consent-form",
    },
  ],
  links: [{ id: "study-link", text: KOSHA.researchHost, actualUrl: KOSHA.researchUrl }],
} satisfies EmailInput;
