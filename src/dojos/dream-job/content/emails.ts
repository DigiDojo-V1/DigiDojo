import type { EmailInput, EvidencePanelInput } from "@/engine/schema";
import { PANELS, type PanelId } from "./evidence";
import { NEXORA, PLAYER, ROLE } from "./universe";

/**
 * The Dream Job emails, written once (blueprint §3 to §5). The story scenarios open them one
 * at a time; the inbox triage shows five of them together. Every address, link and file is
 * simulation data: links are shown as text and never opened.
 */

const to = (id: string) => ({ id, address: PLAYER.email });

/** gmail-easy-01: "The offer letter that came from nowhere". */
export const EMAIL_EASY = {
  displayName: "Nexora HR",
  from: { id: "ge-from", address: "nexorahr.careers@gmail.com", redFlagId: "mail-free-sender" },
  // Easy: the free email address is visible without opening the details.
  showFromAddress: true,
  replyTo: { id: "ge-reply-to", address: "nexorahr.careers@gmail.com" },
  to: to("ge-to"),
  date: "19 Nov 2026, 09:14",
  subject: "Congratulations! Your Offer Letter — Business Research Intern",
  preview: "Congratulations! Your Offer Letter — ₹2,999 activation fee",
  body: [
    [{ id: "ge-greeting", text: "Dear Candidate,", redFlagId: "mail-generic-greeting" }],
    [
      { text: "Congratulations! " },
      {
        id: "ge-selected",
        text: `You have been selected for the ${ROLE.title} position at ${NEXORA.name}.`,
        redFlagId: "mail-never-applied",
      },
      { text: " " },
      {
        id: "ge-no-interview",
        text: "You do not need to attend any further interview.",
        redFlagId: "mail-no-interview",
      },
      { text: " " },
      {
        id: "ge-salary",
        text: "Your monthly salary will be ₹40,000.",
        redFlagId: "mail-high-salary",
      },
    ],
    [
      { text: "To activate your offer and complete registration, " },
      { id: "ge-fee", text: "pay ₹2,999 today", redFlagId: "mail-fee" },
      { text: " to our " },
      {
        id: "ge-upi",
        text: "HR coordinator’s UPI ID: karan.sethi@okaxis",
        redFlagId: "mail-personal-upi",
      },
      {
        text: ". This covers registration and background verification. Once payment is received, we will issue your joining confirmation.",
      },
    ],
    [
      {
        id: "ge-deadline",
        text: "Please complete the process within 24 hours because only a few seats remain.",
        redFlagId: "mail-urgency",
      },
    ],
    [{ text: "Regards,\nHR Manager\nNexora HR Team" }],
  ],
  attachments: [
    {
      id: "ge-file",
      shownName: "Ananya_Rao_Offer_Letter.pdf",
      fullName: "Ananya_Rao_Offer_Letter.pdf",
      actualType: "PDF document, 1 page",
      documentId: "easy-offer-pdf",
    },
  ],
} satisfies EmailInput;

/** gmail-medium-02: "The polished email with the hidden clause". */
export const EMAIL_MEDIUM = {
  displayName: "Aditi Sharma | Nexora Talent Acquisition",
  from: {
    id: "gm-from",
    address: "aditi.sharma@nex0ra.example",
    redFlagId: "mail-lookalike-domain",
  },
  replyTo: {
    id: "gm-reply-to",
    address: "nexora.onboarding.desk@gmail.com",
    redFlagId: "mail-reply-to-mismatch",
  },
  to: to("gm-to"),
  date: "21 Nov 2026, 10:06",
  subject: "Offer Letter: Business Research Intern | Nexora Technologies",
  preview: "Offer Letter: Business Research Intern — attachment included",
  body: [
    [{ text: "Dear Ananya," }],
    [
      {
        text: `Thank you for completing the recruitment discussion for the ${ROLE.title} position. We are pleased to move forward with your candidature.`,
      },
    ],
    [
      {
        text: "Please review the attached offer letter, which outlines your role, stipend and proposed joining date. Reply to confirm acceptance; our onboarding desk will then share the next steps.",
      },
    ],
    [{ text: `Regards,\nAditi Sharma\nTalent Acquisition\n${NEXORA.name}` }],
  ],
  attachments: [
    {
      id: "gm-file",
      shownName: "Ananya_Rao_Offer_Letter.pdf",
      fullName: "Ananya_Rao_Offer_Letter.pdf",
      actualType: "PDF document, 2 pages",
      documentId: "medium-offer-pdf",
    },
  ],
} satisfies EmailInput;

/** GMAIL-LEGIT-03: the genuine offer (positive control). */
export const EMAIL_LEGIT = {
  displayName: "Priya Nair | Nexora Technologies",
  from: { id: "gl-from", address: `priya.nair@${NEXORA.domain}` },
  replyTo: { id: "gl-reply-to", address: `priya.nair@${NEXORA.domain}` },
  to: to("gl-to"),
  date: "23 Nov 2026, 16:20",
  subject: `Written Offer | ${ROLE.title} | ${ROLE.reference}`,
  preview: `Written Offer | ${ROLE.title} | ${ROLE.reference}`,
  body: [
    [{ text: "Dear Ananya," }],
    [
      {
        text: `Following your interview with Research Manager Priya Nair on 21 November and the HR discussion on 22 November, we are pleased to offer you the position of ${ROLE.title} at ${NEXORA.legalName}.`,
      },
    ],
    [
      {
        text: `Role: ${ROLE.title}\nReference: ${ROLE.reference}\nLocation: Bengaluru, Karnataka (hybrid)\nDuration: 3 months\nStipend: ₹18,000 per month\nProposed start date: 1 December 2026\nReporting manager: Priya Nair, Research Manager`,
      },
    ],
    [
      {
        text: `The attached letter contains the role terms and joining details discussed during your interviews. You may review and accept it through our official careers portal at ${NEXORA.careersHost}/offers/${ROLE.reference}.`,
      },
      { text: " " },
      {
        text: "No payment is required at any stage. Identity and payroll documents will be requested only after you accept the written offer, through the verified company process.",
      },
    ],
    [{ text: `Regards,\nPriya Nair\nResearch Manager\n${NEXORA.legalName}` }],
  ],
  attachments: [
    {
      id: "gl-file",
      shownName: "Employment_Offer_Ananya_Rao.pdf",
      fullName: "Employment_Offer_Ananya_Rao.pdf",
      actualType: "PDF document",
      documentId: "legit-offer-pdf",
    },
  ],
  links: [
    {
      id: "gl-link",
      text: `${NEXORA.careersHost}/offers/${ROLE.reference}`,
      actualUrl: `https://${NEXORA.careersHost}/offers/${ROLE.reference}`,
    },
  ],
} satisfies EmailInput;

/** gmail-check-04: no proof either way. Correct label: Needs checking. */
export const EMAIL_CHECK = {
  displayName: "Nexora Talent Team",
  from: { id: "gc-from", address: `talent@${NEXORA.domain}` },
  replyTo: { id: "gc-reply-to", address: `talent@${NEXORA.domain}` },
  to: to("gc-to"),
  date: "24 Nov 2026, 08:15",
  subject: `Checking your interest — ${ROLE.title}`,
  preview: "Checking your interest — reply to arrange an introductory call",
  body: [
    [{ text: "Hi Ananya," }],
    [
      {
        text: `We came across your public profile and wanted to check whether you are open to a three-month ${ROLE.title} opportunity with ${NEXORA.name} in Bengaluru. If interested, reply with a suitable time for a short introductory call and we can share more details.`,
      },
    ],
    [{ text: "Regards,\nNexora Talent Team" }],
  ],
} satisfies EmailInput;

/** gmail-hard-05: "No fee. Still a scam." */
export const EMAIL_HARD = {
  displayName: "Nisha Rao | Nexora HR Operations",
  from: {
    id: "gh-from",
    address: "nisha.rao@nexora.example.onboard-hr.example",
    redFlagId: "mail-deceptive-subdomain",
  },
  replyTo: {
    id: "gh-reply-to",
    address: "payroll-verification@nexora-payroll.example",
    redFlagId: "mail-reply-to-other-domain",
  },
  to: to("gh-to"),
  date: "23 Nov 2026, 18:42",
  subject: `Pre-Onboarding Verification | ${ROLE.title} | ${ROLE.reference}`,
  preview: "Pre-Onboarding Verification — attachment included",
  body: [
    [{ text: "Dear Ananya," }],
    [
      {
        text: `Congratulations on progressing for the ${ROLE.title} role (Reference ${ROLE.reference}). Your candidate details and proposed role have been added to our onboarding workflow.`,
      },
    ],
    [
      { text: "To complete background verification and create your payroll profile, " },
      {
        id: "gh-id-request",
        text: "please upload the following before we issue the final written offer:\n• Aadhaar card\n• PAN card\n• Bank account details\n• A recent selfie for identity matching",
        redFlagId: "mail-id-request",
      },
    ],
    [
      { text: "There is no payment required at this stage." },
      { text: " " },
      {
        id: "gh-install",
        text: "Please install the attached Nexora offer document package to view and sign the letter and complete the verification process.",
        redFlagId: "mail-apk",
      },
    ],
    [{ text: "You may also use the “Open Offer Letter” button in this email to continue." }],
    [{ text: "Regards,\nNisha Rao\nTalent Acquisition Lead\nNexora HR Operations" }],
  ],
  attachments: [
    {
      id: "gh-file",
      // The chip cuts the name short; tapping it shows the double extension.
      shownName: "Offer_Letter.pdf…",
      fullName: "Offer_Letter.pdf.apk",
      actualType: "Android application (.apk)",
      sizeLabel: "8.4 MB",
      redFlagId: "mail-apk",
    },
  ],
  links: [
    {
      id: "gh-button",
      text: "Open Offer Letter",
      actualUrl: "https://nexora.example.onboard-hr.example/verify",
      redFlagId: "mail-button-destination",
    },
  ],
} satisfies EmailInput;

/** gmail-login-06: "No money, just your login" (optional bonus). */
export const EMAIL_LOGIN = {
  displayName: "Nexora Onboarding",
  from: { id: "gx-from", address: `onboarding@${NEXORA.domain}` },
  replyTo: { id: "gx-reply-to", address: `onboarding@${NEXORA.domain}` },
  to: to("gx-to"),
  date: "24 Nov 2026, 08:05",
  subject: "Your candidate account is ready — complete onboarding",
  preview: "Your candidate profile is ready.",
  body: [
    [{ text: "Hello Ananya," }],
    [
      {
        text: "Your candidate profile is ready. To access your offer documents, select the button below and ",
      },
      {
        id: "gx-password",
        text: "sign in with the email address and password you use for your mailbox",
        redFlagId: "mail-password-request",
      },
      {
        text: ". This will connect your email to the onboarding portal and allow HR to send updates.",
      },
    ],
  ],
  links: [
    {
      id: "gx-button",
      text: `Complete onboarding · ${NEXORA.careersHost}/complete-onboarding`,
      actualUrl: "https://nexora.example.candidate-portal.example/login",
      redFlagId: "mail-link-mismatch",
    },
  ],
} satisfies EmailInput;

/** Red flag ids carried by these emails and the documents they attach. */
export function redFlagIdsIn(emails: readonly EmailInput[]): string[] {
  const ids = new Set<string>();
  const add = (id: string | undefined) => {
    if (id !== undefined) ids.add(id);
  };
  for (const email of emails) {
    add(email.from.redFlagId);
    add(email.replyTo?.redFlagId);
    add(email.to.redFlagId);
    for (const paragraph of email.body) for (const segment of paragraph) add(segment.redFlagId);
    for (const a of email.attachments ?? []) add(a.redFlagId);
    for (const link of email.links ?? []) add(link.redFlagId);
    for (const panel of Object.values(documentsFor([email]))) {
      for (const section of panel.sections)
        for (const field of section.fields) add(field.redFlagId);
    }
  }
  return [...ids];
}

/** The PDF panels these emails' attachments open. */
export function documentsFor(emails: readonly EmailInput[]): Record<string, EvidencePanelInput> {
  const out: Record<string, EvidencePanelInput> = {};
  for (const email of emails) {
    for (const a of email.attachments ?? []) {
      if (a.documentId !== undefined && a.documentId in PANELS) {
        out[a.documentId] = PANELS[a.documentId as PanelId];
      }
    }
  }
  return out;
}
