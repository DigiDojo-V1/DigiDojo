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
  title: "The profile looks right. The dates do not.",
  summary: "A professional recruiter, a polished profile and no fee at all. Investigate.",
  legit: false,
  primer: {
    title: "Investigate before you trust",
    body: "The message is professional and asks for no money. Inspect the recruiter's profile and the company's own information before you decide.",
  },
  startNodeId: "li-nisha",

  nodes: {
    "li-nisha": {
      kind: "thread",
      app: "linkedin",
      contact: {
        name: "Nisha Rao",
        subtitle: "Senior Talent Acquisition Partner | Nexora Technologies Pvt. Ltd.",
      },
      messages: [
        { id: "li-hard-date", from: "system", text: "22 November 2026, 15:20", delayMs: 300 },
        {
          id: "li-hard-m1",
          from: "them",
          delayMs: 1400,
          text: "Hi Ananya, I reviewed your profile and the academic project you listed on inflation trends. Our research team is hiring a Business Research Intern for a three-month hybrid role in Bengaluru. The work includes competitor research, spreadsheet analysis and preparing a weekly insight summary. The stipend is ₹18,000 per month.\n\nThe selection process is a 20-minute video discussion with the Research Manager, Priya Nair, on 25 November at 3:30 PM. The role is listed under reference NX-BRI-026. Please let me know whether you would like me to reserve the slot.",
        },
      ],
      evidence: ["nisha-profile", "nexora-company", "nexora-record"],
      choices: [
        { label: "Reply and reserve the interview slot", nextNodeId: "gmail-hard" },
        { label: "Report the profile: the dates don't add up", nextNodeId: "safe-early" },
      ],
    },

    "gmail-hard": {
      kind: "email",
      app: "gmail",
      email: EMAIL_HARD,
      evidence: ["nexora-company", "nexora-careers"],
      choices: [
        {
          label: "Upload your Aadhaar, PAN, bank details and a selfie",
          nextNodeId: "identity-shared",
        },
        { label: "Install the attached offer package", nextNodeId: "apk-installed" },
        {
          label: "Contact Nexora HR using details from nexora.example, and report this email",
          nextNodeId: "safe",
        },
      ],
    },

    "identity-shared": {
      kind: "outcome",
      result: "compromised",
      title: "Your identity is exposed",
      body: "Your Aadhaar, PAN, bank details and selfie went to onboard-hr.example, not Nexora. They can be misused for fraudulent accounts or loans in your name. (Nothing real was collected: this is a simulation.)",
      rewindToNodeId: "gmail-hard",
    },
    "apk-installed": {
      kind: "outcome",
      result: "compromised",
      title: "Your phone is compromised",
      body: "Offer_Letter.pdf.apk was an Android application, not a PDF. Once installed, an app like this can read your messages and OTPs. (Nothing was installed: this is a simulation.)",
      rewindToNodeId: "gmail-hard",
    },
    "safe-early": {
      kind: "outcome",
      result: "safe",
      title: "You checked the dates",
      body: "Nisha's profile says she joined Nexora Technologies Pvt. Ltd. on 1 July 2019, but the company was incorporated on 17 May 2021, almost 22 months later.",
    },
    safe: {
      kind: "outcome",
      result: "safe",
      title: "You verified first",
      body: "You contacted Nexora through its official website instead of the email. Sensitive documents belong only after a genuine written offer and a verified HR process.",
    },
  },

  evidence: pickPanels(["nisha-profile", "nexora-company", "nexora-record", "nexora-careers"]),
  redFlags: pickRedFlags(["li-timeline-conflict", ...redFlagIdsIn([EMAIL_HARD])]),

  debrief: {
    rule: "No payment request is needed for a scam. Investigate the profile, the domain and the file.",
    summary:
      "A convincing message and a polished profile can still be false: compare dates across the profile and the company's own information. This scam never asks for money. It tries to obtain identity and banking information and to make you install an application. Check the full sender address, the actual link destination and the complete attachment filename, and never install an APK that arrives disguised as an offer letter.",
    realWorldAction: REAL_WORLD_ACTION,
  },
});
