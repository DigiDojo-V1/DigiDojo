import type { RedFlagInput } from "@/engine/schema";

/**
 * Every Easy Money red flag, from the scripts in docs/scenarios/easy-money/. Scenarios pick
 * the ones they use with `pickRedFlags`, because the schema rejects a red flag nothing carries.
 */
export const RED_FLAGS = {
  // Task scam: chats
  "paid-for-likes": {
    label: "₹50 for a two-second like",
    tactic: "too-good-to-be-true",
    explanation: "Nobody pays ₹50 for a two-second like; the pay is bait, not wages.",
  },
  "instant-payout": {
    label: "Instant payout for trivial work",
    tactic: "small-win-first",
    explanation: "The quick payout exists only to make you trust them before they ask for money.",
  },
  "fake-earners": {
    label: "Earner shout-outs in the group",
    tactic: "social-proof",
    explanation: "Group members and screenshots are fakes or the scammers themselves.",
  },
  "deposit-task": {
    label: "Deposit first to get a task",
    tactic: "pay-to-earn",
    explanation: "The moment you pay to earn, it's no longer a job, it's a scam.",
  },
  "slots-left": {
    label: "Only 3 VIP slots left",
    tactic: "urgency",
    explanation: "The countdown is there to stop you thinking it through.",
  },
  "pay-to-withdraw": {
    label: "Pay more to unlock your balance",
    tactic: "sunk-cost",
    explanation:
      "Your “balance” is just a number on their screen; paying more only adds to the loss.",
  },
  // Task scam: panels
  "brand-new-account": {
    label: "Account only 3 weeks old",
    tactic: "no-real-process",
    explanation:
      "A “hiring” account made three weeks ago, with only promo posts, has no history you can check; scam accounts are made and dropped fast.",
  },
  "admins-only-group": {
    label: "Only admins can post",
    tactic: "social-proof",
    explanation:
      "If only admins can send messages, every “earner” post was put there by the people running the group, and no member can warn you.",
  },

  // Money mule: chats
  "easy-commission": {
    label: "Big pay for 10 minutes a day",
    tactic: "too-good-to-be-true",
    explanation:
      "Nobody pays that much for ten minutes on a phone unless the real price is something else.",
  },
  "rent-your-account": {
    label: "Money passes through your account",
    tactic: "no-real-process",
    explanation:
      "A real company collects payments in its own account; it only needs yours to hide whose money it is.",
  },
  "others-do-it": {
    label: "“200+ students already do it”",
    tactic: "social-proof",
    explanation:
      "Other people doing it doesn't make it legal: mule gangs recruit students in batches from the same colleges.",
  },
  "account-kit": {
    label: "Asks for your card, PIN and login",
    tactic: "data-harvest",
    explanation:
      "No employer needs your PIN or net banking login; with them, they control your account.",
  },
  "joining-bonus": {
    label: "Joining bonus lands first",
    tactic: "small-win-first",
    explanation:
      "The bonus tests that your account works for them and makes you trust the much bigger transfer that follows.",
  },
  "move-it-fast": {
    label: "Forward it within 15 minutes",
    tactic: "urgency",
    explanation:
      "They rush you so the money leaves your account before the victim's bank can stop it.",
  },
  "keep-it-quiet": {
    label: "Don't tell home or the bank",
    tactic: "isolation",
    explanation: "Anyone you told would spot it in seconds, so they keep you alone with it.",
  },
  // Money mule: panels
  "renamed-account": {
    label: "Username changed 3 times",
    tactic: "no-real-process",
    explanation:
      "An account that was a loan helpdesk and a crypto page before this “gig” gets renamed whenever it's reported; there's no real company behind it.",
  },
} satisfies Record<string, RedFlagInput>;

export type EasyMoneyRedFlagId = keyof typeof RED_FLAGS;

/** The red flags a scenario uses, by id. */
export function pickRedFlags(ids: readonly EasyMoneyRedFlagId[]): Record<string, RedFlagInput> {
  return Object.fromEntries(ids.map((id) => [id, RED_FLAGS[id]]));
}
