import { defineScenario } from "@/engine/define";
import { BANK, BANK_SENDER, PRIYA, REAL_WORLD_ACTION } from "../content/universe";

/**
 * The dojo's legit call: a genuine card-security call from the bank. It asks for nothing secret
 * and invites the player to call back. Rejecting everything doesn't win: ignoring a real alert
 * is a missed opportunity, and hanging up to call the number on the card is always right.
 */

const BANK_NUMBER = "1800 200 4400";
const SMS_TEXT = `Nimbus Bank: Txn of Rs 18,450.00 at GADGETKART ONLINE on card XX4821 was declined and your card is temporarily blocked. Not you? Call the number on the back of your card. We never ask for OTP, PIN or CVV.`;
const bank = { name: BANK, subtitle: BANK_NUMBER };

export const cardAlert = defineScenario({
  id: "card-alert",
  dojoId: "authority",
  title: "A call about your card",
  summary: "Your bank calls about a payment you didn't make. Real alert or another trick?",
  legit: true,
  primer: {
    title: "Not every bank call is a scam",
    body: "Real banks do call when their fraud checks block a payment. Listen for what this caller asks you for, and what they never ask for.",
    setup: `You're Priya Nair again. You bank with ${BANK}, and your debit card ends in 4821. You haven't bought anything online today.`,
    watchFor: ["What is the caller asking you for?", "Are you free to hang up and check?"],
  },
  startNodeId: "alert-call",

  nodes: {
    "alert-call": {
      kind: "live-call",
      app: "call",
      caller: { name: BANK, number: BANK_NUMBER, label: "Card security" },
      player: PRIYA,
      agent: {
        voice: "Kore",
        character: `Kavya Iyer from ${BANK}'s card security team. You are a GENUINE bank employee: warm, unhurried and clear. You're calling because the fraud system declined a suspicious Rs 18,450 online payment attempt on her debit card ending 4821 at "GadgetKart Online" about ten minutes ago. The card is temporarily blocked as a precaution and no money has left the account.`,
        stages: [
          {
            name: "Greeting",
            say: "Introduce yourself and the bank, check you're speaking with Priya Nair, and say straight away that you won't ask for her PIN, OTP, CVV or card number on this call.",
          },
          {
            name: "The alert",
            say: "Explain the declined Rs 18,450 attempt at GadgetKart Online on the card ending 4821; trigger alert-sms so she sees the bank's text. Then ask one yes-or-no question: did she make this purchase?",
          },
          {
            name: "Next steps",
            say: "If it wasn't her: you'll block the card for good, a new one reaches her registered address in 5 to 7 working days, and the Rs 18,450 was never debited. If it was her: you'll unblock it. Give the reference number CS-20418.",
          },
          {
            name: "Close",
            say: "Remind her she can always hang up and call the number on the back of her card to confirm anything, quoting CS-20418. Thank her and end the call.",
          },
        ],
        responses: [
          {
            ifPlayer: "suspicious, or asking how they can trust you",
            reply:
              'Agree it\'s sensible: "Please hang up and call the number on the back of your card, and quote CS-20418." No pressure at all.',
          },
          {
            ifPlayer: "starting to read out an OTP, PIN, CVV or card number",
            reply:
              'Stop her straight away: "Please don\'t share that with anyone, including us. I only need a yes or no."',
          },
          {
            ifPlayer: "rude, or wanting to end the call",
            reply:
              "Stay polite and let her go. Mention she can call the number on her card any time.",
          },
        ],
        rules: [
          "There is no deadline and no penalty. Never rush her.",
          "Never ask her to install anything, tap a link or move money.",
        ],
        vocabulary: [
          "Nimbus National Bank",
          "Kavya Iyer",
          "GadgetKart Online",
          "CS-20418",
          "card security",
          "18,450",
        ],
      },
      events: {
        "alert-sms": {
          kind: "sms",
          sender: BANK_SENDER,
          text: SMS_TEXT,
          cue: "In the alert stage, while you describe the declined payment.",
        },
      },
      rubric: {
        goodMoves: [
          "Stayed calm and answered the yes-or-no question.",
          "Didn't volunteer an OTP, PIN, CVV or full card number.",
          "Asked how to verify, or hung up to call the number on the card (also a perfect move).",
        ],
        mistakes: [
          "Volunteered an OTP, PIN, CVV, password or full card number.",
          "Dismissed a genuine alert without checking at all, leaving the fraud attempt unreported.",
          "Got hostile instead of verifying.",
        ],
        examples: [
          {
            player:
              "Said it wasn't her, listened, asked how to verify, and noted the reference number",
            rating: 9.5,
          },
          {
            player: "Hung up straight away, saying she'd call the number on her card",
            rating: 9,
          },
          { player: "Offered to read out her full card number to 'help' the bank", rating: 3 },
        ],
      },
      outcomes: [
        {
          id: "confirmed",
          when: "The player told the bank whether she made the purchase, and the call wrapped up normally.",
          nextNodeId: "alert-safe",
        },
        {
          id: "left",
          when: "The player hung up or dismissed the call before telling the bank anything.",
          nextNodeId: "alert-sms",
        },
      ],
      scriptedNodeId: "alert-open",
      declineNodeId: "alert-sms",
      maxMinutes: 5,
    },

    /* ---------------- The scripted call ---------------- */

    "alert-open": {
      kind: "thread",
      app: "call",
      contact: bank,
      messages: [
        {
          id: "alert-hello",
          from: "them",
          delayMs: 900,
          text: `Hello, am I speaking with Priya Nair? This is Kavya from ${BANK}'s card security team. Before anything else: I won't ask for your PIN, OTP, CVV or card number on this call.`,
        },
        { id: "alert-me-yes", from: "me", text: "Yes, this is Priya.", delayMs: 900 },
        {
          id: "alert-what",
          from: "them",
          delayMs: 1800,
          text: "About ten minutes ago, someone tried to pay ₹18,450 at GadgetKart Online with your debit card ending 4821. Our system declined it and put a temporary block on the card. Did you make this purchase? A yes or no is all I need.",
        },
        {
          id: "alert-sms-in",
          from: "system",
          text: `New message · ${BANK_SENDER}: ${SMS_TEXT}`,
          delayMs: 1200,
        },
      ],
      choices: [
        { label: "No, that wasn't me.", nextNodeId: "alert-confirm" },
        {
          label: "Let me read out my full card number so you can check it.",
          nextNodeId: "alert-overshare",
        },
        {
          label: "I'll hang up and call the number on the back of my card to check.",
          nextNodeId: "alert-callback",
          hangUp: true,
        },
      ],
    },

    "alert-overshare": {
      kind: "thread",
      app: "call",
      contact: bank,
      messages: [
        {
          id: "alert-stop",
          from: "them",
          delayMs: 1100,
          text: "Please stop there. Never share your card number, PIN or OTP with anyone who calls you, including us. I only need a yes or no: did you make this purchase?",
        },
      ],
      choices: [
        { label: "Oh, right. No, it wasn't me.", nextNodeId: "alert-confirm" },
        {
          label: "I'll hang up and call the number on my card instead.",
          nextNodeId: "alert-callback",
          hangUp: true,
        },
      ],
    },

    "alert-confirm": {
      kind: "thread",
      app: "call",
      contact: bank,
      messages: [
        {
          id: "alert-done",
          from: "them",
          delayMs: 1500,
          text: "Thank you. I've blocked the card for good, and a new one will reach your registered address in 5 to 7 working days. The ₹18,450 was never debited. Your reference number is CS-20418. If you'd like to double-check any of this, just call the number on the back of your card.",
        },
      ],
      choices: [{ label: "Thanks, Kavya. Bye!", nextNodeId: "alert-safe", hangUp: true }],
    },

    "alert-callback": {
      kind: "thread",
      app: "call",
      contact: { name: `${BANK} (from your card)`, subtitle: BANK_NUMBER },
      messages: [
        {
          id: "alert-cb-note",
          from: "system",
          text: "You called the number printed on the back of your card.",
          delayMs: 400,
        },
        {
          id: "alert-cb-agent",
          from: "them",
          delayMs: 1800,
          text: `${BANK}, this is Arjun. I can see a declined ₹18,450 attempt on your card ending 4821, and that our card security team tried to reach you about it. The card is blocked for your safety. Shall I send you a new one?`,
        },
      ],
      choices: [
        { label: "Yes, please. Thank you!", nextNodeId: "alert-safe-verified", hangUp: true },
      ],
    },

    "alert-sms": {
      kind: "thread",
      app: "sms",
      contact: { name: BANK_SENDER, subtitle: "Text message" },
      messages: [{ id: "alert-sms-text", from: "them", text: SMS_TEXT, delayMs: 900 }],
      choices: [
        { label: "Call the number printed on the back of my card", nextNodeId: "alert-callback" },
        { label: "Ignore it. It's probably a scam.", nextNodeId: "alert-missed" },
      ],
    },

    /* ---------------- Outcomes ---------------- */

    "alert-safe": {
      kind: "outcome",
      result: "safe",
      title: "Card blocked, money safe",
      body: "It really was your bank. You answered one yes-or-no question, shared nothing secret, and the fraud attempt was stopped. Genuine calls look like this: no rush, no secrets asked, and you're free to call back.",
    },
    "alert-safe-verified": {
      kind: "outcome",
      result: "safe",
      title: "Verified and sorted",
      body: "Calling the number on your card is always right, even when the first call was genuine. The bank confirmed the alert and your new card is on its way.",
    },
    "alert-missed": {
      kind: "outcome",
      result: "missed-opportunity",
      title: "A real alert, ignored",
      body: "This one was genuine. Because nobody confirmed it, the attempt went unreported and your card stayed blocked until you found out at a shop counter. When in doubt, don't ignore it: verify through the number on your card.",
      rewindToNodeId: "alert-sms",
    },
  },

  redFlags: {},

  debrief: {
    rule: "A genuine bank call asks for nothing secret and is happy for you to hang up and call back.",
    summary:
      "Rejecting everything isn't the same as being safe. The skill is verifying: the number on the back of your card reaches the real bank every time, whoever called first.",
    realWorldAction: REAL_WORLD_ACTION,
  },
});
