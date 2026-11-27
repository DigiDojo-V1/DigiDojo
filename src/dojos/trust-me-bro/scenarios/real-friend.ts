import { defineScenario } from "@/engine/define";

/**
 * Control: a real friend really does need help. Checking on a call is the right move, and so
 * is helping once you've checked. Refusing is a missed opportunity, and any flag is a false
 * alarm. Script: docs/scenarios/trust-me-bro/real-friend.md. Everyone here is fictional.
 */

const NEHA = { name: "Neha", subtitle: "online" };

export const realFriend = defineScenario({
  id: "real-friend",
  dojoId: "trust-me-bro",
  title: "Neha needs a favour",
  summary: "A friend sends a voice note asking you to book her ticket. Scam or a real favour?",
  legit: true,
  primer: {
    title: "Check, then trust",
    body: "Not every money request from a friend is a scam. The habit that protects you is the same one that lets you help: confirm it's them on a channel you already trust.",
    setup:
      "Neha is in your college group and you've been to two gigs together. She's saved in your contacts and messages you on WhatsApp.",
  },
  startNodeId: "the-favour",

  nodes: {
    "the-favour": {
      kind: "thread",
      app: "whatsapp",
      contact: NEHA,
      messages: [
        { id: "fv-hi", from: "them", text: "heyyy are you free for 2 min", delayMs: 900 },
        {
          id: "fv-voice",
          from: "them",
          voiceNote: { durationSec: 11 },
          text: "Okay so early-bird tickets for the Lagori Fest open in ten minutes and my card got blocked this morning. Can you book mine with yours? It's ₹800, I'll send it back as soon as I'm home.",
          delayMs: 1800,
        },
        {
          id: "fv-link",
          from: "them",
          text: "same site we used last time, I'll be in the same zone as you",
          delayMs: 1200,
        },
      ],
      choices: [
        { label: "Call Neha to check it's her", nextNodeId: "on-call" },
        { label: "Nope. Block her, this is a scam", nextNodeId: "blocked" },
      ],
    },

    "on-call": {
      kind: "thread",
      app: "whatsapp",
      contact: NEHA,
      messages: [
        { id: "oc-call", from: "system", text: "Voice call · 0:41", delayMs: 600 },
        {
          id: "oc-yes",
          from: "them",
          text: "lol yes it's me, good that you checked 😂",
          delayMs: 1200,
        },
        {
          id: "oc-card",
          from: "them",
          text: "typed my PIN wrong three times, the bank unblocks it tomorrow",
          delayMs: 1300,
        },
        {
          id: "oc-pay-back",
          from: "them",
          text: "book it on the fest's own site, I'll pay you back from my account tonight",
          delayMs: 1300,
        },
      ],
      choices: [
        { label: "Book her ticket on the fest's site", nextNodeId: "booked" },
        { label: "Still say no, just in case", nextNodeId: "said-no" },
      ],
    },

    booked: {
      kind: "outcome",
      result: "safe",
      title: "Two tickets, one happy friend",
      body: "You checked on a call, booked on the fest's own site and Neha paid you back that night. Checking didn't make you rude. It made you sure.",
    },
    blocked: {
      kind: "outcome",
      result: "missed-opportunity",
      title: "You blocked the real Neha",
      body: "This one was genuine: a saved contact, a normal request, and she'd have picked up if you'd called. A quick call would have told you that.",
      rewindToNodeId: "the-favour",
    },
    "said-no": {
      kind: "outcome",
      result: "missed-opportunity",
      title: "She missed the early-bird tickets",
      body: "You'd already confirmed it was Neha on a live call, from her own saved number. Once you've checked, it's fine to help.",
      rewindToNodeId: "on-call",
    },
  },

  redFlags: {},

  debrief: {
    rule: "Not every request is a scam. Check on a channel you trust, then help.",
    summary:
      "Neha messaged from her saved number, picked up straight away, gave an ordinary reason and sent you to the real ticket site. There was no secrecy, no stranger's account and no pressure to skip a call.",
    realWorldAction:
      "If a friend's request ever feels off, call them on their saved number before you pay. If you've already paid a scammer, call 1930 and report at cybercrime.gov.in.",
  },
});
