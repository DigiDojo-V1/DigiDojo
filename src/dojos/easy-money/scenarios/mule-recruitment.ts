import { defineScenario } from "@/engine/define";
import { pickPanels } from "../content/evidence";
import { pickRedFlags } from "../content/red-flags";

/**
 * Money mule: an Instagram "payments gig" that rents your bank account.
 * Source: docs/scenarios/easy-money/mule-recruitment.md.
 */
const vikramInsta = {
  name: "Vikram | EasyEarn Hub",
  subtitle: "Active now",
  avatar: "/dojos/easy-money/vikram.jpg",
};
const vikramWa = {
  name: "Vikram EasyEarn",
  subtitle: "online",
  avatar: "/dojos/easy-money/vikram.jpg",
};

export const muleRecruitment = defineScenario({
  id: "mule-recruitment",
  dojoId: "easy-money",
  title: "Rent your account",
  summary:
    "An Instagram “payments gig” pays you to receive and forward money. Easy cash or a trap?",
  legit: false,
  primer: {
    title: "Rent your account",
    body: "Some “jobs” don't want your time. They want your bank account, so stolen money can move through your name instead of theirs. Watch what they actually ask you for.",
    setup:
      "You're Rohan, a second-year B.Com student. Your semester fee instalment is due next week, so you commented “interested” on an Instagram reel about earning from your phone.",
  },
  startNodeId: "insta-dm",

  nodes: {
    "insta-dm": {
      kind: "thread",
      app: "instagram",
      contact: vikramInsta,
      messages: [
        {
          id: "mule-hello",
          from: "them",
          delayMs: 1000,
          text: "Hey Rohan! Saw your comment on our reel 🙌",
        },
        {
          id: "mule-gig",
          from: "them",
          delayMs: 1300,
          segments: [
            { text: "We have a payments side gig for college students. " },
            {
              id: "mule-gig-pay",
              text: "10 min a day from your phone, students are making ₹5,000-₹10,000 a month",
              redFlagId: "easy-commission",
            },
          ],
        },
        {
          id: "mule-work",
          from: "them",
          delayMs: 1500,
          segments: [
            { text: "Work is simple: " },
            {
              id: "mule-work-forward",
              text: "our clients pay into your bank account, you transfer it to our company account same day",
              redFlagId: "rent-your-account",
            },
            { text: ". You keep 10% as commission 💸" },
          ],
        },
        { id: "mule-zero", from: "them", text: "Zero investment. Interested?" },
      ],
      evidence: ["vikram-profile"],
      choices: [
        { label: "Sounds easy. How do I start?", nextNodeId: "wa-setup" },
        {
          label: "Why can't your company take the payments in its own account?",
          nextNodeId: "insta-why",
        },
        { label: "Not interested. Block the account", nextNodeId: "safe-early" },
      ],
    },

    "insta-why": {
      kind: "thread",
      app: "instagram",
      // Same app and contact as `insta-dm`, so the chat carries on.
      contact: vikramInsta,
      messages: [
        {
          id: "why-gst",
          from: "them",
          delayMs: 1300,
          text: "Company account has GST limits bro, so we split payments across student accounts 🙂",
        },
        {
          id: "why-others",
          from: "them",
          delayMs: 1300,
          text: "200+ students from colleges here already do it. My own cousin made ₹9k last month",
          redFlagId: "others-do-it",
        },
        {
          id: "why-whatsapp",
          from: "them",
          delayMs: 1200,
          text: "Insta keeps flagging payment chats, let's continue on WhatsApp. Pinging you from +91 90000 54321",
        },
      ],
      evidence: ["vikram-profile"],
      choices: [
        { label: "Fine, let's continue on WhatsApp", nextNodeId: "wa-setup" },
        {
          label: "That doesn't add up. Block and report the account",
          nextNodeId: "safe-early",
        },
      ],
    },

    "wa-setup": {
      kind: "thread",
      app: "whatsapp",
      contact: vikramWa,
      messages: [
        {
          id: "wa-inert",
          from: "system",
          delayMs: 300,
          text: "Simulated chat. This number can't be called or messaged.",
        },
        {
          id: "wa-welcome",
          from: "them",
          delayMs: 1000,
          text: "Hey it's Vikram from EasyEarn 👋 Welcome to the team bro",
        },
        {
          id: "wa-kit",
          from: "them",
          delayMs: 1600,
          segments: [
            { text: "To activate your account I need " },
            {
              id: "wa-kit-details",
              text: "your account number + IFSC, photo of your ATM card front and back with the PIN, and your net banking login",
              redFlagId: "account-kit",
            },
            { text: " so our system can track payments" },
          ],
        },
        { id: "wa-safe", from: "them", text: "All safe bro, only for verification ✅" },
      ],
      choices: [
        { label: "Okay, sending everything now 👍", nextNodeId: "wa-first-job" },
        { label: "No way. I'm not sharing my PIN or login", nextNodeId: "safe-mid" },
      ],
    },

    "wa-first-job": {
      kind: "thread",
      app: "whatsapp",
      contact: vikramWa,
      messages: [
        {
          id: "job-bonus",
          from: "system",
          delayMs: 1200,
          text: "₹500 credited to your account. Ref: JOINING BONUS",
          redFlagId: "joining-bonus",
        },
        {
          id: "job-client-next",
          from: "them",
          text: "Bonus received? 😎 First client payment coming now",
        },
        {
          id: "job-credit",
          from: "system",
          delayMs: 1500,
          text: "₹48,000 credited to your account from R SURESH KUMAR",
        },
        {
          id: "job-forward",
          from: "them",
          delayMs: 1200,
          text: "Transfer ₹43,200 to vkstraders@paynest in the next 15 minutes, keep ₹4,800 for yourself 🤑",
          redFlagId: "move-it-fast",
        },
        {
          id: "job-quiet",
          from: "them",
          delayMs: 1300,
          text: "And don't tell anyone at home or the bank about this work, our clients want privacy 🤫",
          redFlagId: "keep-it-quiet",
        },
      ],
      choices: [
        { label: "Transfer ₹43,200 and keep ₹4,800", nextNodeId: "mule-caught" },
        { label: "Don't move it. Call the bank and 1930 now", nextNodeId: "reported" },
      ],
    },

    "safe-early": {
      kind: "outcome",
      result: "safe",
      title: "You didn't rent out your account",
      body: "A gig that pays you to receive and forward other people's money is money-mule recruitment. You walked away before they had anything of yours.",
    },
    "safe-mid": {
      kind: "outcome",
      result: "safe",
      title: "Your account stayed yours",
      body: "You refused to hand over your card, PIN and login. Block the number and report the Instagram account so they can't recruit your classmates.",
    },
    "mule-caught": {
      kind: "outcome",
      result: "compromised",
      title: "Your account is frozen",
      body: "The ₹48,000 was a task-scam victim's money. Their 1930 complaint led straight to your account: the bank froze it with your fee money inside, and police named you in the case. The ₹4,800 was never yours to keep.",
      rewindToNodeId: "wa-first-job",
    },
    reported: {
      kind: "outcome",
      result: "compromised",
      title: "You stopped the money, not the damage",
      body: "You didn't pass the ₹48,000 on and reported it within the hour, so the victim could get it back. But they still had your card, PIN and login: your account stayed frozen for weeks while you gave a statement and got a new card.",
      rewindToNodeId: "wa-setup",
    },
  },

  evidence: pickPanels(["vikram-profile"]),
  redFlags: pickRedFlags([
    "easy-commission",
    "rent-your-account",
    "others-do-it",
    "account-kit",
    "joining-bonus",
    "move-it-fast",
    "keep-it-quiet",
    "renamed-account",
  ]),

  debrief: {
    rule: "If a “job” needs your bank account more than your time, you're being recruited as a money mule.",
    summary:
      "Mule recruiters don't want your work. They need an account in someone else's name so stolen money can pass through it. The pay looks easy because the risk is all yours: when a victim reports the fraud, the trail ends at your account, which gets frozen, and police can name you as an accused. A real company collects payments in its own account and never asks for your ATM card, PIN or net banking login.",
    realWorldAction:
      "Shared your account details? Call your bank to block the card and net banking, don't move any money that lands in your account, then call 1930 and report at cybercrime.gov.in.",
  },
});
