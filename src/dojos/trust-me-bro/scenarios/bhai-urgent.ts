import { defineScenario } from "@/engine/define";

/**
 * Voice-cloned friend. A "new number" sends a voice note that sounds like your friend and asks
 * for ₹5,000 for a hospital deposit. Script: docs/scenarios/trust-me-bro/bhai-urgent.md.
 * Everyone and every handle here is fictional.
 */

const SCAMMER = { name: "+91 97384 21065", subtitle: "online" };
const ARJUN = { name: "Arjun", subtitle: "last seen today at 14:02" };

export const bhaiUrgent = defineScenario({
  id: "bhai-urgent",
  dojoId: "trust-me-bro",
  title: "Bhai, urgent",
  summary: "Your best friend's voice asks for ₹5,000 from a new number. Help him or check first?",
  legit: false,
  primer: {
    title: "The cloned voice",
    body: "Just 3 seconds of someone's voice from a reel can be enough for an app to copy it. Scammers use a copied voice to ask friends and family for money, fast, from a number you've never seen.",
    setup:
      "It's Saturday evening. Your friend Arjun was at Rohan's party last night. A number you don't know messages you on WhatsApp.",
    watchFor: [
      "How do I know who is really on the other end?",
      "Can I reach this person some other way before I pay?",
      "Whose name is on the account I'm paying?",
    ],
  },
  startNodeId: "new-number",

  nodes: {
    "new-number": {
      kind: "thread",
      app: "whatsapp",
      contact: SCAMMER,
      messages: [
        { id: "nn-hi", from: "them", text: "Bro it's me Arjun", delayMs: 900 },
        {
          id: "nn-story",
          from: "them",
          segments: [
            { text: "My phone fell in the pool at Rohan's party 🤦 " },
            {
              id: "nn-new-number",
              text: "this is my cousin's phone, save this number",
              redFlagId: "new-number",
            },
          ],
          delayMs: 1400,
        },
      ],
      choices: [
        { label: "Arjun?? What happened, you okay?", nextNodeId: "the-ask" },
        { label: "Who is this? I'll call Arjun's old number", nextNodeId: "real-arjun" },
      ],
    },

    "the-ask": {
      kind: "thread",
      app: "whatsapp",
      contact: SCAMMER,
      messages: [
        {
          id: "ask-voice",
          from: "them",
          voiceNote: { durationSec: 16, voice: "male", mood: "urgent" },
          segments: [
            { text: "Bhai listen, I'm at City Care hospital with Papa. " },
            {
              id: "ask-deposit",
              text: "They need a ₹5,000 deposit right now before they admit him, ",
              redFlagId: "urgent-money",
            },
            { text: "and my UPI is blocked on this new SIM. I'll return it tonight, pakka." },
          ],
          delayMs: 1800,
        },
        { id: "ask-fast", from: "them", text: "pls bro fast 🙏", delayMs: 900 },
        {
          id: "ask-upi",
          from: "them",
          segments: [
            { text: "Send it to my cousin's UPI: " },
            { id: "ask-upi-id", text: "rk.traders2291@okpay", redFlagId: "someone-elses-upi" },
          ],
          delayMs: 1200,
        },
        {
          id: "ask-secret",
          from: "them",
          segments: [
            {
              id: "ask-dont-tell",
              text: "And don't tell anyone in the group,",
              redFlagId: "keep-it-secret",
            },
            { text: " Papa doesn't want people to know" },
          ],
          delayMs: 1300,
        },
      ],
      choices: [
        { label: "Send ₹5,000 now", nextNodeId: "sent-once" },
        { label: "Call me, I want to hear you first", nextNodeId: "cant-talk" },
        { label: "Quick: what did we order at Rohan's party?", nextNodeId: "the-quiz" },
      ],
    },

    "cant-talk": {
      kind: "thread",
      app: "whatsapp",
      contact: SCAMMER,
      messages: [
        {
          id: "ct-noisy",
          from: "them",
          text: "can't talk bro, ward is so noisy and battery is 3%",
          redFlagId: "wont-call",
          delayMs: 1500,
        },
        {
          id: "ct-voice",
          from: "them",
          voiceNote: { durationSec: 8, voice: "male", mood: "pleading" },
          segments: [
            {
              id: "ct-my-voice",
              text: "Bhai it's me na, you know my voice.",
              redFlagId: "voice-as-proof",
            },
            { text: " Just send it, I'll explain everything later." },
          ],
          delayMs: 1600,
        },
      ],
      choices: [
        { label: "Okay, sending ₹5,000", nextNodeId: "sent-once" },
        { label: "Call Arjun's old number anyway", nextNodeId: "real-arjun" },
      ],
    },

    "the-quiz": {
      kind: "thread",
      app: "whatsapp",
      contact: SCAMMER,
      messages: [
        { id: "qz-kbc", from: "them", text: "bro what is this, KBC? 😂", delayMs: 1300 },
        {
          id: "qz-dodge",
          from: "them",
          segments: [
            {
              id: "qz-dodges",
              text: "I'm literally in a hospital and you're quizzing me?",
              redFlagId: "dodges-question",
            },
            { text: " forget it, I thought you were my real friend" },
          ],
          delayMs: 1500,
        },
      ],
      choices: [
        { label: "Sorry bro, sending now", nextNodeId: "sent-once" },
        { label: "Call Arjun's old number", nextNodeId: "real-arjun" },
      ],
    },

    "sent-once": {
      kind: "thread",
      app: "whatsapp",
      contact: SCAMMER,
      messages: [
        {
          id: "so-receipt",
          from: "system",
          text: "₹5,000 paid to R K TRADERS · rk.traders2291@okpay",
          delayMs: 600,
        },
        { id: "so-thanks", from: "them", text: "thank you bro, lifesaver ❤️", delayMs: 1200 },
        {
          id: "so-more",
          from: "them",
          segments: [
            { text: "Bhai one more problem. " },
            {
              id: "so-scan",
              text: "Doctor says ₹8,000 more for the scan, only then they'll start",
              redFlagId: "second-ask",
            },
          ],
          delayMs: 2200,
        },
        {
          id: "so-last",
          from: "them",
          text: "please, last time. I'll return all 13k tonight",
          delayMs: 1200,
        },
      ],
      choices: [
        { label: "Send ₹8,000 more", nextNodeId: "lost-big" },
        { label: "Stop and call Arjun's old number", nextNodeId: "real-arjun-after" },
      ],
    },

    "real-arjun": {
      kind: "thread",
      app: "whatsapp",
      contact: ARJUN,
      messages: [
        { id: "ra-call", from: "system", text: "Voice call · 0:48", delayMs: 600 },
        {
          id: "ra-fine",
          from: "them",
          text: "bro my phone is totally fine, I'm in the library 😳",
          delayMs: 1200,
        },
        {
          id: "ra-not-me",
          from: "them",
          text: "that's NOT me. they must have copied my voice from my reels",
          delayMs: 1400,
        },
        {
          id: "ra-report",
          from: "them",
          text: "block and report that number pls, I'll warn the group too",
          delayMs: 1200,
        },
      ],
      choices: [{ label: "Block and report the number", nextNodeId: "safe" }],
    },

    "real-arjun-after": {
      kind: "thread",
      app: "whatsapp",
      contact: ARJUN,
      messages: [
        { id: "rx-call", from: "system", text: "Voice call · 1:12", delayMs: 600 },
        {
          id: "rx-fine",
          from: "them",
          text: "WHAT. bro I never sent you anything, my phone is right here",
          delayMs: 1200,
        },
        {
          id: "rx-1930",
          from: "them",
          text: "call 1930 right now, the faster you report the better the chance they freeze it",
          delayMs: 1400,
        },
      ],
      choices: [{ label: "Call 1930 and report the number", nextNodeId: "partial" }],
    },

    safe: {
      kind: "outcome",
      result: "safe",
      title: "You checked with the real Arjun",
      body: "One call to the number you already had was enough. The voice was a copy, and you didn't lose a rupee.",
    },
    partial: {
      kind: "outcome",
      result: "partial-loss",
      title: "You stopped after the first payment",
      body: "The ₹5,000 went to a stranger's account, not to Arjun. Reporting within the first hour gives the bank the best chance to freeze it.",
      moneyDelta: -5000,
      rewindToNodeId: "the-ask",
    },
    "lost-big": {
      kind: "outcome",
      result: "loss",
      title: "₹13,000 to a voice that wasn't Arjun",
      body: "You paid ₹5,000 and then ₹8,000 to R K TRADERS. The real Arjun was in the library the whole time, and the number stopped replying.",
      moneyDelta: -13000,
      rewindToNodeId: "the-ask",
    },
  },

  redFlags: {
    "new-number": {
      label: "A known friend on an unknown number",
      tactic: "impersonation",
      explanation:
        '"New number, save it" lets anyone claim to be your friend. Check on the number you already have.',
    },
    "urgent-money": {
      label: "An emergency that needs money right now",
      tactic: "urgency",
      explanation:
        'A hospital deposit "right now" leaves no time to think or to check with anyone else.',
    },
    "someone-elses-upi": {
      label: "Pay to a different name",
      tactic: "impersonation",
      explanation:
        "Money for Arjun is going to an account called R K TRADERS. A friend in trouble would share his own or a family member's account.",
    },
    "keep-it-secret": {
      label: "Don't tell anyone",
      tactic: "isolation",
      explanation:
        'Keeping the group out of it stops the one person who could say "I\'m with Arjun right now".',
    },
    "wont-call": {
      label: "Won't take a call",
      tactic: "isolation",
      explanation:
        "A live call would expose the copy, so there's always a reason not to talk: noise, battery, signal.",
    },
    "voice-as-proof": {
      label: '"You know my voice"',
      tactic: "impersonation",
      explanation:
        "A voice can be copied from as little as 3 seconds of audio. It proves nothing on its own.",
    },
    "dodges-question": {
      label: "Dodges a simple check",
      tactic: "impersonation",
      explanation:
        "The real Arjun could answer in a second. Turning a check into guilt is how a fake avoids it.",
    },
    "second-ask": {
      label: "One more payment",
      tactic: "sunk-cost",
      explanation:
        'Once you\'ve paid, a second ask feels easier to say yes to, so you can "save" the first payment.',
    },
  },

  debrief: {
    rule: "Before you send money to a friend, call them on the number you already have.",
    summary:
      "The story, the voice and the pressure were all built to stop you from checking. A cloned voice sounds right, so check the person, not the voice: call their old number, ask someone who's with them, or ask something only they would know.",
    realWorldAction:
      "Paid a scammer? Call 1930 right away and report at cybercrime.gov.in. Then tell your friend, so they can warn others.",
  },
});
