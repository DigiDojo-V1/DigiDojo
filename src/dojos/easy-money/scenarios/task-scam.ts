import { defineScenario } from "@/engine/define";
import { pickPanels } from "../content/evidence";
import { pickRedFlags } from "../content/red-flags";

/**
 * Task scam: ₹50 a like → Telegram "VIP prepaid tasks" → frozen withdrawal.
 * Source: docs/scenarios/easy-money/task-scam.md.
 */
const riya = {
  name: "Riya | Digital Promotions",
  subtitle: "Active now",
  avatar: "/dojos/easy-money/riya.jpg",
};
const group = { name: "TaskEarn VIP", subtitle: "1,284 members" };
const mentor = "Anjali (Mentor)";

export const taskScam = defineScenario({
  id: "task-scam",
  dojoId: "easy-money",
  title: "Like videos, lose lakhs",
  summary: "₹50 a like turns into a “VIP task” that needs your money. How far do you go?",
  legit: false,
  primer: {
    title: "Small win first",
    body: "They pay you a little, fast, so you trust them with a lot. Watch for the moment the money starts flowing the other way.",
    setup:
      "You're Rohan, a second-year B.Com student saving up for a new phone. An account messages you on Instagram about a part-time job.",
    watchFor: [
      "Does the pay make sense for the work?",
      "Which way is the money flowing?",
      "Who is this account, really?",
    ],
  },
  startNodeId: "insta-dm",

  nodes: {
    "insta-dm": {
      kind: "thread",
      app: "instagram",
      contact: riya,
      messages: [
        {
          id: "dm-hiring",
          from: "them",
          delayMs: 1000,
          text: "Hi Rohan! We're hiring part-timers to like YouTube videos for our clients 😊",
        },
        {
          id: "dm-pay",
          from: "them",
          delayMs: 1300,
          text: "₹50 per like, takes 2 minutes. Students earn ₹1,500-₹3,000 a day from their phone",
          redFlagId: "paid-for-likes",
        },
        {
          id: "dm-try",
          from: "them",
          delayMs: 1100,
          text: "Want to try now? Like these 3 videos and send me screenshots 👇",
        },
      ],
      evidence: ["riya-profile"],
      choices: [
        { label: "Sure, sending the screenshots now", nextNodeId: "first-payout" },
        { label: "Not interested. Block the account", nextNodeId: "safe-early" },
      ],
    },

    "first-payout": {
      kind: "thread",
      app: "instagram",
      // Same app and contact as `insta-dm`, so the chat carries on.
      contact: riya,
      messages: [
        {
          id: "payout-credit",
          from: "system",
          delayMs: 1500,
          text: "₹150 credited to your account from RIYA DIGITAL",
          redFlagId: "instant-payout",
        },
        { id: "payout-done", from: "them", text: "Done! ₹150 for 3 likes 🥳 You're fast" },
        {
          id: "payout-group",
          from: "them",
          delayMs: 1300,
          text: "For more tasks, join our Telegram group TaskEarn VIP. Our mentor Anjali will guide you",
        },
      ],
      evidence: ["riya-profile"],
      choices: [
        { label: "Join the Telegram group", nextNodeId: "tg-group" },
        { label: "Keep the ₹150 and stop here", nextNodeId: "safe-early-bonus" },
      ],
    },

    "tg-group": {
      kind: "thread",
      app: "telegram",
      contact: group,
      messages: [
        {
          id: "group-inert",
          from: "system",
          delayMs: 300,
          text: "Simulated group. These members and links aren't real.",
        },
        {
          id: "group-welcome",
          from: "them",
          sender: mentor,
          delayMs: 1000,
          text: "Welcome new members 🎉 Today's top earners 👇",
        },
        {
          id: "group-earners",
          from: "them",
          sender: "Pooja S",
          delayMs: 1200,
          text: "Karan just withdrew ₹18,400 💰 Sneha ₹22,750 🔥 Thank you Anjali ma'am!!",
          redFlagId: "fake-earners",
        },
        {
          id: "group-vip-task",
          from: "them",
          sender: mentor,
          delayMs: 1400,
          text: "VIP prepaid task: deposit ₹1,000, get ₹1,480 back in 10 minutes",
          redFlagId: "deposit-task",
        },
        {
          id: "group-slots",
          from: "them",
          sender: mentor,
          text: "Only 3 VIP slots left today ⏳",
          redFlagId: "slots-left",
        },
      ],
      evidence: ["taskearn-group"],
      choices: [
        { label: "Pay ₹1,000 for the VIP task", nextNodeId: "vip-paid" },
        { label: "Leave the group and report it", nextNodeId: "safe-group" },
      ],
    },

    "vip-paid": {
      kind: "thread",
      app: "telegram",
      contact: group,
      messages: [
        {
          id: "vip-credit",
          from: "system",
          delayMs: 1500,
          text: "₹1,480 credited to your account from TASKEARN PAYOUTS",
        },
        { id: "vip-profit", from: "them", sender: mentor, text: "See? 48% profit in 10 mins 😎" },
        {
          id: "vip-next-level",
          from: "them",
          sender: mentor,
          delayMs: 1300,
          text: "Next level: deposit ₹8,000, get ₹11,200. Most members do this one twice a day",
        },
      ],
      evidence: ["taskearn-group"],
      choices: [
        { label: "Pay ₹8,000 for the next task", nextNodeId: "withdraw-blocked" },
        { label: "Stop here, I'm ₹630 up", nextNodeId: "safe-ahead" },
      ],
    },

    "withdraw-blocked": {
      kind: "thread",
      app: "telegram",
      contact: group,
      messages: [
        {
          id: "blocked-me",
          from: "me",
          delayMs: 600,
          text: "Paid ₹8,000. When do I get the ₹11,200?",
        },
        {
          id: "blocked-frozen",
          from: "them",
          sender: mentor,
          delayMs: 1500,
          text: "Your balance is ₹11,200 ✅ But you made an error in task 3, so withdrawal is frozen",
        },
        {
          id: "blocked-combo",
          from: "them",
          sender: mentor,
          delayMs: 1400,
          text: "Complete 2 more combo tasks (₹25,000) to unlock everything. Then you get ₹46,000",
          redFlagId: "pay-to-withdraw",
        },
        {
          id: "blocked-choice",
          from: "them",
          sender: mentor,
          text: "If you stop now, your ₹11,200 is lost. Your choice 🤷‍♀️",
        },
      ],
      evidence: ["taskearn-group"],
      choices: [
        { label: "Pay ₹25,000 to unlock it", nextNodeId: "lost-big" },
        { label: "Stop paying. Call 1930 and report now", nextNodeId: "lost-some" },
      ],
    },

    "safe-early": {
      kind: "outcome",
      result: "safe",
      title: "You didn't take the bait",
      body: "Getting paid ₹50 for a like is the opening move of a task scam. You walked away before it started.",
    },
    "safe-early-bonus": {
      kind: "outcome",
      result: "safe",
      title: "You kept ₹150 and left",
      body: "That ₹150 was bait meant to pull you into the Telegram group. Leaving here cost them money, not you. Block and report the account.",
    },
    "safe-group": {
      kind: "outcome",
      result: "safe",
      title: "You left before paying",
      body: "The moment a “job” asks you to deposit money, it's a scam. You left the group with nothing lost.",
    },
    "safe-ahead": {
      kind: "outcome",
      result: "safe",
      title: "You got out ₹630 up, by luck",
      body: "They paid the first VIP task back on purpose so you'd trust them with ₹8,000. Most people don't stop here. Report the group so others don't get pulled in.",
    },
    "lost-some": {
      kind: "outcome",
      result: "partial-loss",
      title: "₹7,370 gone",
      body: "Your “₹11,200 balance” was never real. You stopped and reported fast, which gives the police the best chance of freezing the money, but most of it is usually gone.",
      moneyDelta: -7370,
      rewindToNodeId: "vip-paid",
    },
    "lost-big": {
      kind: "outcome",
      result: "loss",
      title: "₹32,370 gone",
      body: "After the ₹25,000 there was another “error” and another fee. There always is. The group blocked you once you stopped paying.",
      moneyDelta: -32370,
      rewindToNodeId: "withdraw-blocked",
    },
  },

  evidence: pickPanels(["riya-profile", "taskearn-group"]),
  redFlags: pickRedFlags([
    "paid-for-likes",
    "instant-payout",
    "fake-earners",
    "deposit-task",
    "slots-left",
    "pay-to-withdraw",
    "brand-new-account",
    "admins-only-group",
  ]),

  debrief: {
    rule: "If you have to pay to get paid, it's a scam.",
    summary:
      "Task scams start with real money: small, fast payouts for trivial work so you trust them. Then comes the “prepaid” or “VIP” task where you deposit first, and the first one even pays back. Once the amounts grow, withdrawal gets “frozen” until you pay more. The balance on their screen is fake, and every extra payment only adds to the loss.",
    realWorldAction:
      "Paid a task group? Stop paying, take screenshots, call 1930 right away and report at cybercrime.gov.in. Speed matters: the faster you report, the better the chance of freezing the money.",
  },
});
