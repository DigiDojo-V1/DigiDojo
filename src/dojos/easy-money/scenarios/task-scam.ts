import { defineScenario } from "@/engine/define";
import { pickPanels } from "../content/evidence";
import { pickRedFlags } from "../content/red-flags";

/**
 * Task scam: ₹50 a like → Telegram "VIP prepaid tasks" → frozen withdrawal.
 * Source: docs/scenarios/easy-money/task-scam.md.
 */
const riya = {
  name: { en: "Riya | Digital Promotions", hinglish: "Riya | Digital Promotions" },
  subtitle: "Active now",
  avatar: "/dojos/easy-money/riya.jpg",
};
const group = { name: { en: "TaskEarn VIP", hinglish: "TaskEarn VIP" }, subtitle: "1,284 members" };
const mentor = { en: "Anjali (Mentor)", hinglish: "Anjali (Mentor)" };

export const taskScam = defineScenario({
  id: "task-scam",
  dojoId: "easy-money",
  title: { en: "Like videos, lose lakhs", hinglish: "Videos like karo, lakhs gawao" },
  summary: {
    en: "₹50 a like turns into a “VIP task” that needs your money. How far do you go?",
    hinglish:
      "₹50 per like se shuru, phir ek “VIP task” jo tumhare paise maangta hai. Tum kitna aage jaoge?",
  },
  legit: false,
  primer: {
    title: { en: "Small win first", hinglish: "Pehle chhota fayda" },
    body: {
      en: "They pay you a little, fast, so you trust them with a lot. Watch for the moment the money starts flowing the other way.",
      hinglish:
        "Pehle jaldi se thode paise dete hain, taaki tum unpe bada bharosa kar lo. Dhyaan rakhna, kab paisa ulti taraf jaane lagta hai.",
    },
    setup: {
      en: "You're Rohan, a second-year B.Com student saving up for a new phone. An account messages you on Instagram about a part-time job.",
      hinglish:
        "Tum Rohan ho, B.Com second year ke student, naye phone ke liye paise jod rahe ho. Instagram pe ek account tumhe part-time job ke baare mein message karta hai.",
    },
    watchFor: [
      {
        en: "Does the pay make sense for the work?",
        hinglish: "Kya kaam ke hisaab se pay sahi lagta hai?",
      },
      { en: "Which way is the money flowing?", hinglish: "Paisa kis taraf ja raha hai?" },
      { en: "Who is this account, really?", hinglish: "Yeh account asal mein hai kaun?" },
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
          text: {
            en: "Hi Rohan! We're hiring part-timers to like YouTube videos for our clients 😊",
            hinglish:
              "Hi Rohan! Hum apne clients ke liye YouTube videos like karne wale part-timers hire kar rahe hain 😊",
          },
        },
        {
          id: "dm-pay",
          from: "them",
          delayMs: 1300,
          text: {
            en: "₹50 per like, takes 2 minutes. Students earn ₹1,500-₹3,000 a day from their phone",
            hinglish:
              "₹50 per like, bas 2 minute lagte hain. Students apne phone se roz ₹1,500-₹3,000 kama rahe hain",
          },
          redFlagId: "paid-for-likes",
        },
        {
          id: "dm-try",
          from: "them",
          delayMs: 1100,
          text: {
            en: "Want to try now? Like these 3 videos and send me screenshots 👇",
            hinglish: "Abhi try karna hai? Yeh 3 videos like karo aur mujhe screenshots bhejo 👇",
          },
        },
      ],
      evidence: ["riya-profile"],
      choices: [
        {
          label: {
            en: "Sure, sending the screenshots now",
            hinglish: "Haan, abhi screenshots bhejta hoon",
          },
          nextNodeId: "first-payout",
        },
        {
          label: {
            en: "Not interested. Block the account",
            hinglish: "Interested nahi. Account block karo",
          },
          nextNodeId: "safe-early",
        },
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
        {
          id: "payout-done",
          from: "them",
          text: {
            en: "Done! ₹150 for 3 likes 🥳 You're fast",
            hinglish: "Ho gaya! 3 likes ke ₹150 🥳 Tum toh fast ho",
          },
        },
        {
          id: "payout-group",
          from: "them",
          delayMs: 1300,
          text: {
            en: "For more tasks, join our Telegram group TaskEarn VIP. Our mentor Anjali will guide you",
            hinglish:
              "Aur tasks ke liye humara Telegram group TaskEarn VIP join karo. Humari mentor Anjali tumhe guide karengi",
          },
        },
      ],
      evidence: ["riya-profile"],
      choices: [
        {
          label: { en: "Join the Telegram group", hinglish: "Telegram group join karo" },
          nextNodeId: "tg-group",
        },
        {
          label: {
            en: "Keep the ₹150 and stop here",
            hinglish: "₹150 rakh lo aur yahin ruk jao",
          },
          nextNodeId: "safe-early-bonus",
        },
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
          text: {
            en: "Simulated group. These members and links aren't real.",
            hinglish: "Simulated group hai. Yeh members aur links asli nahi hain.",
          },
        },
        {
          id: "group-welcome",
          from: "them",
          sender: mentor,
          delayMs: 1000,
          text: {
            en: "Welcome new members 🎉 Today's top earners 👇",
            hinglish: "Naye members ka welcome 🎉 Aaj ke top earners 👇",
          },
        },
        {
          id: "group-earners",
          from: "them",
          sender: { en: "Pooja S", hinglish: "Pooja S" },
          delayMs: 1200,
          text: {
            en: "Karan just withdrew ₹18,400 💰 Sneha ₹22,750 🔥 Thank you Anjali ma'am!!",
            hinglish:
              "Karan ne abhi ₹18,400 withdraw kiye 💰 Sneha ne ₹22,750 🔥 Thank you Anjali ma'am!!",
          },
          redFlagId: "fake-earners",
        },
        {
          id: "group-vip-task",
          from: "them",
          sender: mentor,
          delayMs: 1400,
          text: {
            en: "VIP prepaid task: deposit ₹1,000, get ₹1,480 back in 10 minutes",
            hinglish: "VIP prepaid task: ₹1,000 deposit karo, 10 minute mein ₹1,480 wapas pao",
          },
          redFlagId: "deposit-task",
        },
        {
          id: "group-slots",
          from: "them",
          sender: mentor,
          text: {
            en: "Only 3 VIP slots left today ⏳",
            hinglish: "Aaj sirf 3 VIP slots bache hain ⏳",
          },
          redFlagId: "slots-left",
        },
      ],
      evidence: ["taskearn-group"],
      choices: [
        {
          label: {
            en: "Pay ₹1,000 for the VIP task",
            hinglish: "VIP task ke liye ₹1,000 bharo",
          },
          nextNodeId: "vip-paid",
        },
        {
          label: {
            en: "Leave the group and report it",
            hinglish: "Group chhodo aur report karo",
          },
          nextNodeId: "safe-group",
        },
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
        {
          id: "vip-profit",
          from: "them",
          sender: mentor,
          text: {
            en: "See? 48% profit in 10 mins 😎",
            hinglish: "Dekha? 10 min mein 48% profit 😎",
          },
        },
        {
          id: "vip-next-level",
          from: "them",
          sender: mentor,
          delayMs: 1300,
          text: {
            en: "Next level: deposit ₹8,000, get ₹11,200. Most members do this one twice a day",
            hinglish:
              "Next level: ₹8,000 deposit karo, ₹11,200 pao. Zyada tar members yeh din mein do baar karte hain",
          },
        },
      ],
      evidence: ["taskearn-group"],
      choices: [
        {
          label: {
            en: "Pay ₹8,000 for the next task",
            hinglish: "Next task ke liye ₹8,000 bharo",
          },
          nextNodeId: "withdraw-blocked",
        },
        {
          label: {
            en: "Stop here, I'm ₹630 up",
            hinglish: "Yahin ruko, main ₹630 profit mein hoon",
          },
          nextNodeId: "safe-ahead",
        },
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
          text: {
            en: "Paid ₹8,000. When do I get the ₹11,200?",
            hinglish: "₹8,000 bhar diye. ₹11,200 kab milenge?",
          },
        },
        {
          id: "blocked-frozen",
          from: "them",
          sender: mentor,
          delayMs: 1500,
          text: {
            en: "Your balance is ₹11,200 ✅ But you made an error in task 3, so withdrawal is frozen",
            hinglish:
              "Aapka balance ₹11,200 hai ✅ Par aapne task 3 mein error kiya, isliye withdrawal frozen hai",
          },
        },
        {
          id: "blocked-combo",
          from: "them",
          sender: mentor,
          delayMs: 1400,
          text: {
            en: "Complete 2 more combo tasks (₹25,000) to unlock everything. Then you get ₹46,000",
            hinglish:
              "Sab unlock karne ke liye 2 aur combo tasks (₹25,000) complete karo. Phir aapko ₹46,000 milenge",
          },
          redFlagId: "pay-to-withdraw",
        },
        {
          id: "blocked-choice",
          from: "them",
          sender: mentor,
          text: {
            en: "If you stop now, your ₹11,200 is lost. Your choice 🤷‍♀️",
            hinglish: "Abhi rukoge toh aapke ₹11,200 gaye. Aapki marzi 🤷‍♀️",
          },
        },
      ],
      evidence: ["taskearn-group"],
      choices: [
        {
          label: {
            en: "Pay ₹25,000 to unlock it",
            hinglish: "Unlock karne ke liye ₹25,000 bharo",
          },
          nextNodeId: "lost-big",
        },
        {
          label: {
            en: "Stop paying. Call 1930 and report now",
            hinglish: "Paise bharna band karo. Abhi 1930 pe call karke report karo",
          },
          nextNodeId: "lost-some",
        },
      ],
    },

    "safe-early": {
      kind: "outcome",
      result: "safe",
      title: { en: "You didn't take the bait", hinglish: "Tum jaal mein nahi phanse" },
      body: {
        en: "Getting paid ₹50 for a like is the opening move of a task scam. You walked away before it started.",
        hinglish:
          "Ek like ke ₹50 milna task scam ki pehli chaal hai. Tum shuru hone se pehle hi nikal gaye.",
      },
    },
    "safe-early-bonus": {
      kind: "outcome",
      result: "safe",
      title: { en: "You kept ₹150 and left", hinglish: "Tumne ₹150 rakhe aur nikal gaye" },
      body: {
        en: "That ₹150 was bait meant to pull you into the Telegram group. Leaving here cost them money, not you. Block and report the account.",
        hinglish:
          "Woh ₹150 tumhe Telegram group mein kheenchne ka chaara tha. Yahan nikalne se nuksaan unka hua, tumhara nahi. Account block aur report karo.",
      },
    },
    "safe-group": {
      kind: "outcome",
      result: "safe",
      title: { en: "You left before paying", hinglish: "Tum paise bharne se pehle nikal gaye" },
      body: {
        en: "The moment a “job” asks you to deposit money, it's a scam. You left the group with nothing lost.",
        hinglish:
          "Jis pal koi “job” tumse paise deposit karwaye, woh scam hai. Tumne bina kuch gawaye group chhod diya.",
      },
    },
    "safe-ahead": {
      kind: "outcome",
      result: "safe",
      title: {
        en: "You got out ₹630 up, by luck",
        hinglish: "Tum ₹630 profit mein nikle, kismat se",
      },
      body: {
        en: "They paid the first VIP task back on purpose so you'd trust them with ₹8,000. Most people don't stop here. Report the group so others don't get pulled in.",
        hinglish:
          "Pehle VIP task ke paise unhone jaan-boojh ke lautaye, taaki tum unhe ₹8,000 de do. Zyada tar log yahan nahi rukte. Group report karo taaki baaki log na phanse.",
      },
    },
    "lost-some": {
      kind: "outcome",
      result: "partial-loss",
      title: { en: "₹7,370 gone", hinglish: "₹7,370 gaye" },
      body: {
        en: "Your “₹11,200 balance” was never real. You stopped and reported fast, which gives the police the best chance of freezing the money, but most of it is usually gone.",
        hinglish:
          "Tumhara “₹11,200 balance” kabhi asli tha hi nahi. Tumne jaldi ruk ke report kiya, isse police ke paas paisa freeze karwane ka sabse achha mauka hota hai, par aksar zyada tar paisa ja chuka hota hai.",
      },
      moneyDelta: -7370,
      rewindToNodeId: "vip-paid",
    },
    "lost-big": {
      kind: "outcome",
      result: "loss",
      title: { en: "₹32,370 gone", hinglish: "₹32,370 gaye" },
      body: {
        en: "After the ₹25,000 there was another “error” and another fee. There always is. The group blocked you once you stopped paying.",
        hinglish:
          "₹25,000 ke baad ek aur “error” aaya aur ek aur fee. Hamesha aata hai. Jaise hi tumne paise dena band kiya, group ne tumhe block kar diya.",
      },
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
    rule: {
      en: "If you have to pay to get paid, it's a scam.",
      hinglish: "Agar paise kamane ke liye pehle paise bharne pade, toh woh scam hai.",
    },
    summary: {
      en: "Task scams start with real money: small, fast payouts for trivial work so you trust them. Then comes the “prepaid” or “VIP” task where you deposit first, and the first one even pays back. Once the amounts grow, withdrawal gets “frozen” until you pay more. The balance on their screen is fake, and every extra payment only adds to the loss.",
      hinglish:
        "Task scams asli paison se shuru hote hain: chhote-mote kaam ke liye chhote, jaldi payouts, taaki tum bharosa kar lo. Phir aata hai “prepaid” ya “VIP” task jismein pehle tum deposit karte ho, aur pehla wala toh paise lauta bhi deta hai. Jab amount bade ho jaate hain, withdrawal “frozen” ho jaata hai jab tak tum aur na bharo. Unki screen pe dikhne wala balance fake hai, aur har extra payment bas nuksaan badhata hai.",
    },
    realWorldAction: {
      en: "Paid a task group? Stop paying, take screenshots, call 1930 right away and report at cybercrime.gov.in. Speed matters: the faster you report, the better the chance of freezing the money.",
      hinglish:
        "Kisi task group ko paise de diye? Paise dena band karo, screenshots lo, turant 1930 pe call karo aur cybercrime.gov.in pe report karo. Speed zaroori hai: jitni jaldi report karoge, paisa freeze hone ka chance utna achha.",
    },
  },
});
