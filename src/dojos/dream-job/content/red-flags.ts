import type { RedFlagInput } from "@/engine/schema";

/**
 * Every Dream Job red flag, from the blueprint's answer keys. Scenarios pick the ones they
 * use with `pickRedFlags`, because the schema rejects a red flag nothing carries.
 */
export const RED_FLAGS = {
  // LinkedIn Easy
  "li-never-applied": {
    label: "Selected for a job you never applied for",
    tactic: "flattery",
    explanation: "You never applied for this job, yet they claim you have been selected.",
  },
  "li-pay-too-high": {
    label: "₹40,000 a month for basic work",
    tactic: "too-good-to-be-true",
    explanation:
      "₹40,000/month for a basic entry-level internship is unusually high for the described work.",
  },
  "li-no-interview": {
    label: "No interview needed",
    tactic: "no-real-process",
    explanation: "“No interview is needed” means there is no real selection process.",
  },
  "li-vague-duties": {
    label: "Job description only after registration",
    tactic: "no-real-process",
    explanation: "The job description is vague and withheld until after registration.",
  },
  "li-fee": {
    label: "Registration fee",
    tactic: "pay-to-earn",
    explanation:
      "A ₹1,499 registration/verification fee is a payment demand. “Refundable” does not make it legitimate.",
  },
  "li-personal-upi": {
    label: "Payment to a personal UPI ID",
    tactic: "pay-to-earn",
    explanation:
      "The UPI ID appears to belong to an individual coordinator, not a verified company payment channel.",
  },
  "li-urgency": {
    label: "Two seats left, expires tonight",
    tactic: "urgency",
    explanation: "“Only two seats” and “expires tonight” are urgency pressure tactics.",
  },

  // Gmail Easy
  "mail-free-sender": {
    label: "Company name on a free email account",
    tactic: "impersonation",
    explanation: "The display name says Nexora HR, but the actual sender is a free Gmail address.",
  },
  "mail-never-applied": {
    label: "An offer you never applied for",
    tactic: "flattery",
    explanation: "The email is an offer for a job the player never applied for or interviewed for.",
  },
  "mail-generic-greeting": {
    label: "“Dear Candidate”",
    tactic: "no-real-process",
    explanation: "“Dear Candidate” is a generic greeting.",
  },
  "mail-no-interview": {
    label: "No further interview",
    tactic: "no-real-process",
    explanation: "You are told you don't need an interview: there is no real selection process.",
  },
  "mail-high-salary": {
    label: "Salary far too high",
    tactic: "too-good-to-be-true",
    explanation:
      "The salary is unusually high for the entry-level role and no salary breakdown is supplied.",
  },
  "mail-missing-details": {
    label: "Offer letter missing basic details",
    tactic: "no-real-process",
    explanation:
      "The offer letter is missing a named manager, office address, start date and employee ID.",
  },
  "mail-fee": {
    label: "₹2,999 activation fee",
    tactic: "pay-to-earn",
    explanation:
      "The ₹2,999 fee is a payment demand. A genuine offer never needs a registration payment.",
  },
  "mail-personal-upi": {
    label: "Fee to an individual's UPI ID",
    tactic: "pay-to-earn",
    explanation: "The ₹2,999 fee is payable to an individual UPI ID, not the company.",
  },
  "mail-urgency": {
    label: "24-hour deadline",
    tactic: "urgency",
    explanation: "The 24-hour deadline and “few seats remain” language create urgency.",
  },

  // LinkedIn Medium
  "li-off-platform": {
    label: "Moved to WhatsApp",
    tactic: "isolation",
    explanation: "The recruiter moves the candidate away from the original platform to WhatsApp.",
  },
  "li-text-only-interview": {
    label: "Text-only screening",
    tactic: "no-real-process",
    explanation:
      "The interview is only a text conversation instead of a real interview with identifiable people.",
  },
  "wa-thin-selection": {
    label: "Selected after three questions",
    tactic: "no-real-process",
    explanation: "The candidate is declared selected after a very thin screening process.",
  },
  "wa-deposit": {
    label: "“Refundable” laptop deposit",
    tactic: "pay-to-earn",
    explanation:
      "The ₹2,499 laptop security deposit is still a fee even though it is called refundable.",
  },
  "wa-unverified-payee": {
    label: "Pay an “equipment partner”",
    tactic: "pay-to-earn",
    explanation:
      "The request is directed to an equipment partner without independently verified company payment instructions.",
  },

  // Gmail Medium
  "mail-lookalike-domain": {
    label: "nex0ra with a zero",
    tactic: "impersonation",
    explanation:
      "The From address uses nex0ra.example, with a zero replacing the “o” in the official nexora.example domain.",
  },
  "mail-reply-to-mismatch": {
    label: "Reply-To goes to Gmail",
    tactic: "impersonation",
    explanation:
      "Reply-To sends the candidate to nexora.onboarding.desk@gmail.com rather than an independently verified company address.",
  },
  "pdf-deposit": {
    label: "Deposit buried in clause 8.4",
    tactic: "pay-to-earn",
    explanation:
      "The email body does not mention payment; the fee is hidden in the PDF fine print. The “refundable laptop security deposit” is still a payment demand.",
  },

  // LinkedIn Hard
  "li-timeline-conflict": {
    label: "Joined before the company existed",
    tactic: "impersonation",
    explanation:
      "Nisha's profile says she has worked for Nexora Technologies Pvt. Ltd. since 1 July 2019, but the company was incorporated on 17 May 2021: almost 22 months later.",
  },

  // Gmail Hard
  "mail-deceptive-subdomain": {
    label: "nexora.example is only a subdomain",
    tactic: "impersonation",
    explanation:
      "The sender address uses a deceptive subdomain; the actual domain is onboard-hr.example, not nexora.example.",
  },
  "mail-reply-to-other-domain": {
    label: "Reply-To on another domain",
    tactic: "impersonation",
    explanation: "Reply-To points to another unrelated domain, nexora-payroll.example.",
  },
  "mail-apk": {
    label: "Offer_Letter.pdf.apk",
    tactic: "malicious-file",
    explanation:
      "The attachment has a double extension: .pdf.apk. Its actual type is an Android application, not a PDF.",
  },
  "mail-button-destination": {
    label: "“Open Offer Letter” goes elsewhere",
    tactic: "disguised-link",
    explanation: "The “Open Offer Letter” button leads to a non-company host.",
  },
  "mail-id-request": {
    label: "Aadhaar, PAN, bank details and selfie",
    tactic: "data-harvest",
    explanation:
      "Aadhaar, PAN, bank details and a selfie are requested before a genuine written offer and verified onboarding.",
  },

  // Gmail login bonus
  "mail-link-mismatch": {
    label: "Link text and destination differ",
    tactic: "disguised-link",
    explanation:
      "The visible link text and actual destination do not match. The destination is not on the official careers.nexora.example host.",
  },
  "mail-password-request": {
    label: "Asks for your mailbox password",
    tactic: "data-harvest",
    explanation:
      "A candidate portal has no legitimate reason to request the password to your personal email account.",
  },
} satisfies Record<string, RedFlagInput>;

export type DreamJobRedFlagId = keyof typeof RED_FLAGS;

/** The red flags a scenario uses, by id. */
export function pickRedFlags(ids: readonly string[]): Record<string, RedFlagInput> {
  const out: Record<string, RedFlagInput> = {};
  for (const id of ids) {
    if (!(id in RED_FLAGS)) throw new Error(`Unknown Dream Job red flag "${id}"`);
    out[id] = RED_FLAGS[id as DreamJobRedFlagId];
  }
  return out;
}
