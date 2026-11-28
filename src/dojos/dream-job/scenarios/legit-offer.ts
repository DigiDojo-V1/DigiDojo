import { defineScenario } from "@/engine/define";
import { documentsFor, EMAIL_LEGIT } from "../content/emails";
import { pickPanels } from "../content/evidence";
import { REAL_WORLD_ACTION } from "../content/universe";

/**
 * Control: GMAIL-LEGIT-03. A genuine offer. Rejecting it is a missed opportunity, and any flag
 * is a false alarm. Source: docs/scenarios/dream-job/blueprint.docx, section 4A.
 */
export const legitOffer = defineScenario({
  id: "legit-offer",
  dojoId: "dream-job",
  title: "The written offer",
  summary: "After two interviews, an offer arrives. Accept it or walk away?",
  legit: true,
  primer: {
    title: "The written offer",
    body: "Open the email, check who sent it and what it asks of you, then decide whether to accept.",
    setup:
      "You're Ananya. You've had two interviews with Nexora Technologies for a Business Research Intern role. Today, an email with a written offer lands in your inbox.",
  },
  startNodeId: "gmail-legit",

  nodes: {
    "gmail-legit": {
      kind: "email",
      app: "gmail",
      email: EMAIL_LEGIT,
      evidence: ["nexora-careers", "nexora-company"],
      choices: [
        { label: "Accept through the official careers portal", nextNodeId: "accepted" },
        { label: "Reject it. Job offers by email are always scams", nextNodeId: "missed" },
      ],
    },
    accepted: {
      kind: "outcome",
      result: "safe",
      title: "You start on 1 December",
      body: "This offer was verifiable: the official domain, two named interviews, a named manager, the role reference, the official careers portal and no fee.",
    },
    missed: {
      kind: "outcome",
      result: "missed-opportunity",
      title: "You turned down a real offer",
      body: "This one was genuine. It came from priya.nair@nexora.example after two named interviews, matched the role discussed, used careers.nexora.example and asked for no money. Documents come only after acceptance, through the verified process.",
      rewindToNodeId: "gmail-legit",
    },
  },

  evidence: { ...pickPanels(["nexora-careers", "nexora-company"]), ...documentsFor([EMAIL_LEGIT]) },
  redFlags: {},

  debrief: {
    rule: "Not every opportunity is a scam. Recognise a verifiable offer too.",
    summary:
      "The sender and Reply-To use the official company domain. The email follows two named interview stages and matches the role discussed. It includes a named reporting manager, role reference, stipend, duration and start date. The acceptance portal is on the official careers host, and no fee is requested.",
    realWorldAction: REAL_WORLD_ACTION,
  },
});
