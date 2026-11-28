import { defineScenario } from "@/engine/define";

/**
 * Reel to voice clone. Your friend posts a funny reel on Instagram. The next day a new number
 * sends a WhatsApp voice note in his voice, saying words he never said. The reel audio is a
 * real 3.8 second clip of a DigiDojo teammate, and the WhatsApp note is an AI clone made from
 * that clip, both used with the teammate's permission. Script:
 * docs/scenarios/trust-me-bro/bohot-urgent.md. The names, handles and numbers are fictional.
 */

const KABIR_INSTA = { name: "kabir.on.loop", subtitle: "Active 2h ago" };
const SCAMMER = { name: "+91 81204 66379", subtitle: "online" };
const KABIR = { name: "Kabir", subtitle: "last seen today at 11:40" };

/** The words in Kabir's reel, exactly as he says them. */
const REEL_TRANSCRIPT =
  "Bhai bhai, bohot urgent hai, ₹5,000 bhej de! (Bro, it's really urgent, send ₹5,000!)";

export const bohotUrgent = defineScenario({
  id: "bohot-urgent",
  dojoId: "trust-me-bro",
  title: "Bhai, bohot urgent",
  summary:
    "Your friend's funny reel, then his voice from a new number. Same voice, so same person?",
  legit: false,
  primer: {
    title: "Your reel is their recording",
    body: "A public reel gives anyone a few seconds of your voice. That's enough for a free app to make your voice say anything. In this scenario, the voice note on WhatsApp really is an AI clone, made from 3.8 seconds of a real person's reel.",
    setup:
      "Your friend Kabir posts comedy reels on a public Instagram account. Tonight he sends you his newest one.",
    watchFor: [
      "Where could someone get a recording of this voice?",
      "Is this the number I have saved for him?",
      "Can I talk to him live before I pay?",
    ],
  },
  startNodeId: "the-reel",

  nodes: {
    "the-reel": {
      kind: "thread",
      app: "instagram",
      contact: KABIR_INSTA,
      evidence: ["kabir-profile"],
      messages: [
        {
          id: "reel-share",
          from: "them",
          text: "new reel 😂 tag that one friend who only calls when he needs money",
          delayMs: 900,
        },
        {
          id: "reel-audio",
          from: "them",
          voiceNote: { durationSec: 4, voice: "male", mood: "urgent" },
          text: REEL_TRANSCRIPT,
          delayMs: 1400,
        },
        { id: "reel-views", from: "them", text: "already 2k views on it 🔥", delayMs: 1100 },
      ],
      choices: [{ label: "😂😂 Reply and go to sleep", nextNodeId: "new-number" }],
    },

    "new-number": {
      kind: "thread",
      app: "whatsapp",
      contact: SCAMMER,
      messages: [
        {
          id: "nn-kabir",
          from: "them",
          segments: [
            { text: "Bhai Kabir here. " },
            {
              id: "nn-new-sim",
              text: "Lost my phone, this is my roommate's number",
              redFlagId: "new-number",
            },
          ],
          delayMs: 1000,
        },
        {
          id: "clone-voice",
          from: "them",
          voiceNote: { durationSec: 9, voice: "male", mood: "urgent" },
          segments: [
            { text: "Bhai, it's Kabir. I lost my phone, this is my roommate's number. " },
            {
              id: "cv-fee",
              text: "My hostel fee is due today, send five thousand right now.",
              redFlagId: "urgent-money",
            },
            { text: " I'll return it tomorrow, promise." },
          ],
          delayMs: 1800,
        },
        {
          id: "nn-upi",
          from: "them",
          segments: [
            { text: "send to my roommate's UPI: " },
            { id: "nn-upi-id", text: "mk.store4410@okpay", redFlagId: "someone-elses-upi" },
          ],
          delayMs: 1200,
        },
      ],
      choices: [
        { label: "It's his voice. Send ₹5,000", nextNodeId: "paid" },
        { label: "Call me first", nextNodeId: "no-call" },
        { label: "Call Kabir's saved number", nextNodeId: "real-kabir" },
      ],
    },

    "no-call": {
      kind: "thread",
      app: "whatsapp",
      contact: SCAMMER,
      messages: [
        {
          id: "nc-busy",
          from: "them",
          text: "can't talk, I'm at the fee counter, line is moving",
          redFlagId: "wont-call",
          delayMs: 1400,
        },
        {
          id: "nc-voice",
          from: "them",
          segments: [
            { id: "nc-heard", text: "you heard my voice na bro", redFlagId: "voice-as-proof" },
            { text: ", pls fast, counter closes at 1" },
          ],
          delayMs: 1300,
        },
      ],
      choices: [
        { label: "Okay, sending ₹5,000", nextNodeId: "paid" },
        { label: "Call Kabir's saved number", nextNodeId: "real-kabir" },
      ],
    },

    "real-kabir": {
      kind: "thread",
      app: "whatsapp",
      contact: KABIR,
      messages: [
        { id: "rk-call", from: "system", text: "Voice call · 0:37", delayMs: 600 },
        {
          id: "rk-what",
          from: "them",
          text: "bro what?? my phone is right here, and my fees were paid in July",
          delayMs: 1200,
        },
        {
          id: "rk-mine",
          from: "them",
          text: "wait. this is the only real recording of me saying anything like that 👇",
          delayMs: 1300,
        },
        {
          id: "rk-reel",
          from: "them",
          voiceNote: { durationSec: 4, voice: "male", mood: "urgent" },
          text: REEL_TRANSCRIPT,
          delayMs: 1300,
        },
        {
          id: "rk-copied",
          from: "them",
          text: "4 seconds of my reel and they made me say a whole new sentence 😳 I never said 'hostel fee' or 'roommate'",
          delayMs: 1500,
        },
        {
          id: "rk-private",
          from: "them",
          text: "block and report that number. I'm making my account private tonight",
          delayMs: 1200,
        },
      ],
      choices: [{ label: "Block and report the number", nextNodeId: "safe" }],
    },

    paid: {
      kind: "thread",
      app: "whatsapp",
      contact: SCAMMER,
      messages: [
        {
          id: "pd-receipt",
          from: "system",
          text: "₹5,000 paid to M K STORE · mk.store4410@okpay",
          delayMs: 600,
        },
        { id: "pd-thanks", from: "them", text: "thanks bhai ❤️", delayMs: 1100 },
        {
          id: "pd-more",
          from: "them",
          text: "one more thing, hostel says ₹3,000 late fine also, send that too and I'm done",
          redFlagId: "second-ask",
          delayMs: 1800,
        },
      ],
      choices: [
        { label: "Send ₹3,000 more", nextNodeId: "lost-big" },
        { label: "Stop and call Kabir's saved number", nextNodeId: "too-late" },
      ],
    },

    safe: {
      kind: "outcome",
      result: "safe",
      title: "You called the real Kabir",
      body: "The voice was his, but the words weren't. A 37-second call on his saved number was all it took. You didn't lose a rupee.",
    },
    "too-late": {
      kind: "outcome",
      result: "partial-loss",
      title: "₹5,000 to a copy of Kabir's voice",
      body: "Kabir's phone was with him all along. The money went to M K STORE. Call 1930 within the hour: the faster you report, the better the chance the bank freezes it.",
      moneyDelta: -5000,
      rewindToNodeId: "new-number",
    },
    "lost-big": {
      kind: "outcome",
      result: "loss",
      title: "₹8,000 to a voice made from a reel",
      body: "Four seconds of a comedy reel became a voice note asking for money, and then a second ask. The number stopped replying once you'd paid.",
      moneyDelta: -8000,
      rewindToNodeId: "new-number",
    },
  },

  evidence: {
    "kabir-profile": {
      kind: "profile",
      title: "kabir.on.loop",
      subtitle: "comedy reels 🎬 college life",
      sections: [
        {
          fields: [
            { id: "kp-name", slot: "name", label: "Name", value: "Kabir" },
            {
              id: "kp-bio",
              slot: "headline",
              label: "Bio",
              value: "comedy reels 🎬 college life",
            },
            {
              id: "kp-followers",
              slot: "connections",
              label: "Followers",
              value: "1,240 followers · 48 reels",
            },
          ],
        },
        {
          heading: "About this account",
          fields: [
            {
              id: "kp-public",
              label: "Account",
              value: "Public: anyone can watch and download his reels",
              redFlagId: "public-voice",
            },
          ],
        },
      ],
    },
  },

  redFlags: {
    "public-voice": {
      label: "His voice is public",
      tactic: "data-harvest",
      explanation:
        "48 public reels are hours of free recordings. A cloning app needs only a few seconds of them.",
    },
    "new-number": {
      label: "A friend on a new number",
      tactic: "impersonation",
      explanation:
        '"Lost my phone, new number" lets anyone be Kabir. Call the number you have saved.',
    },
    "urgent-money": {
      label: "Money right now",
      tactic: "urgency",
      explanation: 'A fee due "today" and "right now" leaves no time to check with anyone.',
    },
    "someone-elses-upi": {
      label: "Pay to a different name",
      tactic: "impersonation",
      explanation: "Money for Kabir goes to M K STORE, a business you've never heard of.",
    },
    "wont-call": {
      label: "Won't take a call",
      tactic: "blocks-verification",
      explanation:
        "A clone can send voice notes, but it can't hold a live chat. So there's always a reason not to talk.",
    },
    "voice-as-proof": {
      label: '"You heard my voice"',
      tactic: "impersonation",
      explanation: "The voice note was made from his reel. A voice proves nothing on its own.",
    },
    "second-ask": {
      label: "One more payment",
      tactic: "sunk-cost",
      explanation: "Once you've paid, a second ask feels easier to say yes to.",
    },
  },

  debrief: {
    rule: "A voice can be copied from a reel. Check the person on the number you already have.",
    summary:
      "This wasn't only a story. The reel was a real 3.8 second clip of a DigiDojo teammate, and the WhatsApp voice note was made from it by a free AI tool, saying words they never said. Both are used with their permission. If a few seconds of a reel can do that, any public video of you can.",
    realWorldAction:
      "Keep your reels private or share them with close friends only, and agree on a code word with family. Paid a scammer? Call 1930 right away and report at cybercrime.gov.in.",
  },
});
