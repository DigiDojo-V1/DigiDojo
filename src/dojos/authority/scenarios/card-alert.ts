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
  title: { en: "A call about your card", hinglish: "Tumhare card ke baare mein ek call" },
  summary: {
    en: "Your bank calls about a payment you didn't make. Real alert or another trick?",
    hinglish:
      "Tumhara bank ek aisi payment ke baare mein call karta hai jo tumne ki hi nahi. Asli alert hai ya ek aur trick?",
  },
  legit: true,
  primer: {
    title: { en: "Not every bank call is a scam", hinglish: "Bank ka har call scam nahi hota" },
    body: {
      en: "Real banks do call when their fraud checks block a payment. Listen for what this caller asks you for, and what they never ask for.",
      hinglish:
        "Jab fraud checks koi payment block karte hain, toh asli bank sach mein call karte hain. Suno ki yeh caller tumse kya maangta hai, aur kya kabhi nahi maangta.",
    },
    setup: {
      en: `You're Priya Nair again. You bank with ${BANK}, and your debit card ends in 4821. You haven't bought anything online today.`,
      hinglish: `Tum phir se Priya Nair ho. Tumhara account ${BANK} mein hai, aur tumhara debit card 4821 pe khatam hota hai. Aaj tumne online kuch nahi khareeda.`,
    },
    watchFor: [
      { en: "What is the caller asking you for?", hinglish: "Caller tumse kya maang raha hai?" },
      {
        en: "Are you free to hang up and check?",
        hinglish: "Kya tum call kaat ke check kar sakti ho?",
      },
    ],
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
          text: {
            en: `Hello, am I speaking with Priya Nair? This is Kavya from ${BANK}'s card security team. Before anything else: I won't ask for your PIN, OTP, CVV or card number on this call.`,
            hinglish: `Hello, kya meri baat Priya Nair se ho rahi hai? Main Kavya, ${BANK} ki card security team se. Sabse pehle: is call pe main aapka PIN, OTP, CVV ya card number nahi maangungi.`,
          },
        },
        {
          id: "alert-me-yes",
          from: "me",
          text: { en: "Yes, this is Priya.", hinglish: "Haan, main Priya bol rahi hoon." },
          delayMs: 900,
        },
        {
          id: "alert-what",
          from: "them",
          delayMs: 1800,
          text: {
            en: "About ten minutes ago, someone tried to pay ₹18,450 at GadgetKart Online with your debit card ending 4821. Our system declined it and put a temporary block on the card. Did you make this purchase? A yes or no is all I need.",
            hinglish:
              "Lagbhag das minute pehle kisi ne aapke 4821 pe khatam hone wale debit card se GadgetKart Online pe ₹18,450 pay karne ki koshish ki. Humare system ne ise decline karke card pe temporary block laga diya. Kya yeh purchase aapne kiya tha? Mujhe bas haan ya na chahiye.",
          },
        },
        {
          id: "alert-sms-in",
          from: "system",
          text: `New message · ${BANK_SENDER}: ${SMS_TEXT}`,
          delayMs: 1200,
        },
      ],
      choices: [
        {
          label: { en: "No, that wasn't me.", hinglish: "Nahi, woh maine nahi kiya." },
          nextNodeId: "alert-confirm",
        },
        {
          label: {
            en: "Let me read out my full card number so you can check it.",
            hinglish: "Main apna poora card number padh deti hoon taaki aap check kar sakein.",
          },
          nextNodeId: "alert-overshare",
        },
        {
          label: {
            en: "I'll hang up and call the number on the back of my card to check.",
            hinglish:
              "Main call kaat ke check karne ke liye apne card ke peeche wale number pe call karti hoon.",
          },
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
          text: {
            en: "Please stop there. Never share your card number, PIN or OTP with anyone who calls you, including us. I only need a yes or no: did you make this purchase?",
            hinglish:
              "Please wahin ruk jaiye. Jo bhi aapko call kare, usse kabhi apna card number, PIN ya OTP share mat kijiye, humse bhi nahi. Mujhe bas haan ya na chahiye: kya yeh purchase aapne kiya tha?",
          },
        },
      ],
      choices: [
        {
          label: {
            en: "Oh, right. No, it wasn't me.",
            hinglish: "Oh, achha. Nahi, woh maine nahi kiya.",
          },
          nextNodeId: "alert-confirm",
        },
        {
          label: {
            en: "I'll hang up and call the number on my card instead.",
            hinglish: "Main call kaat ke uski jagah apne card wale number pe call karti hoon.",
          },
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
          text: {
            en: "Thank you. I've blocked the card for good, and a new one will reach your registered address in 5 to 7 working days. The ₹18,450 was never debited. Your reference number is CS-20418. If you'd like to double-check any of this, just call the number on the back of your card.",
            hinglish:
              "Thank you. Maine card permanently block kar diya hai, aur naya card 5 se 7 working days mein aapke registered address pe pahunch jaayega. ₹18,450 kabhi debit hue hi nahi. Aapka reference number CS-20418 hai. Agar aap kuch bhi double-check karna chahein, toh bas apne card ke peeche wale number pe call kijiye.",
          },
        },
      ],
      choices: [
        {
          label: { en: "Thanks, Kavya. Bye!", hinglish: "Thanks, Kavya. Bye!" },
          nextNodeId: "alert-safe",
          hangUp: true,
        },
      ],
    },

    "alert-callback": {
      kind: "thread",
      app: "call",
      contact: { name: `${BANK} (from your card)`, subtitle: BANK_NUMBER },
      messages: [
        {
          id: "alert-cb-note",
          from: "system",
          text: {
            en: "You called the number printed on the back of your card.",
            hinglish: "Tumne apne card ke peeche chhape number pe call kiya.",
          },
          delayMs: 400,
        },
        {
          id: "alert-cb-agent",
          from: "them",
          delayMs: 1800,
          text: {
            en: `${BANK}, this is Arjun. I can see a declined ₹18,450 attempt on your card ending 4821, and that our card security team tried to reach you about it. The card is blocked for your safety. Shall I send you a new one?`,
            hinglish: `${BANK}, main Arjun bol raha hoon. Mujhe aapke 4821 wale card pe ₹18,450 ki ek declined koshish dikh rahi hai, aur yeh bhi ki humari card security team ne is baare mein aapse contact karne ki koshish ki thi. Aapki safety ke liye card block hai. Kya main aapko naya card bhej doon?`,
          },
        },
      ],
      choices: [
        {
          label: { en: "Yes, please. Thank you!", hinglish: "Haan, please. Thank you!" },
          nextNodeId: "alert-safe-verified",
          hangUp: true,
        },
      ],
    },

    "alert-sms": {
      kind: "thread",
      app: "sms",
      contact: { name: BANK_SENDER, subtitle: "Text message" },
      messages: [{ id: "alert-sms-text", from: "them", text: SMS_TEXT, delayMs: 900 }],
      choices: [
        {
          label: {
            en: "Call the number printed on the back of my card",
            hinglish: "Card ke peeche chhape number pe call karo",
          },
          nextNodeId: "alert-callback",
        },
        {
          label: {
            en: "Ignore it. It's probably a scam.",
            hinglish: "Ignore karo. Shayad scam hai.",
          },
          nextNodeId: "alert-missed",
        },
      ],
    },

    /* ---------------- Outcomes ---------------- */

    "alert-safe": {
      kind: "outcome",
      result: "safe",
      title: { en: "Card blocked, money safe", hinglish: "Card block, paisa safe" },
      body: {
        en: "It really was your bank. You answered one yes-or-no question, shared nothing secret, and the fraud attempt was stopped. Genuine calls look like this: no rush, no secrets asked, and you're free to call back.",
        hinglish:
          "Yeh sach mein tumhara bank tha. Tumne ek haan-ya-na wale sawaal ka jawab diya, kuch secret share nahi kiya, aur fraud ki koshish ruk gayi. Genuine calls aise hi hote hain: koi jaldi nahi, koi secret nahi maanga, aur tum call back karne ke liye free ho.",
      },
    },
    "alert-safe-verified": {
      kind: "outcome",
      result: "safe",
      title: { en: "Verified and sorted", hinglish: "Verify kiya, sab sorted" },
      body: {
        en: "Calling the number on your card is always right, even when the first call was genuine. The bank confirmed the alert and your new card is on its way.",
        hinglish:
          "Card wale number pe call karna hamesha sahi hai, chahe pehla call genuine hi kyun na ho. Bank ne alert confirm kiya aur tumhara naya card raaste mein hai.",
      },
    },
    "alert-missed": {
      kind: "outcome",
      result: "missed-opportunity",
      title: { en: "A real alert, ignored", hinglish: "Asli alert, ignore kar diya" },
      body: {
        en: "This one was genuine. Because nobody confirmed it, the attempt went unreported and your card stayed blocked until you found out at a shop counter. When in doubt, don't ignore it: verify through the number on your card.",
        hinglish:
          "Yeh wala genuine tha. Kisi ne confirm nahi kiya, isliye fraud ki koshish report nahi hui aur tumhara card tab tak blocked raha jab tak tumhe kisi dukaan ke counter pe pata nahi chala. Shak ho toh ignore mat karo: card wale number se verify karo.",
      },
      rewindToNodeId: "alert-sms",
    },
  },

  redFlags: {},

  debrief: {
    rule: {
      en: "A genuine bank call asks for nothing secret and is happy for you to hang up and call back.",
      hinglish:
        "Genuine bank call mein kuch secret nahi maanga jaata, aur woh khushi se tumhe call kaat ke call back karne dete hain.",
    },
    summary: {
      en: "Rejecting everything isn't the same as being safe. The skill is verifying: the number on the back of your card reaches the real bank every time, whoever called first.",
      hinglish:
        "Sab kuch reject karna safe rehna nahi hai. Asli skill hai verify karna: card ke peeche wala number hamesha asli bank tak pahunchata hai, chahe pehle call kisi ne bhi kiya ho.",
    },
    realWorldAction: REAL_WORLD_ACTION,
  },
});
