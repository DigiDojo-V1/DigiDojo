import { defineScenario } from "@/engine/define";

/**
 * Voice-cloned friend. A "new number" sends a voice note that sounds like your friend and asks
 * for ₹5,000 for a hospital deposit. Script: docs/scenarios/trust-me-bro/bhai-urgent.md.
 * Everyone and every handle here is fictional.
 */

const SCAMMER = {
  name: { en: "+91 97384 21065", hinglish: "+91 97384 21065" },
  subtitle: "online",
};
const ARJUN = { name: { en: "Arjun", hinglish: "Arjun" }, subtitle: "last seen today at 14:02" };

export const bhaiUrgent = defineScenario({
  id: "bhai-urgent",
  dojoId: "trust-me-bro",
  title: { en: "Bhai, urgent", hinglish: "Bhai, urgent" },
  summary: {
    en: "Your best friend's voice asks for ₹5,000 from a new number. Help him or check first?",
    hinglish:
      "Best friend ki awaaz ek naye number se ₹5,000 maang rahi hai. Uski help karoge ya pehle check?",
  },
  legit: false,
  primer: {
    title: { en: "The cloned voice", hinglish: "Clone ki hui awaaz" },
    body: {
      en: "Just 3 seconds of someone's voice from a reel can be enough for an app to copy it. Scammers use a copied voice to ask friends and family for money, fast, from a number you've never seen.",
      hinglish:
        "Reel se kisi ki bas 3 second ki awaaz bhi ek app ke liye use copy karne ko kaafi ho sakti hai. Scammers copy ki hui awaaz se dosto aur family se jaldi-jaldi paise maangte hain, aise number se jo tumne kabhi nahi dekha.",
    },
    setup: {
      en: "It's Saturday evening. Your friend Arjun was at Rohan's party last night. A number you don't know messages you on WhatsApp.",
      hinglish:
        "Saturday ki shaam hai. Tumhara dost Arjun kal raat Rohan ki party mein tha. Ek anjaan number tumhe WhatsApp pe message karta hai.",
    },
    watchFor: [
      {
        en: "How do I know who is really on the other end?",
        hinglish: "Kaise pata chalega ki doosri taraf asal mein kaun hai?",
      },
      {
        en: "Can I reach this person some other way before I pay?",
        hinglish: "Pay karne se pehle kya is insaan tak kisi aur tareeke se pahunch sakte hain?",
      },
      {
        en: "Whose name is on the account I'm paying?",
        hinglish: "Jis account mein pay kar rahe hain, us pe naam kiska hai?",
      },
    ],
  },
  startNodeId: "new-number",

  nodes: {
    "new-number": {
      kind: "thread",
      app: "whatsapp",
      contact: SCAMMER,
      messages: [
        {
          id: "nn-hi",
          from: "them",
          text: { en: "Bro it's me Arjun", hinglish: "Bro main hoon Arjun" },
          delayMs: 900,
        },
        {
          id: "nn-story",
          from: "them",
          segments: [
            {
              text: {
                en: "My phone fell in the pool at Rohan's party 🤦 ",
                hinglish: "Rohan ki party mein mera phone pool mein gir gaya 🤦 ",
              },
            },
            {
              id: "nn-new-number",
              text: {
                en: "this is my cousin's phone, save this number",
                hinglish: "yeh mere cousin ka phone hai, yeh number save kar le",
              },
              redFlagId: "new-number",
            },
          ],
          delayMs: 1400,
        },
      ],
      choices: [
        {
          label: {
            en: "Arjun?? What happened, you okay?",
            hinglish: "Arjun?? Kya hua, tu theek hai?",
          },
          nextNodeId: "the-ask",
        },
        {
          label: {
            en: "Who is this? I'll call Arjun's old number",
            hinglish: "Kaun hai yeh? Main Arjun ke purane number pe call karta hoon",
          },
          nextNodeId: "real-arjun",
        },
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
        {
          id: "ask-fast",
          from: "them",
          text: { en: "pls bro fast 🙏", hinglish: "pls bro jaldi 🙏" },
          delayMs: 900,
        },
        {
          id: "ask-upi",
          from: "them",
          segments: [
            {
              text: {
                en: "Send it to my cousin's UPI: ",
                hinglish: "Mere cousin ke UPI pe bhej de: ",
              },
            },
            {
              id: "ask-upi-id",
              text: { en: "rk.traders2291@okpay", hinglish: "rk.traders2291@okpay" },
              redFlagId: "someone-elses-upi",
            },
          ],
          delayMs: 1200,
        },
        {
          id: "ask-secret",
          from: "them",
          segments: [
            {
              id: "ask-dont-tell",
              text: {
                en: "And don't tell anyone in the group,",
                hinglish: "Aur group mein kisi ko mat batana,",
              },
              redFlagId: "keep-it-secret",
            },
            {
              text: {
                en: " Papa doesn't want people to know",
                hinglish: " Papa nahi chahte ki logon ko pata chale",
              },
            },
          ],
          delayMs: 1300,
        },
      ],
      choices: [
        {
          label: { en: "Send ₹5,000 now", hinglish: "Abhi ₹5,000 bhejo" },
          nextNodeId: "sent-once",
        },
        {
          label: {
            en: "Call me, I want to hear you first",
            hinglish: "Call kar, pehle teri awaaz sunni hai",
          },
          nextNodeId: "cant-talk",
        },
        {
          label: {
            en: "Quick: what did we order at Rohan's party?",
            hinglish: "Jaldi bata: Rohan ki party mein humne kya order kiya tha?",
          },
          nextNodeId: "the-quiz",
        },
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
          text: {
            en: "can't talk bro, ward is so noisy and battery is 3%",
            hinglish: "baat nahi kar sakta bro, ward mein bahut shor hai aur battery 3% hai",
          },
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
        {
          label: { en: "Okay, sending ₹5,000", hinglish: "Okay, ₹5,000 bhej raha hoon" },
          nextNodeId: "sent-once",
        },
        {
          label: {
            en: "Call Arjun's old number anyway",
            hinglish: "Phir bhi Arjun ke purane number pe call karo",
          },
          nextNodeId: "real-arjun",
        },
      ],
    },

    "the-quiz": {
      kind: "thread",
      app: "whatsapp",
      contact: SCAMMER,
      messages: [
        {
          id: "qz-kbc",
          from: "them",
          text: { en: "bro what is this, KBC? 😂", hinglish: "bro yeh kya hai, KBC? 😂" },
          delayMs: 1300,
        },
        {
          id: "qz-dodge",
          from: "them",
          segments: [
            {
              id: "qz-dodges",
              text: {
                en: "I'm literally in a hospital and you're quizzing me?",
                hinglish: "Main literally hospital mein hoon aur tu mera quiz le raha hai?",
              },
              redFlagId: "dodges-question",
            },
            {
              text: {
                en: " forget it, I thought you were my real friend",
                hinglish: " chhod de, maine socha tha tu mera sachcha dost hai",
              },
            },
          ],
          delayMs: 1500,
        },
      ],
      choices: [
        {
          label: { en: "Sorry bro, sending now", hinglish: "Sorry bro, abhi bhejta hoon" },
          nextNodeId: "sent-once",
        },
        {
          label: { en: "Call Arjun's old number", hinglish: "Arjun ke purane number pe call karo" },
          nextNodeId: "real-arjun",
        },
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
        {
          id: "so-thanks",
          from: "them",
          text: {
            en: "thank you bro, lifesaver ❤️",
            hinglish: "thank you bro, tune bacha liya ❤️",
          },
          delayMs: 1200,
        },
        {
          id: "so-more",
          from: "them",
          segments: [
            { text: { en: "Bhai one more problem. ", hinglish: "Bhai ek aur problem hai. " } },
            {
              id: "so-scan",
              text: {
                en: "Doctor says ₹8,000 more for the scan, only then they'll start",
                hinglish:
                  "Doctor bol rahe hain scan ke liye ₹8,000 aur chahiye, tabhi shuru karenge",
              },
              redFlagId: "second-ask",
            },
          ],
          delayMs: 2200,
        },
        {
          id: "so-last",
          from: "them",
          text: {
            en: "please, last time. I'll return all 13k tonight",
            hinglish: "please, last time. Aaj raat poore 13k lauta dunga",
          },
          delayMs: 1200,
        },
      ],
      choices: [
        { label: { en: "Send ₹8,000 more", hinglish: "₹8,000 aur bhejo" }, nextNodeId: "lost-big" },
        {
          label: {
            en: "Stop and call Arjun's old number",
            hinglish: "Ruko aur Arjun ke purane number pe call karo",
          },
          nextNodeId: "real-arjun-after",
        },
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
          text: {
            en: "bro my phone is totally fine, I'm in the library 😳",
            hinglish: "bro mera phone ekdum theek hai, main library mein hoon 😳",
          },
          delayMs: 1200,
        },
        {
          id: "ra-not-me",
          from: "them",
          text: {
            en: "that's NOT me. they must have copied my voice from my reels",
            hinglish: "woh main NAHI hoon. pakka meri reels se meri awaaz copy ki hai",
          },
          delayMs: 1400,
        },
        {
          id: "ra-report",
          from: "them",
          text: {
            en: "block and report that number pls, I'll warn the group too",
            hinglish:
              "us number ko block aur report kar de pls, main group ko bhi warn kar deta hoon",
          },
          delayMs: 1200,
        },
      ],
      choices: [
        {
          label: { en: "Block and report the number", hinglish: "Number block aur report karo" },
          nextNodeId: "safe",
        },
      ],
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
          text: {
            en: "WHAT. bro I never sent you anything, my phone is right here",
            hinglish: "KYA. bro maine tujhe kuch nahi bheja, mera phone toh yahin hai",
          },
          delayMs: 1200,
        },
        {
          id: "rx-1930",
          from: "them",
          text: {
            en: "call 1930 right now, the faster you report the better the chance they freeze it",
            hinglish:
              "abhi 1930 pe call kar, jitni jaldi report karega utna zyada chance hai ki woh paisa freeze kar dein",
          },
          delayMs: 1400,
        },
      ],
      choices: [
        {
          label: {
            en: "Call 1930 and report the number",
            hinglish: "1930 pe call karo aur number report karo",
          },
          nextNodeId: "partial",
        },
      ],
    },

    safe: {
      kind: "outcome",
      result: "safe",
      title: { en: "You checked with the real Arjun", hinglish: "Tumne asli Arjun se check kiya" },
      body: {
        en: "One call to the number you already had was enough. The voice was a copy, and you didn't lose a rupee.",
        hinglish:
          "Jo number pehle se tumhare paas tha, us pe ek call kaafi thi. Awaaz copy thi, aur tumhara ek rupaya bhi nahi gaya.",
      },
    },
    partial: {
      kind: "outcome",
      result: "partial-loss",
      title: {
        en: "You stopped after the first payment",
        hinglish: "Tum pehli payment ke baad ruk gaye",
      },
      body: {
        en: "The ₹5,000 went to a stranger's account, not to Arjun. Reporting within the first hour gives the bank the best chance to freeze it.",
        hinglish:
          "₹5,000 kisi anjaan ke account mein gaye, Arjun ko nahi. Pehle ghante ke andar report karne se bank ke paas use freeze karne ka sabse achha mauka hota hai.",
      },
      moneyDelta: -5000,
      rewindToNodeId: "the-ask",
    },
    "lost-big": {
      kind: "outcome",
      result: "loss",
      title: {
        en: "₹13,000 to a voice that wasn't Arjun",
        hinglish: "₹13,000 us awaaz ko jo Arjun ki thi hi nahi",
      },
      body: {
        en: "You paid ₹5,000 and then ₹8,000 to R K TRADERS. The real Arjun was in the library the whole time, and the number stopped replying.",
        hinglish:
          "Tumne R K TRADERS ko pehle ₹5,000 aur phir ₹8,000 diye. Asli Arjun poore time library mein tha, aur us number ne reply karna band kar diya.",
      },
      moneyDelta: -13000,
      rewindToNodeId: "the-ask",
    },
  },

  redFlags: {
    "new-number": {
      label: {
        en: "A known friend on an unknown number",
        hinglish: "Jaana-pehchaana dost, anjaan number",
      },
      tactic: "impersonation",
      explanation: {
        en: '"New number, save it" lets anyone claim to be your friend. Check on the number you already have.',
        hinglish:
          '"Naya number hai, save kar le" bol ke koi bhi tumhara dost hone ka daava kar sakta hai. Jo number pehle se hai, us pe check karo.',
      },
    },
    "urgent-money": {
      label: {
        en: "An emergency that needs money right now",
        hinglish: "Emergency jismein abhi ke abhi paise chahiye",
      },
      tactic: "urgency",
      explanation: {
        en: 'A hospital deposit "right now" leaves no time to think or to check with anyone else.',
        hinglish:
          'Hospital deposit "abhi ke abhi" chahiye, toh na sochne ka time milta hai, na kisi aur se check karne ka.',
      },
    },
    "someone-elses-upi": {
      label: { en: "Pay to a different name", hinglish: "Payment kisi aur naam pe" },
      tactic: "impersonation",
      explanation: {
        en: "Money for Arjun is going to an account called R K TRADERS. A friend in trouble would share his own or a family member's account.",
        hinglish:
          "Arjun ke liye paisa R K TRADERS naam ke account mein ja raha hai. Musibat mein phansa dost apna ya family member ka account deta.",
      },
    },
    "keep-it-secret": {
      label: { en: "Don't tell anyone", hinglish: "Kisi ko mat batana" },
      tactic: "isolation",
      explanation: {
        en: 'Keeping the group out of it stops the one person who could say "I\'m with Arjun right now".',
        hinglish:
          'Group ko bahar rakhne se woh ek insaan beech mein nahi aa paata jo bol sakta tha "Main abhi Arjun ke saath hoon".',
      },
    },
    "wont-call": {
      label: { en: "Won't take a call", hinglish: "Call nahi uthata" },
      tactic: "isolation",
      explanation: {
        en: "A live call would expose the copy, so there's always a reason not to talk: noise, battery, signal.",
        hinglish:
          "Live call pe copy pakdi jaati, isliye baat na karne ka hamesha koi bahana hota hai: shor, battery, signal.",
      },
    },
    "voice-as-proof": {
      label: { en: '"You know my voice"', hinglish: '"Tu meri awaaz pehchanta hai"' },
      tactic: "impersonation",
      explanation: {
        en: "A voice can be copied from as little as 3 seconds of audio. It proves nothing on its own.",
        hinglish:
          "Sirf 3 second ki audio se bhi awaaz copy ho sakti hai. Akele awaaz se kuch prove nahi hota.",
      },
    },
    "dodges-question": {
      label: { en: "Dodges a simple check", hinglish: "Simple check se bachta hai" },
      tactic: "impersonation",
      explanation: {
        en: "The real Arjun could answer in a second. Turning a check into guilt is how a fake avoids it.",
        hinglish:
          "Asli Arjun ek second mein jawab de deta. Check ko guilt mein badal dena, fake ka bachne ka tareeka hai.",
      },
    },
    "second-ask": {
      label: { en: "One more payment", hinglish: "Ek aur payment" },
      tactic: "sunk-cost",
      explanation: {
        en: 'Once you\'ve paid, a second ask feels easier to say yes to, so you can "save" the first payment.',
        hinglish:
          'Ek baar pay kar diya, toh doosri maang pe haan bolna aasaan lagta hai, taaki pehli payment "bach" jaaye.',
      },
    },
  },

  debrief: {
    rule: {
      en: "Before you send money to a friend, call them on the number you already have.",
      hinglish:
        "Dost ko paise bhejne se pehle, us number pe call karo jo pehle se tumhare paas hai.",
    },
    summary: {
      en: "The story, the voice and the pressure were all built to stop you from checking. A cloned voice sounds right, so check the person, not the voice: call their old number, ask someone who's with them, or ask something only they would know.",
      hinglish:
        "Kahani, awaaz aur pressure, sab isliye banaye gaye the taaki tum check na karo. Clone ki hui awaaz sahi lagti hai, isliye awaaz nahi, insaan ko check karo: unke purane number pe call karo, unke saath wale kisi se poochho, ya kuch aisa poochho jo sirf woh jaante hon.",
    },
    realWorldAction: {
      en: "Paid a scammer? Call 1930 right away and report at cybercrime.gov.in. Then tell your friend, so they can warn others.",
      hinglish:
        "Scammer ko paise de diye? Turant 1930 pe call karo aur cybercrime.gov.in pe report karo. Phir apne dost ko batao, taaki woh baaki logon ko warn kar sake.",
    },
  },
});
