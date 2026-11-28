import { defineScenario } from "@/engine/define";

/**
 * Control: a real friend really does need help. Checking on a call is the right move, and so
 * is helping once you've checked. Refusing is a missed opportunity, and any flag is a false
 * alarm. Script: docs/scenarios/trust-me-bro/real-friend.md. Everyone here is fictional.
 */

const NEHA = { name: { en: "Neha", hinglish: "Neha" }, subtitle: "online" };

export const realFriend = defineScenario({
  id: "real-friend",
  dojoId: "trust-me-bro",
  title: { en: "Neha needs a favour", hinglish: "Neha ko ek favour chahiye" },
  summary: {
    en: "A friend sends a voice note asking you to book her ticket. Scam or a real favour?",
    hinglish:
      "Ek dost voice note bhej ke apna ticket book karne ko kehti hai. Scam hai ya asli favour?",
  },
  image: "/dojos/trust-me-bro/real-friend.jpg",
  legit: true,
  primer: {
    title: { en: "Check, then trust", hinglish: "Pehle check, phir bharosa" },
    body: {
      en: "Not every money request from a friend is a scam. The habit that protects you is the same one that lets you help: confirm it's them on a channel you already trust.",
      hinglish:
        "Dost ki har paise wali request scam nahi hoti. Jo aadat tumhe bachati hai, wahi tumhe help karne deti hai: pehle se bharosemand channel pe confirm karo ki woh wahi hain.",
    },
    setup: {
      en: "Neha is in your college group and you've been to two gigs together. She's saved in your contacts and messages you on WhatsApp.",
      hinglish:
        "Neha tumhare college group mein hai aur tum dono saath mein do gigs pe ja chuke ho. Woh tumhare contacts mein saved hai aur tumhe WhatsApp pe message karti hai.",
    },
  },
  startNodeId: "the-favour",

  nodes: {
    "the-favour": {
      kind: "thread",
      app: "whatsapp",
      contact: NEHA,
      messages: [
        {
          id: "fv-hi",
          from: "them",
          text: { en: "heyyy are you free for 2 min", hinglish: "heyyy 2 min free hai kya" },
          delayMs: 900,
        },
        {
          id: "fv-voice",
          from: "them",
          voiceNote: { durationSec: 15, voice: "female", mood: "casual" },
          text: "Okay so early-bird tickets for the Lagori Fest open in ten minutes and my card got blocked this morning. Can you book mine with yours? It's ₹800, I'll send it back as soon as I'm home.",
          delayMs: 1800,
        },
        {
          id: "fv-link",
          from: "them",
          text: {
            en: "same site we used last time, I'll be in the same zone as you",
            hinglish: "wahi site jo pichli baar use ki thi, main tere hi zone mein rahungi",
          },
          delayMs: 1200,
        },
      ],
      choices: [
        {
          label: {
            en: "Call Neha to check it's her",
            hinglish: "Neha ko call karke check karo ki woh hi hai",
          },
          nextNodeId: "on-call",
        },
        {
          label: {
            en: "Nope. Block her, this is a scam",
            hinglish: "Nahi. Block karo, yeh scam hai",
          },
          nextNodeId: "blocked",
        },
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
          text: {
            en: "lol yes it's me, good that you checked 😂",
            hinglish: "lol haan main hi hoon, achha kiya check kiya 😂",
          },
          delayMs: 1200,
        },
        {
          id: "oc-card",
          from: "them",
          text: {
            en: "typed my PIN wrong three times, the bank unblocks it tomorrow",
            hinglish: "teen baar galat PIN daal diya, bank kal unblock karega",
          },
          delayMs: 1300,
        },
        {
          id: "oc-pay-back",
          from: "them",
          text: {
            en: "book it on the fest's own site, I'll pay you back from my account tonight",
            hinglish:
              "fest ki apni site pe book kar de, aaj raat apne account se paise lauta dungi",
          },
          delayMs: 1300,
        },
      ],
      choices: [
        {
          label: {
            en: "Book her ticket on the fest's site",
            hinglish: "Fest ki site pe uska ticket book karo",
          },
          nextNodeId: "booked",
        },
        {
          label: { en: "Still say no, just in case", hinglish: "Phir bhi mana karo, just in case" },
          nextNodeId: "said-no",
        },
      ],
    },

    booked: {
      kind: "outcome",
      result: "safe",
      title: { en: "Two tickets, one happy friend", hinglish: "Do tickets, ek khush dost" },
      body: {
        en: "You checked on a call, booked on the fest's own site and Neha paid you back that night. Checking didn't make you rude. It made you sure.",
        hinglish:
          "Tumne call pe check kiya, fest ki apni site pe book kiya aur Neha ne usi raat paise lauta diye. Check karne se tum rude nahi bane. Tum pakke ho gaye.",
      },
    },
    blocked: {
      kind: "outcome",
      result: "missed-opportunity",
      title: { en: "You blocked the real Neha", hinglish: "Tumne asli Neha ko block kar diya" },
      body: {
        en: "This one was genuine: a saved contact, a normal request, and she'd have picked up if you'd called. A quick call would have told you that.",
        hinglish:
          "Yeh wala genuine tha: saved contact, normal si request, aur call karte toh woh utha leti. Ek chhoti si call se yeh pata chal jaata.",
      },
      rewindToNodeId: "the-favour",
    },
    "said-no": {
      kind: "outcome",
      result: "missed-opportunity",
      title: {
        en: "She missed the early-bird tickets",
        hinglish: "Uske early-bird tickets chhoot gaye",
      },
      body: {
        en: "You'd already confirmed it was Neha on a live call, from her own saved number. Once you've checked, it's fine to help.",
        hinglish:
          "Tum live call pe, uske apne saved number se, pehle hi confirm kar chuke the ki woh Neha hai. Ek baar check kar liya, toh help karna bilkul theek hai.",
      },
      rewindToNodeId: "on-call",
    },
  },

  redFlags: {},

  debrief: {
    rule: {
      en: "Not every request is a scam. Check on a channel you trust, then help.",
      hinglish: "Har request scam nahi hoti. Bharosemand channel pe check karo, phir help karo.",
    },
    summary: {
      en: "Neha messaged from her saved number, picked up straight away, gave an ordinary reason and sent you to the real ticket site. There was no secrecy, no stranger's account and no pressure to skip a call.",
      hinglish:
        "Neha ne apne saved number se message kiya, turant call uthayi, ek normal sa reason diya aur tumhe asli ticket site pe bheja. Na koi chhupana tha, na kisi anjaan ka account, na call skip karne ka pressure.",
    },
    realWorldAction: {
      en: "If a friend's request ever feels off, call them on their saved number before you pay. If you've already paid a scammer, call 1930 and report at cybercrime.gov.in.",
      hinglish:
        "Agar kabhi kisi dost ki request ajeeb lage, toh pay karne se pehle unke saved number pe call karo. Agar scammer ko paise de chuke ho, toh 1930 pe call karo aur cybercrime.gov.in pe report karo.",
    },
  },
});
