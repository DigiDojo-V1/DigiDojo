import { defineDojo } from "@/engine/define";
import { easyTooGood } from "./scenarios/easy-too-good";
import { hardDates } from "./scenarios/hard-dates";
import { inboxTriage } from "./scenarios/inbox-triage";
import { legitOffer } from "./scenarios/legit-offer";
import { loginBonus } from "./scenarios/login-bonus";
import { mediumWhatsapp } from "./scenarios/medium-whatsapp";

export const dreamJob = defineDojo({
  id: "dream-job",
  order: 2,
  name: { en: "Dream Job", hinglish: "Dream Job" },
  tagline: {
    en: "Is that offer letter real or a trap?",
    hinglish: "Offer letter asli hai ya jaal?",
  },
  scenarios: [easyTooGood, mediumWhatsapp, hardDates, legitOffer, inboxTriage, loginBonus],
  // Final learning summary, blueprint §7.
  takeaways: [
    "Never pay to get a job. Registration fees, training fees, laptop deposits, verification charges and “refundable” payments are all red flags.",
    "Check the actual sender address, not just the display name. In Gmail, inspect both From and Reply-To, and check the To field before sending a reply.",
    "Inspect the recruiter, company page and employment timeline. A polished profile or a large number of connections does not prove the person works there.",
    "A real hiring process involves a real interview, identifiable people, a job that can be found on the company’s own careers page and an offer that matches what was discussed.",
    "Do not share Aadhaar, PAN, bank details, a selfie or an OTP before a genuine written offer and verified HR process.",
    "Check the actual link destination and the full attachment filename. A link can display a familiar company name while going elsewhere; a file called Offer_Letter.pdf.apk is an APK, not a PDF.",
    "Do not install interview or onboarding apps sent by an unverified recruiter, and do not grant screen-sharing or remote-access permissions to them.",
    "Verify through an official channel you find independently. Search the company website, use contact details from its official site, and report suspicious messages.",
    "If money has already been paid in India, call 1930 and report the incident at cybercrime.gov.in.",
  ],
});
