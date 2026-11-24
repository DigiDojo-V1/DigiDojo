import { defineScenario } from "@/engine/define";
import {
  documentsFor,
  EMAIL_CHECK,
  EMAIL_EASY,
  EMAIL_HARD,
  EMAIL_LEGIT,
  EMAIL_MEDIUM,
  redFlagIdsIn,
} from "../content/emails";
import { pickRedFlags } from "../content/red-flags";
import { REAL_WORLD_ACTION } from "../content/universe";

const EMAILS = [EMAIL_EASY, EMAIL_MEDIUM, EMAIL_LEGIT, EMAIL_CHECK, EMAIL_HARD];

/** Inbox triage: five emails, each labelled Legit, Scam or Needs checking (blueprint §5). */
export const inboxTriage = defineScenario({
  id: "inbox-triage",
  dojoId: "dream-job",
  title: "Sort the inbox",
  summary: "Five job emails. Label each one Legit, Scam or Needs checking.",
  legit: false,
  startNodeId: "inbox",

  nodes: {
    inbox: {
      kind: "triage",
      app: "gmail",
      items: [
        {
          id: "gmail-easy-01",
          email: EMAIL_EASY,
          correct: "scam",
          explanation:
            "A free Gmail sender, “Dear Candidate”, no interview, ₹40,000 pay and a ₹2,999 fee to an individual UPI ID.",
        },
        {
          id: "gmail-medium-02",
          email: EMAIL_MEDIUM,
          correct: "scam",
          explanation:
            "The From domain is nex0ra.example (zero, not o), Reply-To is a Gmail address, and the PDF hides a ₹2,499 deposit in clause 8.4.",
        },
        {
          id: "gmail-legit-03",
          email: EMAIL_LEGIT,
          correct: "legit",
          explanation:
            "Official domain for From and Reply-To, two named interviews, full role terms, the official careers portal and no fee.",
        },
        {
          id: "gmail-check-04",
          email: EMAIL_CHECK,
          correct: "needs-checking",
          explanation:
            "There is no clear proof either way: no job reference, named recruiter, manager or interview history. The From field alone does not prove authenticity. Search the company careers page and contact HR using details found independently before sharing information.",
        },
        {
          id: "gmail-hard-05",
          email: EMAIL_HARD,
          correct: "scam",
          explanation:
            "The real domain is onboard-hr.example, Reply-To is another domain, the attachment is Offer_Letter.pdf.apk, and it asks for Aadhaar, PAN, bank details and a selfie.",
        },
      ],
      nextNodeId: "sorted",
    },
    sorted: {
      kind: "outcome",
      result: "safe",
      title: "Inbox sorted",
      body: "See how your labels compare in the debrief.",
    },
  },

  evidence: documentsFor(EMAILS),
  redFlags: pickRedFlags(redFlagIdsIn(EMAILS)),

  debrief: {
    rule: "Distinguish real from fake. Don't assume every offer is a scam.",
    summary:
      "Inspect the sender, the Reply-To and the attachments before you decide. When there's no proof either way, the answer is to verify through an official channel you find yourself.",
    realWorldAction: REAL_WORLD_ACTION,
  },
});
