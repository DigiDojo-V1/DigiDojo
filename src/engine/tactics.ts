import type { Tactic } from "./schema";

/** Manipulation tactics: a short label and one line the debrief shows the player. */
export const TACTICS_INFO: Record<Tactic, { label: string; explanation: string }> = {
  "small-win-first": {
    label: "Small win first",
    explanation: "They pay you a little first so you trust them with a lot.",
  },
  "pay-to-earn": {
    label: "Pay to earn",
    explanation: "You're asked to pay money before you can earn money. Real jobs never do this.",
  },
  urgency: {
    label: "Urgency",
    explanation: "A ticking clock stops you from thinking or asking someone.",
  },
  "social-proof": {
    label: "Social proof",
    explanation: "Fake members and screenshots make it look like everyone is winning.",
  },
  "sunk-cost": {
    label: "Sunk cost",
    explanation: "Once you've paid, they make you pay more to 'unlock' what you already paid.",
  },
  authority: {
    label: "Authority",
    explanation: "Someone claims to be police, a bank or an officer so you obey without checking.",
  },
  isolation: {
    label: "Isolation",
    explanation: "They tell you to keep it secret so nobody can warn you.",
  },
  "too-good-to-be-true": {
    label: "Too good to be true",
    explanation: "The pay or prize is far above what the effort is worth.",
  },
  flattery: {
    label: "Flattery",
    explanation: "Praise and 'you're specially selected' lower your guard.",
  },
  impersonation: {
    label: "Impersonation",
    explanation: "They pretend to be someone you know or trust.",
  },
};
