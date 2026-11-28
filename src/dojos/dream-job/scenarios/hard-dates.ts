import { defineScenario } from "@/engine/define";
import { EMAIL_HARD, redFlagIdsIn } from "../content/emails";
import { pickPanels } from "../content/evidence";
import { pickRedFlags } from "../content/red-flags";
import { REAL_WORLD_ACTION } from "../content/universe";

/**
 * Hard: LI-HARD-03 ("The profile looks right. The dates do not.") → gmail-hard-05 ("No fee.
 * Still a scam."). Source: docs/scenarios/dream-job/blueprint.docx, sections 2 and 3.
 * The clue needs two panels: Nisha's Experience (2019) and the company record (2021).
 */
export const hardDates = defineScenario({
  id: "hard-dates",
  dojoId: "dream-job",
  title: {
    en: "The profile looks right. The dates do not.",
    hinglish: "Profile sahi lagti hai. Dates nahi.",
  },
  summary: {
    en: "A professional recruiter, a polished profile and no fee at all. Investigate.",
    hinglish: "Ek professional recruiter, chamakti profile aur koi fee bhi nahi. Jaanch karo.",
  },
  legit: false,
  primer: {
    title: { en: "Investigate before you trust", hinglish: "Bharosa karne se pehle jaanch karo" },
    body: {
      en: "The message is professional and asks for no money. Inspect the recruiter's profile and the company's own information before you decide.",
      hinglish:
        "Message professional hai aur koi paisa nahi maangta. Decide karne se pehle recruiter ki profile aur company ki apni jaankari check karo.",
    },
    setup: {
      en: "You're Ananya. Placement season is close and you'd love a research role before graduating. A senior recruiter messages you with an offer of a proper interview.",
      hinglish:
        "Tum Ananya ho. Placement season aane wala hai aur graduation se pehle tumhe ek research role chahiye. Ek senior recruiter tumhe proper interview ke offer ke saath message karti hai.",
    },
  },
  startNodeId: "li-nisha",

  nodes: {
    "li-nisha": {
      kind: "thread",
      app: "linkedin",
      contact: {
        name: { en: "Nisha Rao", hinglish: "Nisha Rao" },
        subtitle: "Senior Talent Acquisition Partner | Nexora Technologies Pvt. Ltd.",
      },
      messages: [
        { id: "li-hard-date", from: "system", text: "22 November 2026, 15:20", delayMs: 300 },
        {
          id: "li-hard-m1",
          from: "them",
          time: "15:20",
          delayMs: 1400,
          text: "Hi Ananya, I reviewed your profile and the academic project you listed on inflation trends. Our research team is hiring a Business Research Intern for a three-month hybrid role in Bengaluru. The work includes competitor research, spreadsheet analysis and preparing a weekly insight summary. The stipend is ₹18,000 per month.\n\nThe selection process is a 20-minute video discussion with the Research Manager, Priya Nair, on 25 November at 3:30 PM. The role is listed under reference NX-BRI-026. Please let me know whether you would like me to reserve the slot.",
        },
      ],
      evidence: ["nisha-profile", "nexora-company", "nexora-record"],
      layout: "split",
      choices: [
        {
          label: {
            en: "Reply and reserve the interview slot",
            hinglish: "Reply karo aur interview slot reserve karo",
          },
          nextNodeId: "gmail-hard",
        },
        {
          label: {
            en: "Report the profile: the dates don't add up",
            hinglish: "Profile report karo: dates mel nahi kha rahi",
          },
          nextNodeId: "safe-early",
        },
      ],
    },

    "gmail-hard": {
      kind: "email",
      app: "gmail",
      email: EMAIL_HARD,
      evidence: ["nexora-company", "nexora-careers"],
      choices: [
        {
          label: {
            en: "Upload your Aadhaar, PAN, bank details and a selfie",
            hinglish: "Apna Aadhaar, PAN, bank details aur selfie upload karo",
          },
          nextNodeId: "identity-shared",
        },
        {
          label: {
            en: "Install the attached offer package",
            hinglish: "Attached offer package install karo",
          },
          nextNodeId: "apk-installed",
        },
        {
          label: {
            en: "Contact Nexora HR using details from nexora.example, and report this email",
            hinglish:
              "nexora.example pe di gayi details se Nexora HR ko contact karo, aur yeh email report karo",
          },
          nextNodeId: "safe",
        },
      ],
    },

    "identity-shared": {
      kind: "outcome",
      result: "compromised",
      title: { en: "Your identity is exposed", hinglish: "Tumhari identity leak ho gayi" },
      body: {
        en: "Your Aadhaar, PAN, bank details and selfie went to onboard-hr.example, not Nexora. They can be misused for fraudulent accounts or loans in your name. (Nothing real was collected: this is a simulation.)",
        hinglish:
          "Tumhara Aadhaar, PAN, bank details aur selfie onboard-hr.example ko gaye, Nexora ko nahi. Inka tumhare naam pe fake accounts ya loans ke liye galat use ho sakta hai. (Kuch bhi asli collect nahi hua: yeh simulation hai.)",
      },
      rewindToNodeId: "gmail-hard",
    },
    "apk-installed": {
      kind: "outcome",
      result: "compromised",
      title: { en: "Your phone is compromised", hinglish: "Tumhara phone compromise ho gaya" },
      body: {
        en: "Offer_Letter.pdf.apk was an Android application, not a PDF. Once installed, an app like this can read your messages and OTPs. (Nothing was installed: this is a simulation.)",
        hinglish:
          "Offer_Letter.pdf.apk ek Android app thi, PDF nahi. Install hote hi aisi app tumhare messages aur OTPs padh sakti hai. (Kuch install nahi hua: yeh simulation hai.)",
      },
      rewindToNodeId: "gmail-hard",
    },
    "safe-early": {
      kind: "outcome",
      result: "safe",
      title: { en: "You checked the dates", hinglish: "Tumne dates check ki" },
      body: {
        en: "Nisha's profile says she joined Nexora Technologies Pvt. Ltd. on 1 July 2019, but the company was incorporated on 17 May 2021, almost 22 months later.",
        hinglish:
          "Nisha ki profile kehti hai ki usne 1 July 2019 ko Nexora Technologies Pvt. Ltd. join kiya, par company 17 May 2021 ko incorporate hui, lagbhag 22 mahine baad.",
      },
    },
    safe: {
      kind: "outcome",
      result: "safe",
      title: { en: "You verified first", hinglish: "Tumne pehle verify kiya" },
      body: {
        en: "You contacted Nexora through its official website instead of the email. Sensitive documents belong only after a genuine written offer and a verified HR process.",
        hinglish:
          "Tumne email ki jagah Nexora ko uski official website se contact kiya. Sensitive documents sirf genuine written offer aur verified HR process ke baad hi dene chahiye.",
      },
    },
  },

  evidence: pickPanels(["nisha-profile", "nexora-company", "nexora-record", "nexora-careers"]),
  redFlags: pickRedFlags(["li-timeline-conflict", ...redFlagIdsIn([EMAIL_HARD])]),

  debrief: {
    rule: {
      en: "No payment request is needed for a scam. Investigate the profile, the domain and the file.",
      hinglish:
        "Scam ke liye payment maangna zaroori nahi. Profile, domain aur file ki jaanch karo.",
    },
    summary: {
      en: "A convincing message and a polished profile can still be false: compare dates across the profile and the company's own information. This scam never asks for money. It tries to obtain identity and banking information and to make you install an application. Check the full sender address, the actual link destination and the complete attachment filename, and never install an APK that arrives disguised as an offer letter.",
      hinglish:
        "Bharosemand message aur chamakti profile bhi jhoothi ho sakti hai: profile aur company ki apni jaankari mein dates milao. Yeh scam kabhi paise nahi maangta. Yeh tumhari identity aur banking jaankari lena chahta hai aur tumse ek app install karwana chahta hai. Poora sender address, link ka asli destination aur attachment ka poora filename check karo, aur offer letter ke bhes mein aayi APK kabhi install mat karo.",
    },
    realWorldAction: REAL_WORLD_ACTION,
  },
});
