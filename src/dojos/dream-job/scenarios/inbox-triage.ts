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
  title: { en: "Sort the inbox", hinglish: "Inbox sort karo" },
  summary: {
    en: "Five job emails. Label each one Legit, Scam or Needs checking.",
    hinglish: "Paanch job emails. Har ek ko Legit, Scam ya Check karna padega label do.",
  },
  legit: false,
  primer: {
    title: "Sort the inbox",
    body: "Open each email and label it Legit, Scam or Needs checking. Not every job email is a scam.",
    setup:
      "You're Ananya. After weeks of internship applications, replies have started arriving. Five job emails are waiting in your inbox.",
  },
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
          explanation: {
            en: "A free Gmail sender, “Dear Candidate”, no interview, ₹40,000 pay and a ₹2,999 fee to an individual UPI ID.",
            hinglish:
              "Free Gmail sender, “Dear Candidate”, koi interview nahi, ₹40,000 pay aur kisi insaan ki UPI ID pe ₹2,999 ki fee.",
          },
        },
        {
          id: "gmail-medium-02",
          email: EMAIL_MEDIUM,
          correct: "scam",
          explanation: {
            en: "The From domain is nex0ra.example (zero, not o), Reply-To is a Gmail address, and the PDF hides a ₹2,499 deposit in clause 8.4.",
            hinglish:
              "From domain nex0ra.example hai (zero, o nahi), Reply-To ek Gmail address hai, aur PDF ke clause 8.4 mein ₹2,499 ka deposit chhupa hai.",
          },
        },
        {
          id: "gmail-legit-03",
          email: EMAIL_LEGIT,
          correct: "legit",
          explanation: {
            en: "Official domain for From and Reply-To, two named interviews, full role terms, the official careers portal and no fee.",
            hinglish:
              "From aur Reply-To mein official domain, do interviews jinke naam pata the, role ki poori terms, official careers portal aur koi fee nahi.",
          },
        },
        {
          id: "gmail-check-04",
          email: EMAIL_CHECK,
          correct: "needs-checking",
          explanation: {
            en: "There is no clear proof either way: no job reference, named recruiter, manager or interview history. The From field alone does not prove authenticity. Search the company careers page and contact HR using details found independently before sharing information.",
            hinglish:
              "Kisi bhi taraf ka saaf saboot nahi hai: na job reference, na recruiter ya manager ka naam, na interview history. Sirf From field se asli hona prove nahi hota. Koi bhi jaankari share karne se pehle company ka careers page search karo aur khud dhoondhi gayi details se HR ko contact karo.",
          },
        },
        {
          id: "gmail-hard-05",
          email: EMAIL_HARD,
          correct: "scam",
          explanation: {
            en: "The real domain is onboard-hr.example, Reply-To is another domain, the attachment is Offer_Letter.pdf.apk, and it asks for Aadhaar, PAN, bank details and a selfie.",
            hinglish:
              "Asli domain onboard-hr.example hai, Reply-To ek aur domain hai, attachment Offer_Letter.pdf.apk hai, aur yeh Aadhaar, PAN, bank details aur selfie maangta hai.",
          },
        },
      ],
      nextNodeId: "sorted",
    },
    sorted: {
      kind: "outcome",
      result: "safe",
      title: { en: "Inbox sorted", hinglish: "Inbox sort ho gaya" },
      body: {
        en: "See how your labels compare in the debrief.",
        hinglish: "Debrief mein dekho tumhare labels kitne sahi the.",
      },
    },
  },

  evidence: documentsFor(EMAILS),
  redFlags: pickRedFlags(redFlagIdsIn(EMAILS)),

  debrief: {
    rule: {
      en: "Distinguish real from fake. Don't assume every offer is a scam.",
      hinglish: "Asli aur nakli mein fark karo. Har offer ko scam mat maano.",
    },
    summary: {
      en: "Inspect the sender, the Reply-To and the attachments before you decide. When there's no proof either way, the answer is to verify through an official channel you find yourself.",
      hinglish:
        "Decide karne se pehle sender, Reply-To aur attachments check karo. Jab kisi bhi taraf ka saboot na ho, toh khud dhoondhe gaye official channel se verify karna hi sahi jawab hai.",
    },
    realWorldAction: REAL_WORLD_ACTION,
  },
});
