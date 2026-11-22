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
 *
 * `npm test` checks all of this. All names here are fictional.
 */
export const taskScamStarter = defineScenario({
  id: "task-scam-starter",
  dojoId: "easy-money",
  title: "Like karo, paise kamao",
  summary: "Ek DM mein part-time kaam ka offer aata hai. Asli hai ya jaal?",
  legit: false,
  primer: {
    title: "Small win first",
    body: "Pehle woh tumhe thode paise dete hain taaki tum unpe bharosa karo. Phir badi rakam maangte hain.",
  },
  startNodeId: "dm",

  nodes: {
    dm: {
      kind: "thread",
      app: "instagram",
      contact: { name: "Priya · HR", subtitle: "Active now" },
      messages: [
        {
          id: "dm-offer",
          from: "them",
          text: "Hi! Aapka profile dekha 😊 Part-time work from home hai, bas videos like karo aur ₹3,000/day kamao",
          delayMs: 1000,
          redFlagId: "pay-far-above-work",
        },
        {
          id: "dm-interested",
          from: "them",
          text: "Koi experience nahi chahiye. Interested ho?",
          delayMs: 1200,
        },
      ],
      choices: [
        { label: "Haan, interested hoon!", nextNodeId: "task" },
        { label: "Ignore karke block karo", nextNodeId: "safe-early" },
      ],
    },

    task: {
      kind: "thread",
      app: "instagram",
      // Same app and contact as `dm`, so the chat carries on with the earlier messages.
      contact: { name: "Priya · HR", subtitle: "Active now" },
      messages: [
        {
          id: "task-brief",
          from: "them",
          text: "Task simple hai: 3 videos like karo aur screenshot bhejo. ₹50 per like 👍",
        },
        {
          id: "task-credit",
          from: "system",
          text: "₹150 aapke UPI account mein credit ho gaye",
          delayMs: 1500,
          redFlagId: "instant-small-payout",
        },
        {
          id: "task-group",
          from: "them",
          text: "Dekha? Turant payment 💯 Aur tasks hamare VIP group mein milte hain, join karo 👇",
        },
      ],
      choices: [{ label: "Group join karo", nextNodeId: "group" }],
    },

    group: {
      kind: "thread",
      app: "telegram",
      contact: { name: "Earn Daily VIP", subtitle: "1,204 members" },
      messages: [
        { id: "group-joined", from: "system", text: "Aap group mein join ho gaye", delayMs: 400 },
        {
          id: "group-rahul",
          from: "them",
          sender: "Rahul",
          text: "Aaj ₹2,800 kamaye 🔥 [screenshot]",
          delayMs: 1000,
          redFlagId: "payout-screenshots",
        },
        {
          id: "group-prepaid",
          from: "them",
          sender: "Mentor",
          text: "Prepaid task: ₹1,000 bhejo, 10 min mein ₹1,300 wapas pao",
          delayMs: 1400,
          redFlagId: "pay-to-earn",
        },
        {
          id: "group-slots",
          from: "them",
          sender: "Mentor",
          text: "Sirf 3 slots bache hain! Jaldi karo ⏰",
          redFlagId: "slots-left",
        },
      ],
      choices: [
        { label: "₹1,000 pay karo", nextNodeId: "lost" },
        { label: "Group chhodo aur report karo", nextNodeId: "safe-late" },
      ],
    },

    "safe-early": {
      kind: "outcome",
      result: "safe",
      title: "Bach gaye!",
      body: "Tumne shuru mein hi block kar diya. Sirf likes ke liye ₹3,000 roz? Itna aasaan paisa koi nahi deta.",
    },

    "safe-late": {
      kind: "outcome",
      result: "safe",
      title: "Time pe nikal gaye",
      body: "Tumne group chhoda aur report kiya. ₹150 ka bait tumhare paas reh gaya, aur tumhara ek bhi rupaya nahi gaya.",
      moneyDelta: 150,
    },

    lost: {
      kind: "outcome",
      result: "loss",
      title: "Paise doob gaye",
      body: "Teen 'tasks' mein tumne ₹14,000 bhare aur wapas mile sirf ₹1,450.",
      moneyDelta: -12550,
      rewindToNodeId: "group",
    },
  },

  redFlags: {
    "pay-far-above-work": {
      label: "Kaam se kahin zyada paisa",
      tactic: "too-good-to-be-true",
      explanation:
        "Sirf videos like karne ke ₹3,000 roz? Itne aasaan kaam ka itna paisa koi asli company nahi deti.",
    },
    "instant-small-payout": {
      label: "Turant chhota payment",
      tactic: "small-win-first",
      explanation:
        "₹150 tumhara bharosa jeetne ke liye bheje gaye the. Yeh bait hai, taaki baad mein tum bada amount bhejo.",
    },
    "payout-screenshots": {
      label: "Kamai ke screenshots",
      tactic: "social-proof",
      explanation:
        "Group ke 'members' aur unke screenshots aksar fake hote hain. Scammer apne hi log group mein bitha ke rakhte hain.",
    },
    "pay-to-earn": {
      label: "Kamane ke liye pehle paise bharo",
      tactic: "pay-to-earn",
      explanation:
        "Asli kaam mein tumhe paise milte hain, tum nahi bharte. 'Prepaid task' is scam ka sabse bada sign hai.",
    },
    "slots-left": {
      label: "Sirf 3 slots bache",
      tactic: "urgency",
      explanation: "Jaldi ka pressure isliye diya jaata hai taaki tum ruk ke soch na sako.",
    },
  },

  debrief: {
    rule: "Agar paise kamane ke liye pehle paise bharne pade, toh woh scam hai.",
    realWorldAction: "Paise gaye? Turant 1930 pe call karo aur cybercrime.gov.in pe report karo.",
  },
});
