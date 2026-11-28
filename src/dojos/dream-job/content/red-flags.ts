import type { RedFlagInput } from "@/engine/schema";

/**
 * Every Dream Job red flag, from the blueprint's answer keys. Scenarios pick the ones they
 * use with `pickRedFlags`, because the schema rejects a red flag nothing carries.
 */
export const RED_FLAGS = {
  // LinkedIn Easy
  "li-never-applied": {
    label: {
      en: "Selected for a job you never applied for",
      hinglish: "Jis job ke liye apply nahi kiya, usmein select",
    },
    tactic: "flattery",
    explanation: {
      en: "You never applied for this job, yet they claim you have been selected.",
      hinglish:
        "Tumne is job ke liye kabhi apply nahi kiya, phir bhi woh keh rahe hain ki tum select ho gaye.",
    },
  },
  "li-pay-too-high": {
    label: { en: "₹40,000 a month for basic work", hinglish: "Basic kaam ke ₹40,000 mahina" },
    tactic: "too-good-to-be-true",
    explanation: {
      en: "₹40,000/month for a basic entry-level internship is unusually high for the described work.",
      hinglish:
        "Ek basic entry-level internship ke liye ₹40,000/month, bataye gaye kaam ke hisaab se bahut zyada hai.",
    },
  },
  "li-no-interview": {
    label: { en: "No interview needed", hinglish: "Interview ki zaroorat nahi" },
    tactic: "no-real-process",
    explanation: {
      en: "“No interview is needed” means there is no real selection process.",
      hinglish:
        "“Interview ki zaroorat nahi” ka matlab hai koi asli selection process hai hi nahi.",
    },
  },
  "li-vague-duties": {
    label: {
      en: "Job description only after registration",
      hinglish: "Job description sirf registration ke baad",
    },
    tactic: "no-real-process",
    explanation: {
      en: "The job description is vague and withheld until after registration.",
      hinglish:
        "Job description saaf nahi hai aur registration ke baad tak chhupa ke rakha gaya hai.",
    },
  },
  "li-fee": {
    label: { en: "Registration fee", hinglish: "Registration fee" },
    tactic: "pay-to-earn",
    explanation: {
      en: "A ₹1,499 registration/verification fee is a payment demand. “Refundable” does not make it legitimate.",
      hinglish:
        "₹1,499 ki registration/verification fee paise ki maang hai. “Refundable” bol dene se yeh legit nahi ho jaati.",
    },
  },
  "li-personal-upi": {
    label: {
      en: "Payment to a personal UPI ID",
      hinglish: "Personal UPI ID pe payment",
    },
    tactic: "pay-to-earn",
    explanation: {
      en: "The UPI ID appears to belong to an individual coordinator, not a verified company payment channel.",
      hinglish:
        "UPI ID kisi ek coordinator ki lagti hai, kisi verified company payment channel ki nahi.",
    },
  },
  "li-urgency": {
    label: {
      en: "Two seats left, expires tonight",
      hinglish: "Do seats bachi, aaj raat expire",
    },
    tactic: "urgency",
    explanation: {
      en: "“Only two seats” and “expires tonight” are urgency pressure tactics.",
      hinglish: "“Sirf do seats” aur “aaj raat expire” jaldi ka pressure daalne ki chaalein hain.",
    },
  },

  // Gmail Easy
  "mail-free-sender": {
    label: {
      en: "Company name on a free email account",
      hinglish: "Free email account pe company ka naam",
    },
    tactic: "impersonation",
    explanation: {
      en: "The display name says Nexora HR, but the actual sender is a free Gmail address.",
      hinglish: "Display name mein Nexora HR likha hai, par asli sender ek free Gmail address hai.",
    },
  },
  "mail-never-applied": {
    label: {
      en: "An offer you never applied for",
      hinglish: "Aisa offer jiske liye apply hi nahi kiya",
    },
    tactic: "flattery",
    explanation: {
      en: "The email is an offer for a job the player never applied for or interviewed for.",
      hinglish: "Email ek aisi job ka offer hai jiske liye tumne na apply kiya, na interview diya.",
    },
  },
  "mail-generic-greeting": {
    label: { en: "“Dear Candidate”", hinglish: "“Dear Candidate”" },
    tactic: "no-real-process",
    explanation: {
      en: "“Dear Candidate” is a generic greeting.",
      hinglish: "“Dear Candidate” ek generic greeting hai.",
    },
  },
  "mail-no-interview": {
    label: { en: "No further interview", hinglish: "Aage koi interview nahi" },
    tactic: "no-real-process",
    explanation: {
      en: "You are told you don't need an interview: there is no real selection process.",
      hinglish:
        "Tumhe bola gaya ki interview ki zaroorat nahi: koi asli selection process nahi hai.",
    },
  },
  "mail-high-salary": {
    label: { en: "Salary far too high", hinglish: "Salary hadd se zyada" },
    tactic: "too-good-to-be-true",
    explanation: {
      en: "The salary is unusually high for the entry-level role and no salary breakdown is supplied.",
      hinglish:
        "Entry-level role ke liye salary bahut zyada hai aur koi salary breakdown bhi nahi diya.",
    },
  },
  "mail-missing-details": {
    label: {
      en: "Offer letter missing basic details",
      hinglish: "Offer letter mein basic details gayab",
    },
    tactic: "no-real-process",
    explanation: {
      en: "The offer letter is missing a named manager, office address, start date and employee ID.",
      hinglish:
        "Offer letter mein na manager ka naam hai, na office address, na start date, na employee ID.",
    },
  },
  "mail-fee": {
    label: { en: "₹2,999 activation fee", hinglish: "₹2,999 ki activation fee" },
    tactic: "pay-to-earn",
    explanation: {
      en: "The ₹2,999 fee is a payment demand. A genuine offer never needs a registration payment.",
      hinglish:
        "₹2,999 ki fee paise ki maang hai. Genuine offer mein kabhi registration payment nahi lagta.",
    },
  },
  "mail-personal-upi": {
    label: {
      en: "Fee to an individual's UPI ID",
      hinglish: "Fee kisi insaan ki UPI ID pe",
    },
    tactic: "pay-to-earn",
    explanation: {
      en: "The ₹2,999 fee is payable to an individual UPI ID, not the company.",
      hinglish: "₹2,999 ki fee kisi ek insaan ki UPI ID pe bharni hai, company ko nahi.",
    },
  },
  "mail-urgency": {
    label: { en: "24-hour deadline", hinglish: "24 ghante ki deadline" },
    tactic: "urgency",
    explanation: {
      en: "The 24-hour deadline and “few seats remain” language create urgency.",
      hinglish:
        "24 ghante ki deadline aur “few seats remain” jaisi baatein jaldi ka pressure banati hain.",
    },
  },

  // LinkedIn Medium
  "li-off-platform": {
    label: { en: "Moved to WhatsApp", hinglish: "WhatsApp pe le gaye" },
    tactic: "isolation",
    explanation: {
      en: "The recruiter moves the candidate away from the original platform to WhatsApp.",
      hinglish: "Recruiter tumhe original platform se hata ke WhatsApp pe le jaata hai.",
    },
  },
  "li-text-only-interview": {
    label: { en: "Text-only screening", hinglish: "Sirf text wali screening" },
    tactic: "no-real-process",
    explanation: {
      en: "The interview is only a text conversation instead of a real interview with identifiable people.",
      hinglish:
        "Interview bas ek text chat hai, pehchaan mein aane wale logon ke saath asli interview nahi.",
    },
  },
  "wa-thin-selection": {
    label: {
      en: "Selected after three questions",
      hinglish: "Teen sawaalon ke baad select",
    },
    tactic: "no-real-process",
    explanation: {
      en: "The candidate is declared selected after a very thin screening process.",
      hinglish: "Bahut hi halki si screening ke baad tumhe selected bol diya gaya.",
    },
  },
  "wa-deposit": {
    label: { en: "“Refundable” laptop deposit", hinglish: "“Refundable” laptop deposit" },
    tactic: "pay-to-earn",
    explanation: {
      en: "The ₹2,499 laptop security deposit is still a fee even though it is called refundable.",
      hinglish: "₹2,499 ka laptop security deposit refundable bolne ke baad bhi ek fee hi hai.",
    },
  },
  "wa-unverified-payee": {
    label: {
      en: "Pay an “equipment partner”",
      hinglish: "Kisi “equipment partner” ko pay karo",
    },
    tactic: "pay-to-earn",
    explanation: {
      en: "The request is directed to an equipment partner without independently verified company payment instructions.",
      hinglish:
        "Payment ek equipment partner ko bhejne ko kaha gaya hai, company ke kisi alag se verify kiye gaye payment instructions ke bina.",
    },
  },

  // Gmail Medium
  "mail-lookalike-domain": {
    label: { en: "nex0ra with a zero", hinglish: "nex0ra, zero ke saath" },
    tactic: "impersonation",
    explanation: {
      en: "The From address uses nex0ra.example, with a zero replacing the “o” in the official nexora.example domain.",
      hinglish:
        "From address mein nex0ra.example hai, jismein official nexora.example domain ke “o” ki jagah zero hai.",
    },
  },
  "mail-reply-to-mismatch": {
    label: { en: "Reply-To goes to Gmail", hinglish: "Reply-To Gmail pe jaata hai" },
    tactic: "impersonation",
    explanation: {
      en: "Reply-To sends the candidate to nexora.onboarding.desk@gmail.com rather than an independently verified company address.",
      hinglish:
        "Reply-To tumhe nexora.onboarding.desk@gmail.com pe bhejta hai, kisi alag se verify kiye gaye company address pe nahi.",
    },
  },
  "pdf-deposit": {
    label: {
      en: "Deposit buried in clause 8.4",
      hinglish: "Deposit clause 8.4 mein chhupa hai",
    },
    tactic: "pay-to-earn",
    explanation: {
      en: "The email body does not mention payment; the fee is hidden in the PDF fine print. The “refundable laptop security deposit” is still a payment demand.",
      hinglish:
        "Email mein payment ka zikr nahi hai; fee PDF ke fine print mein chhupi hai. “Refundable laptop security deposit” bhi paise ki maang hi hai.",
    },
  },

  // LinkedIn Hard
  "li-timeline-conflict": {
    label: {
      en: "Joined before the company existed",
      hinglish: "Company banne se pehle hi join kar liya",
    },
    tactic: "impersonation",
    explanation: {
      en: "Nisha's profile says she has worked for Nexora Technologies Pvt. Ltd. since 1 July 2019, but the company was incorporated on 17 May 2021: almost 22 months later.",
      hinglish:
        "Nisha ki profile kehti hai ki woh 1 July 2019 se Nexora Technologies Pvt. Ltd. mein kaam kar rahi hai, par company 17 May 2021 ko incorporate hui: lagbhag 22 mahine baad.",
    },
  },

  // Gmail Hard
  "mail-deceptive-subdomain": {
    label: {
      en: "nexora.example is only a subdomain",
      hinglish: "nexora.example bas ek subdomain hai",
    },
    tactic: "impersonation",
    explanation: {
      en: "The sender address uses a deceptive subdomain; the actual domain is onboard-hr.example, not nexora.example.",
      hinglish:
        "Sender address mein dhokha dene wala subdomain hai; asli domain onboard-hr.example hai, nexora.example nahi.",
    },
  },
  "mail-reply-to-other-domain": {
    label: { en: "Reply-To on another domain", hinglish: "Reply-To kisi aur domain pe" },
    tactic: "impersonation",
    explanation: {
      en: "Reply-To points to another unrelated domain, nexora-payroll.example.",
      hinglish: "Reply-To ek aur bina rishte wale domain pe jaata hai, nexora-payroll.example.",
    },
  },
  "mail-apk": {
    label: { en: "Offer_Letter.pdf.apk", hinglish: "Offer_Letter.pdf.apk" },
    tactic: "malicious-file",
    explanation: {
      en: "The attachment has a double extension: .pdf.apk. Its actual type is an Android application, not a PDF.",
      hinglish:
        "Attachment ka double extension hai: .pdf.apk. Asal mein yeh ek Android app hai, PDF nahi.",
    },
  },
  "mail-button-destination": {
    label: {
      en: "“Open Offer Letter” goes elsewhere",
      hinglish: "“Open Offer Letter” kahin aur le jaata hai",
    },
    tactic: "disguised-link",
    explanation: {
      en: "The “Open Offer Letter” button leads to a non-company host.",
      hinglish: "“Open Offer Letter” button ek aise host pe le jaata hai jo company ka nahi hai.",
    },
  },
  "mail-id-request": {
    label: {
      en: "Aadhaar, PAN, bank details and selfie",
      hinglish: "Aadhaar, PAN, bank details aur selfie",
    },
    tactic: "data-harvest",
    explanation: {
      en: "Aadhaar, PAN, bank details and a selfie are requested before a genuine written offer and verified onboarding.",
      hinglish:
        "Genuine written offer aur verified onboarding se pehle hi Aadhaar, PAN, bank details aur selfie maange ja rahe hain.",
    },
  },

  // Gmail login bonus
  "mail-link-mismatch": {
    label: {
      en: "Link text and destination differ",
      hinglish: "Link ka text aur destination alag",
    },
    tactic: "disguised-link",
    explanation: {
      en: "The visible link text and actual destination do not match. The destination is not on the official careers.nexora.example host.",
      hinglish:
        "Dikhne wala link text aur asli destination match nahi karte. Destination official careers.nexora.example host pe nahi hai.",
    },
  },
  "mail-password-request": {
    label: {
      en: "Asks for your mailbox password",
      hinglish: "Tumhare email ka password maangta hai",
    },
    tactic: "data-harvest",
    explanation: {
      en: "A candidate portal has no legitimate reason to request the password to your personal email account.",
      hinglish:
        "Kisi candidate portal ko tumhare personal email account ka password maangne ki koi sahi wajah nahi hoti.",
    },
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
