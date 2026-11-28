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
    {
      en: "Never pay to get a job. Registration fees, training fees, laptop deposits, verification charges and “refundable” payments are all red flags.",
      hinglish:
        "Job paane ke liye kabhi paise mat do. Registration fees, training fees, laptop deposits, verification charges aur “refundable” payments, sab red flags hain.",
    },
    {
      en: "Check the actual sender address, not just the display name. In Gmail, inspect both From and Reply-To, and check the To field before sending a reply.",
      hinglish:
        "Sirf display name nahi, asli sender address check karo. Gmail mein From aur Reply-To dono dekho, aur reply bhejne se pehle To field check karo.",
    },
    {
      en: "Inspect the recruiter, company page and employment timeline. A polished profile or a large number of connections does not prove the person works there.",
      hinglish:
        "Recruiter, company page aur employment timeline check karo. Chamakti profile ya bahut saare connections se yeh prove nahi hota ki woh insaan wahan kaam karta hai.",
    },
    {
      en: "A real hiring process involves a real interview, identifiable people, a job that can be found on the company’s own careers page and an offer that matches what was discussed.",
      hinglish:
        "Asli hiring mein asli interview hota hai, pehchaan mein aane wale log hote hain, job company ke apne careers page pe milti hai, aur offer wahi hota hai jo baat hui thi.",
    },
    {
      en: "Do not share Aadhaar, PAN, bank details, a selfie or an OTP before a genuine written offer and verified HR process.",
      hinglish:
        "Genuine written offer aur verified HR process se pehle Aadhaar, PAN, bank details, selfie ya OTP share mat karo.",
    },
    {
      en: "Check the actual link destination and the full attachment filename. A link can display a familiar company name while going elsewhere; a file called Offer_Letter.pdf.apk is an APK, not a PDF.",
      hinglish:
        "Link ka asli destination aur attachment ka poora filename check karo. Link pe jaani-pehchaani company ka naam dikh sakta hai par woh kahin aur le ja sakta hai; Offer_Letter.pdf.apk naam ki file APK hai, PDF nahi.",
    },
    {
      en: "Do not install interview or onboarding apps sent by an unverified recruiter, and do not grant screen-sharing or remote-access permissions to them.",
      hinglish:
        "Unverified recruiter ke bheje interview ya onboarding apps install mat karo, aur unhe screen-sharing ya remote-access permissions mat do.",
    },
    {
      en: "Verify through an official channel you find independently. Search the company website, use contact details from its official site, and report suspicious messages.",
      hinglish:
        "Khud dhoondhe gaye official channel se verify karo. Company ki website search karo, official site wale contact details use karo, aur suspicious messages report karo.",
    },
    {
      en: "If money has already been paid in India, call 1930 and report the incident at cybercrime.gov.in.",
      hinglish:
        "India mein paise de chuke ho, toh 1930 pe call karo aur cybercrime.gov.in pe report karo.",
    },
  ],
});
