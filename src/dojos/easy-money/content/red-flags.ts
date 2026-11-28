import type { RedFlagInput } from "@/engine/schema";

/**
 * Every Easy Money red flag, from the scripts in docs/scenarios/easy-money/. Scenarios pick
 * the ones they use with `pickRedFlags`, because the schema rejects a red flag nothing carries.
 */
export const RED_FLAGS = {
  // Task scam: chats
  "paid-for-likes": {
    label: { en: "₹50 for a two-second like", hinglish: "Do second ke like ke ₹50" },
    tactic: "too-good-to-be-true",
    explanation: {
      en: "Nobody pays ₹50 for a two-second like; the pay is bait, not wages.",
      hinglish: "Do second ke like ke ₹50 koi nahi deta; yeh pay chaara hai, kamai nahi.",
    },
  },
  "instant-payout": {
    label: {
      en: "Instant payout for trivial work",
      hinglish: "Chhote-mote kaam ka instant payout",
    },
    tactic: "small-win-first",
    explanation: {
      en: "The quick payout exists only to make you trust them before they ask for money.",
      hinglish:
        "Jaldi payout sirf isliye hai taaki paise maangne se pehle tum unpe bharosa kar lo.",
    },
  },
  "fake-earners": {
    label: {
      en: "Earner shout-outs in the group",
      hinglish: "Group mein kamane walon ke shout-outs",
    },
    tactic: "social-proof",
    explanation: {
      en: "Group members and screenshots are fakes or the scammers themselves.",
      hinglish: "Group members aur screenshots fake hain, ya khud scammers hi hain.",
    },
  },
  "deposit-task": {
    label: {
      en: "Deposit first to get a task",
      hinglish: "Task paane ke liye pehle deposit",
    },
    tactic: "pay-to-earn",
    explanation: {
      en: "The moment you pay to earn, it's no longer a job, it's a scam.",
      hinglish: "Jis pal kamane ke liye paise bharne pade, woh job nahi rehti, scam ban jaati hai.",
    },
  },
  "slots-left": {
    label: { en: "Only 3 VIP slots left", hinglish: "Sirf 3 VIP slots bache" },
    tactic: "urgency",
    explanation: {
      en: "The countdown is there to stop you thinking it through.",
      hinglish: "Countdown isliye hai taaki tum theek se soch na sako.",
    },
  },
  "pay-to-withdraw": {
    label: {
      en: "Pay more to unlock your balance",
      hinglish: "Balance unlock karne ke liye aur bharo",
    },
    tactic: "sunk-cost",
    explanation: {
      en: "Your “balance” is just a number on their screen; paying more only adds to the loss.",
      hinglish:
        "Tumhara “balance” bas unki screen pe ek number hai; aur bharne se sirf nuksaan badhta hai.",
    },
  },
  // Task scam: panels
  "brand-new-account": {
    label: { en: "Account only 3 weeks old", hinglish: "Account sirf 3 hafte purana" },
    tactic: "no-real-process",
    explanation: {
      en: "A “hiring” account made three weeks ago, with only promo posts, has no history you can check; scam accounts are made and dropped fast.",
      hinglish:
        "Teen hafte pehle bana “hiring” account, jismein sirf promo posts hain, uski koi history check nahi ho sakti; scam accounts jaldi bante hain aur jaldi chhod diye jaate hain.",
    },
  },
  "admins-only-group": {
    label: { en: "Only admins can post", hinglish: "Sirf admins post kar sakte hain" },
    tactic: "social-proof",
    explanation: {
      en: "If only admins can send messages, every “earner” post was put there by the people running the group, and no member can warn you.",
      hinglish:
        "Agar sirf admins message bhej sakte hain, toh har “earner” post group chalane walon ne hi daali hai, aur koi member tumhe warn nahi kar sakta.",
    },
  },

  // Money mule: chats
  "easy-commission": {
    label: {
      en: "Big pay for 10 minutes a day",
      hinglish: "Din ke 10 minute ka bada pay",
    },
    tactic: "too-good-to-be-true",
    explanation: {
      en: "Nobody pays that much for ten minutes on a phone unless the real price is something else.",
      hinglish:
        "Phone pe das minute ke itne paise koi nahi deta, jab tak asli keemat kuch aur na ho.",
    },
  },
  "rent-your-account": {
    label: {
      en: "Money passes through your account",
      hinglish: "Paisa tumhare account se guzarta hai",
    },
    tactic: "no-real-process",
    explanation: {
      en: "A real company collects payments in its own account; it only needs yours to hide whose money it is.",
      hinglish:
        "Asli company payments apne account mein leti hai; tumhara account sirf yeh chhupane ke liye chahiye ki paisa kiska hai.",
    },
  },
  "others-do-it": {
    label: {
      en: "“200+ students already do it”",
      hinglish: "“200+ students pehle se kar rahe hain”",
    },
    tactic: "social-proof",
    explanation: {
      en: "Other people doing it doesn't make it legal: mule gangs recruit students in batches from the same colleges.",
      hinglish:
        "Dusre log kar rahe hain toh legal nahi ho jaata: mule gangs ek hi college se students ko batches mein recruit karte hain.",
    },
  },
  "account-kit": {
    label: {
      en: "Asks for your card, PIN and login",
      hinglish: "Tumhara card, PIN aur login maangta hai",
    },
    tactic: "data-harvest",
    explanation: {
      en: "No employer needs your PIN or net banking login; with them, they control your account.",
      hinglish:
        "Kisi employer ko tumhara PIN ya net banking login nahi chahiye; inse tumhara account unke control mein aa jaata hai.",
    },
  },
  "joining-bonus": {
    label: { en: "Joining bonus lands first", hinglish: "Pehle joining bonus aata hai" },
    tactic: "small-win-first",
    explanation: {
      en: "The bonus tests that your account works for them and makes you trust the much bigger transfer that follows.",
      hinglish:
        "Bonus se woh test karte hain ki tumhara account unke kaam aata hai, aur tum uske baad aane wale bahut bade transfer pe bharosa kar lo.",
    },
  },
  "move-it-fast": {
    label: { en: "Forward it within 15 minutes", hinglish: "15 minute mein aage bhejo" },
    tactic: "urgency",
    explanation: {
      en: "They rush you so the money leaves your account before the victim's bank can stop it.",
      hinglish:
        "Jaldi isliye karwate hain taaki victim ka bank rokne se pehle paisa tumhare account se nikal jaaye.",
    },
  },
  "keep-it-quiet": {
    label: { en: "Don't tell home or the bank", hinglish: "Ghar ya bank mein mat batana" },
    tactic: "isolation",
    explanation: {
      en: "Anyone you told would spot it in seconds, so they keep you alone with it.",
      hinglish:
        "Jise bhi batate, woh seconds mein pakad leta, isliye woh chahte hain ki tum akele raho.",
    },
  },
  // Money mule: panels
  "renamed-account": {
    label: { en: "Username changed 3 times", hinglish: "Username 3 baar badla" },
    tactic: "no-real-process",
    explanation: {
      en: "An account that was a loan helpdesk and a crypto page before this “gig” gets renamed whenever it's reported; there's no real company behind it.",
      hinglish:
        "Jo account is “gig” se pehle loan helpdesk aur crypto page tha, woh har report ke baad naam badal leta hai; iske peeche koi asli company nahi hai.",
    },
  },
} satisfies Record<string, RedFlagInput>;

export type EasyMoneyRedFlagId = keyof typeof RED_FLAGS;

/** The red flags a scenario uses, by id. */
export function pickRedFlags(ids: readonly EasyMoneyRedFlagId[]): Record<string, RedFlagInput> {
  return Object.fromEntries(ids.map((id) => [id, RED_FLAGS[id]]));
}
