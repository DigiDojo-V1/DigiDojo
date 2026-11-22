import { defineScenario } from "@/engine/define";

/**
 * EXAMPLE SCENARIO: copy this file to start a new one.
 *
 * The shape:
 *   nodes      A graph. `thread` nodes are chat screens that end in choices;
 *              `outcome` nodes end the run. Every choice points at another node id.
 *   messages   Reveal one by one. `delayMs` is the wait before each (default 800).
 *              `from: "system"` is for credit alerts, "X joined", etc.
 *   redFlagId  Put it on the message that carries the cue. Every red flag in
 *              `redFlags` must be used by at least one message.
 *   rewind     Loss outcomes set `rewindToNodeId` to the decision where the player
 *              could have stopped.
 *   text       Write player-facing text in English as a plain string: `title: "Like videos"`.
 *              Hinglish is added later by /translate-hinglish, which turns each field into
 *              `{ en: "...", hinglish: "..." }` like the ones below. `en` never changes then.
 *
 * `npm test` checks all of this. All names here are fictional.
 */
export const taskScamStarter = defineScenario({
  id: "task-scam-starter",
  dojoId: "easy-money",
  title: { en: "Like videos, earn money", hinglish: "Like karo, paise kamao" },
  summary: {
    en: "A DM offers you part-time work. Real job or a trap?",
    hinglish: "Ek DM mein part-time kaam ka offer aata hai. Asli hai ya jaal?",
  },
  legit: false,
  primer: {
    title: { en: "Small win first", hinglish: "Small win first" },
    body: {
      en: "First they pay you a little so you trust them. Then they ask for a big amount.",
      hinglish:
        "Pehle woh tumhe thode paise dete hain taaki tum unpe bharosa karo. Phir badi rakam maangte hain.",
    },
  },
  startNodeId: "dm",

  nodes: {
    dm: {
      kind: "thread",
      app: "instagram",
      contact: {
        name: { en: "Priya · HR", hinglish: "Priya · HR" },
        subtitle: { en: "Active now", hinglish: "Active now" },
      },
      messages: [
        {
          id: "dm-offer",
          from: "them",
          text: {
            en: "Hi! Saw your profile 😊 It's part-time work from home, just like videos and earn ₹3,000/day",
            hinglish:
              "Hi! Aapka profile dekha 😊 Part-time work from home hai, bas videos like karo aur ₹3,000/day kamao",
          },
          delayMs: 1000,
          redFlagId: "pay-far-above-work",
        },
        {
          id: "dm-interested",
          from: "them",
          text: {
            en: "No experience needed. Interested?",
            hinglish: "Koi experience nahi chahiye. Interested ho?",
          },
          delayMs: 1200,
        },
      ],
      choices: [
        {
          label: { en: "Yes, I'm interested!", hinglish: "Haan, interested hoon!" },
          nextNodeId: "task",
        },
        {
          label: { en: "Ignore and block", hinglish: "Ignore karke block karo" },
          nextNodeId: "safe-early",
        },
      ],
    },

    task: {
      kind: "thread",
      app: "instagram",
      // Same app and contact as `dm`, so the chat carries on with the earlier messages.
      contact: {
        name: { en: "Priya · HR", hinglish: "Priya · HR" },
        subtitle: { en: "Active now", hinglish: "Active now" },
      },
      messages: [
        {
          id: "task-brief",
          from: "them",
          text: {
            en: "The task is simple: like 3 videos and send screenshots. ₹50 per like 👍",
            hinglish: "Task simple hai: 3 videos like karo aur screenshot bhejo. ₹50 per like 👍",
          },
        },
        {
          id: "task-credit",
          from: "system",
          text: {
            en: "₹150 credited to your UPI account",
            hinglish: "₹150 aapke UPI account mein credit ho gaye",
          },
          delayMs: 1500,
          redFlagId: "instant-small-payout",
        },
        {
          id: "task-group",
          from: "them",
          text: {
            en: "See? Instant payment 💯 More tasks are in our VIP group, join here 👇",
            hinglish:
              "Dekha? Turant payment 💯 Aur tasks hamare VIP group mein milte hain, join karo 👇",
          },
        },
      ],
      choices: [
        { label: { en: "Join the group", hinglish: "Group join karo" }, nextNodeId: "group" },
      ],
    },

    group: {
      kind: "thread",
      app: "telegram",
      contact: {
        name: { en: "Earn Daily VIP", hinglish: "Earn Daily VIP" },
        subtitle: { en: "1,204 members", hinglish: "1,204 members" },
      },
      messages: [
        {
          id: "group-joined",
          from: "system",
          text: { en: "You joined the group", hinglish: "Aap group mein join ho gaye" },
          delayMs: 400,
        },
        {
          id: "group-rahul",
          from: "them",
          sender: { en: "Rahul", hinglish: "Rahul" },
          text: {
            en: "Made ₹2,800 today 🔥 [screenshot]",
            hinglish: "Aaj ₹2,800 kamaye 🔥 [screenshot]",
          },
          delayMs: 1000,
          redFlagId: "payout-screenshots",
        },
        {
          id: "group-prepaid",
          from: "them",
          sender: { en: "Mentor", hinglish: "Mentor" },
          text: {
            en: "Prepaid task: send ₹1,000, get ₹1,300 back in 10 min",
            hinglish: "Prepaid task: ₹1,000 bhejo, 10 min mein ₹1,300 wapas pao",
          },
          delayMs: 1400,
          redFlagId: "pay-to-earn",
        },
        {
          id: "group-slots",
          from: "them",
          sender: { en: "Mentor", hinglish: "Mentor" },
          text: {
            en: "Only 3 slots left! Hurry ⏰",
            hinglish: "Sirf 3 slots bache hain! Jaldi karo ⏰",
          },
          redFlagId: "slots-left",
        },
      ],
      choices: [
        { label: { en: "Pay ₹1,000", hinglish: "₹1,000 pay karo" }, nextNodeId: "lost" },
        {
          label: { en: "Leave the group and report it", hinglish: "Group chhodo aur report karo" },
          nextNodeId: "safe-late",
        },
      ],
    },

    "safe-early": {
      kind: "outcome",
      result: "safe",
      title: { en: "You're safe!", hinglish: "Bach gaye!" },
      body: {
        en: "You blocked them right at the start. ₹3,000 a day just for likes? Nobody pays that much for easy work.",
        hinglish:
          "Tumne shuru mein hi block kar diya. Sirf likes ke liye ₹3,000 roz? Itna aasaan paisa koi nahi deta.",
      },
    },

    "safe-late": {
      kind: "outcome",
      result: "safe",
      title: { en: "Got out in time", hinglish: "Time pe nikal gaye" },
      body: {
        en: "You left the group and reported it. You kept the ₹150 bait and didn't lose a single rupee.",
        hinglish:
          "Tumne group chhoda aur report kiya. ₹150 ka bait tumhare paas reh gaya, aur tumhara ek bhi rupaya nahi gaya.",
      },
      moneyDelta: 150,
    },

    lost: {
      kind: "outcome",
      result: "loss",
      title: { en: "Money gone", hinglish: "Paise doob gaye" },
      body: {
        en: "You paid ₹14,000 over three 'tasks' and got back only ₹1,450.",
        hinglish: "Teen 'tasks' mein tumne ₹14,000 bhare aur wapas mile sirf ₹1,450.",
      },
      moneyDelta: -12550,
      rewindToNodeId: "group",
    },
  },

  redFlags: {
    "pay-far-above-work": {
      label: { en: "Pay far above the work", hinglish: "Kaam se kahin zyada paisa" },
      tactic: "too-good-to-be-true",
      explanation: {
        en: "₹3,000 a day just for liking videos? No real company pays that much for such easy work.",
        hinglish:
          "Sirf videos like karne ke ₹3,000 roz? Itne aasaan kaam ka itna paisa koi asli company nahi deti.",
      },
    },
    "instant-small-payout": {
      label: { en: "Instant small payment", hinglish: "Turant chhota payment" },
      tactic: "small-win-first",
      explanation: {
        en: "The ₹150 was sent to win your trust. It's bait, so that later you send a big amount.",
        hinglish:
          "₹150 tumhara bharosa jeetne ke liye bheje gaye the. Yeh bait hai, taaki baad mein tum bada amount bhejo.",
      },
    },
    "payout-screenshots": {
      label: { en: "Earnings screenshots", hinglish: "Kamai ke screenshots" },
      tactic: "social-proof",
      explanation: {
        en: "The group's 'members' and their screenshots are often fake. Scammers fill the group with their own people.",
        hinglish:
          "Group ke 'members' aur unke screenshots aksar fake hote hain. Scammer apne hi log group mein bitha ke rakhte hain.",
      },
    },
    "pay-to-earn": {
      label: { en: "Pay first to earn", hinglish: "Kamane ke liye pehle paise bharo" },
      tactic: "pay-to-earn",
      explanation: {
        en: "In real work you get paid; you don't pay. A 'prepaid task' is the biggest sign of this scam.",
        hinglish:
          "Asli kaam mein tumhe paise milte hain, tum nahi bharte. 'Prepaid task' is scam ka sabse bada sign hai.",
      },
    },
    "slots-left": {
      label: { en: "Only 3 slots left", hinglish: "Sirf 3 slots bache" },
      tactic: "urgency",
      explanation: {
        en: "The rush is there so you don't stop and think.",
        hinglish: "Jaldi ka pressure isliye diya jaata hai taaki tum ruk ke soch na sako.",
      },
    },
  },

  debrief: {
    rule: {
      en: "If you have to pay to get paid, it's a scam.",
      hinglish: "Agar paise kamane ke liye pehle paise bharne pade, toh woh scam hai.",
    },
    realWorldAction: {
      en: "Lost money? Call 1930 right away and report at cybercrime.gov.in.",
      hinglish: "Paise gaye? Turant 1930 pe call karo aur cybercrime.gov.in pe report karo.",
    },
  },
});
