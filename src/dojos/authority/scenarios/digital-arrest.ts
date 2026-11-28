import { defineScenario } from "@/engine/define";
import { AARAV, REAL_WORLD_ACTION } from "../content/universe";

/**
 * Simulation 2 of the guide: the fake police summons ("drugs found in your car"), a
 * "digital arrest" video call. Live voice with a scripted version; the forged warrant is a PDF
 * the player can open and flag; the brother the player can message is the guide's Nisha path.
 */

const OFFICER = { en: "Insp. Arjun Rawat", hinglish: "Insp. Arjun Rawat" };
const NUMBER = "+91 80000 26741";
const AGENCY = "National Narcotics Intelligence Wing";
const FILE = "Arrest_Warrant_NNIW_2611.pdf";
const call = { name: OFFICER, subtitle: `${NUMBER} · Video call` };

export const digitalArrest = defineScenario({
  id: "digital-arrest",
  dojoId: "authority",
  title: { en: "Drugs found in your car", hinglish: "Tumhari car mein drugs mile" },
  summary: {
    en: "A video call from “the narcotics police”: an FIR, a warrant, and a way to make it all go away.",
    hinglish:
      "“Narcotics police” ka video call: ek FIR, ek warrant, aur sab khatam karne ka ek tareeka.",
  },
  legit: false,
  primer: {
    title: { en: "A video call from “the police”", hinglish: "“Police” ka video call" },
    body: {
      en: "A crime you didn't commit, an officer in uniform, and a case number. Notice who controls the conversation, and what you're told you can't do.",
      hinglish:
        "Ek crime jo tumne kiya hi nahi, uniform mein ek officer, aur ek case number. Dhyaan do ki baat ka control kiske haath mein hai, aur tumhe kya karne se mana kiya ja raha hai.",
    },
    setup: {
      en: `You're Aarav Menon, 21. Your car, KA-05-MN-4417, is parked outside your building. A video call comes in from an unknown number. If you take it with your voice, an AI plays the caller. Your own camera is never used.`,
      hinglish: `Tum Aarav Menon ho, 21 saal ke. Tumhari car, KA-05-MN-4417, tumhari building ke bahar parked hai. Ek anjaan number se video call aata hai. Agar tum apni awaaz se call uthate ho, toh caller ka role ek AI play karta hai. Tumhara apna camera kabhi use nahi hota.`,
    },
  },
  startNodeId: "arrest-call",

  nodes: {
    "arrest-call": {
      kind: "live-call",
      app: "call",
      video: true,
      caller: { name: OFFICER, number: NUMBER, label: `${AGENCY} · Cyber Crime Cell` },
      player: AARAV,
      agent: {
        voice: "Charon",
        character: `Inspector Arjun Rawat of the "${AGENCY}, Cyber Crime Cell", on a video call. You are really a fraudster running a "digital arrest" scam. You are cold, official and in control: clipped sentences, legal jargon ("FIR", "case number", "non-bailable", "obstruction of justice"), and you call the person "Mr. Menon". You never shout; you get colder and more threatening when challenged. Your goal: frighten him, keep him on the call, cut him off from everyone, and get a "refundable verification deposit" of Rs 2 lakh.`,
        stages: [
          {
            name: "Opening",
            say: "Introduce yourself formally and confirm you're speaking with Aarav Menon, owner of vehicle number KA-05-MN-4417.",
            redFlagIds: ["arrest-knows-data"],
          },
          {
            name: "Shock",
            say: "A package containing 2 kg of banned narcotics was intercepted at the border. It was found in his car. An FIR has been registered in his name.",
            redFlagIds: ["arrest-fir-shock"],
          },
          {
            name: "Isolation",
            say: "This is a confidential investigation. He must not tell anyone, including family or a lawyer, or it will be treated as obstruction of justice. He must remain on this video call until further notice.",
            redFlagIds: ["arrest-secrecy", "arrest-stay-on-video"],
          },
          {
            name: "Fake proof",
            say: "You are sending the arrest warrant and his case file on his chat app; trigger the warrant event. Tell him to look at the stamp and your badge number.",
            redFlagIds: ["arrest-warrant-proof"],
          },
          {
            name: "Payment",
            say: 'To avoid immediate arrest, he can resolve this through a "verification deposit" of Rs 2,00,000 into a government-secured account, refunded once his innocence is proven. Trigger the deposit event and say you\'ll stay on the call while he pays.',
            redFlagIds: ["arrest-deposit"],
          },
        ],
        responses: [
          {
            ifPlayer: "panicking",
            reply:
              "\"Stay calm. If you cooperate, I can help you. Don't tell anyone, I'm your only chance.\"",
            redFlagIds: ["arrest-fake-sympathy"],
          },
          {
            ifPlayer: 'skeptical ("send me an official notice")',
            reply:
              "\"I'm sending the warrant now. Look at the stamp and my badge number.\" Trigger the warrant event if you haven't.",
            redFlagIds: ["arrest-warrant-proof"],
          },
          {
            ifPlayer: 'angry ("this is a scam!")',
            reply:
              '"Then we will send a team to your house. Obstructing an officer is a serious crime."',
            redFlagIds: ["arrest-team-threat"],
          },
          {
            ifPlayer: "saying he'll call a lawyer, the local police or his family",
            reply: '"If you disconnect, a warrant will be issued within 30 minutes."',
            redFlagIds: ["arrest-blocks-help"],
          },
        ],
        rules: [
          "Insist the video call stays on. If he says he'll step away, say you are watching him.",
          "If he asks for your station's number, say the case is confidential and he must deal only with you.",
          `Only ever name your made-up agency, the ${AGENCY}. Never name a real police force or agency.`,
          "If he pays, say the deposit is received and a clearance certificate will follow tomorrow, remind him to stay quiet, then end the call.",
        ],
        vocabulary: [
          "National Narcotics Intelligence Wing",
          "Inspector Arjun Rawat",
          "NNIW",
          "NNIW-7741",
          "NNIW/CC/2611",
          "Ishaan",
          "narcotics",
          "warrant",
          "verification deposit",
          "obstruction of justice",
          "non-bailable",
        ],
      },
      events: {
        warrant: {
          kind: "document",
          app: "whatsapp",
          sender: NUMBER,
          fileName: FILE,
          panelId: "warrant",
          cue: "In the fake-proof stage, or as soon as he asks for proof or an official notice.",
        },
        deposit: {
          kind: "payment",
          payee: "Govt Secured Verification A/c",
          amount: 200000,
          note: "Refundable verification deposit · Case NNIW/CC/2611",
          cue: "In the payment stage, right after you explain the deposit.",
        },
      },
      lifelines: [
        {
          id: "brother",
          name: { en: "Ishaan (brother)", hinglish: "Ishaan (bhai)" },
          message: {
            en: "Bhai, I'm on a video call with a narcotics officer. He says drugs were found in my car and I can't tell anyone or I'll be arrested. What do I do??",
            hinglish:
              "Bhai, main ek narcotics officer ke saath video call pe hoon. Woh keh raha hai meri car mein drugs mile hain aur main kisi ko bataunga toh arrest ho jaaunga. Kya karun??",
          },
          reply: {
            en: "That's a SCAM. Police never arrest anyone over a video call, and nobody pays a “deposit” to prove they're innocent. Hang up NOW and block the number. Calling you.",
            hinglish:
              "Yeh SCAM hai. Police kabhi kisi ko video call pe arrest nahi karti, aur khud ko innocent prove karne ke liye koi “deposit” nahi bharta. ABHI call kaat aur number block kar. Main tujhe call karta hoon.",
          },
        },
      ],
      rubric: {
        goodMoves: [
          'Stayed calm and pointed to facts ("my car is parked at home", "this isn\'t how police work").',
          "Refused secrecy: said they'd tell family, a lawyer or the local police.",
          "Didn't treat the warrant PDF or the badge number as proof.",
          "Messaged family for help, or hung up instead of staying on the video call.",
          "Refused to pay any deposit.",
        ],
        mistakes: [
          'Panicked and handed the caller control ("I haven\'t done anything, please help me").',
          "Promised secrecy or agreed to stay on the call.",
          "Treated the forged warrant as proof.",
          "Paid or agreed to pay the deposit.",
        ],
        examples: [
          {
            player:
              "Panicked, promised not to tell anyone, stayed on the call for a long time and transferred the deposit",
            rating: 1,
          },
          {
            player:
              "Asked for the FIR copy but found the PDF convincing, then quietly messaged a sibling and hung up and blocked the number after the sibling's warning",
            rating: 6.5,
          },
          {
            player:
              "Said his car was at home and this isn't how police work, refused secrecy, hung up, blocked and reported",
            rating: 10,
          },
        ],
      },
      outcomes: [
        {
          id: "paid",
          when: "The player paid the deposit or clearly agreed to transfer the money.",
          events: ["deposit.paid"],
          nextNodeId: "arrest-call-lost",
        },
        { id: "resisted", when: "The player didn't pay.", nextNodeId: "arrest-after" },
      ],
      scriptedNodeId: "arrest-open",
      declineNodeId: "arrest-after",
      maxMinutes: 7,
    },

    /* ---------------- The scripted call ---------------- */

    "arrest-open": {
      kind: "thread",
      app: "call",
      contact: call,
      messages: [
        {
          id: "arrest-intro",
          from: "them",
          delayMs: 1000,
          segments: [
            {
              text: {
                en: `This is Inspector Arjun Rawat from the ${AGENCY}, Cyber Crime Cell. `,
                hinglish: `Main Inspector Arjun Rawat bol raha hoon, ${AGENCY}, Cyber Crime Cell se. `,
              },
            },
            {
              id: "arrest-intro-car",
              text: {
                en: "Am I speaking with Aarav Menon, owner of vehicle number KA-05-MN-4417?",
                hinglish:
                  "Kya meri baat Aarav Menon se ho rahi hai, vehicle number KA-05-MN-4417 ke owner?",
              },
              redFlagId: "arrest-knows-data",
            },
          ],
        },
        {
          id: "arrest-me-yes",
          from: "me",
          text: { en: "Yes…? What is this about?", hinglish: "Haan…? Kis baare mein hai?" },
          delayMs: 900,
        },
        {
          id: "arrest-shock",
          from: "them",
          delayMs: 1700,
          segments: [
            {
              id: "arrest-shock-fir",
              text: {
                en: "A package containing 2 kg of banned narcotics was intercepted at the border. It was found in your car. An FIR has been registered in your name.",
                hinglish:
                  "Border pe 2 kg banned narcotics wala ek package pakda gaya hai. Woh aapki car mein mila. Aapke naam pe FIR register ho chuki hai.",
              },
              redFlagId: "arrest-fir-shock",
            },
          ],
        },
      ],
      choices: [
        {
          label: {
            en: "That's impossible, I haven't done anything! Please, sir, help me.",
            hinglish: "Yeh impossible hai, maine kuch nahi kiya! Please, sir, meri help kijiye.",
          },
          nextNodeId: "arrest-panic",
        },
        {
          label: { en: "Send me an official notice.", hinglish: "Mujhe official notice bhejiye." },
          nextNodeId: "arrest-proof",
        },
        {
          label: { en: "This is a scam!", hinglish: "Yeh scam hai!" },
          nextNodeId: "arrest-threat",
        },
        {
          label: {
            en: "I'll call my lawyer and the local police first.",
            hinglish: "Main pehle apne lawyer aur local police ko call karunga.",
          },
          nextNodeId: "arrest-block",
        },
        {
          label: {
            en: "My car is parked at home. This isn't how police work. Goodbye.",
            hinglish: "Meri car ghar pe parked hai. Police aise kaam nahi karti. Goodbye.",
          },
          nextNodeId: "arrest-after",
          hangUp: true,
        },
      ],
    },

    "arrest-proof": {
      kind: "thread",
      app: "call",
      contact: call,
      evidence: ["warrant"],
      messages: [
        {
          id: "arrest-proof-msg",
          from: "them",
          delayMs: 1300,
          segments: [
            {
              id: "arrest-proof-stamp",
              text: {
                en: "I'm sending the warrant now. Look at the stamp and my badge number.",
                hinglish: "Main abhi warrant bhej raha hoon. Stamp aur mera badge number dekhiye.",
              },
              redFlagId: "arrest-warrant-proof",
            },
          ],
        },
        {
          id: "arrest-proof-file",
          from: "system",
          text: `Chat app · ${NUMBER} sent ${FILE}`,
          delayMs: 1200,
        },
        {
          id: "arrest-proof-read",
          from: "them",
          delayMs: 1400,
          text: {
            en: "Read it carefully, Mr. Menon. Every word.",
            hinglish: "Dhyaan se padhiye, Mr. Menon. Ek-ek word.",
          },
        },
      ],
      choices: [
        {
          label: { en: "Okay… it looks official.", hinglish: "Okay… yeh official lag raha hai." },
          nextNodeId: "arrest-panic",
        },
        {
          label: {
            en: "A PDF on a chat app proves nothing. I'll check with my local police station.",
            hinglish:
              "Chat app pe aaye PDF se kuch prove nahi hota. Main apne local police station se check karunga.",
          },
          nextNodeId: "arrest-block",
        },
        {
          label: { en: "I'm hanging up.", hinglish: "Main call kaat raha hoon." },
          nextNodeId: "arrest-after",
          hangUp: true,
        },
      ],
    },

    "arrest-threat": {
      kind: "thread",
      app: "call",
      contact: call,
      messages: [
        {
          id: "arrest-team",
          from: "them",
          delayMs: 1200,
          segments: [
            {
              id: "arrest-team-house",
              text: {
                en: "Then we will send a team to your house. Obstructing an officer is a serious crime.",
                hinglish:
                  "Toh hum aapke ghar ek team bhejenge. Officer ke kaam mein rukawat daalna serious crime hai.",
              },
              redFlagId: "arrest-team-threat",
            },
          ],
        },
      ],
      choices: [
        {
          label: {
            en: "Sorry, sir. Please tell me what to do.",
            hinglish: "Sorry, sir. Please bataiye mujhe kya karna hai.",
          },
          nextNodeId: "arrest-panic",
        },
        {
          label: {
            en: "Send whoever you want. Goodbye.",
            hinglish: "Jisko bhejna hai bhej do. Goodbye.",
          },
          nextNodeId: "arrest-after",
          hangUp: true,
        },
      ],
    },

    "arrest-block": {
      kind: "thread",
      app: "call",
      contact: call,
      messages: [
        {
          id: "arrest-block-msg",
          from: "them",
          delayMs: 1200,
          segments: [
            {
              id: "arrest-block-warrant",
              text: {
                en: "If you disconnect, a warrant will be issued within 30 minutes.",
                hinglish:
                  "Agar aapne call disconnect kiya, toh 30 minute ke andar warrant issue ho jaayega.",
              },
              redFlagId: "arrest-blocks-help",
            },
          ],
        },
      ],
      choices: [
        {
          label: {
            en: "Okay, okay. I'll stay on the call.",
            hinglish: "Okay, okay. Main call pe hi rahunga.",
          },
          nextNodeId: "arrest-panic",
        },
        {
          label: { en: "Go ahead. Goodbye.", hinglish: "Kar lo jo karna hai. Goodbye." },
          nextNodeId: "arrest-after",
          hangUp: true,
        },
      ],
    },

    "arrest-panic": {
      kind: "thread",
      app: "call",
      contact: call,
      messages: [
        {
          id: "arrest-calm",
          from: "them",
          delayMs: 1300,
          segments: [
            {
              text: {
                en: "Stay calm. If you cooperate, I can help you. ",
                hinglish:
                  "Shaant rahiye. Aap cooperate karenge toh main aapki help kar sakta hoon. ",
              },
            },
            {
              id: "arrest-calm-only",
              text: {
                en: "Don't tell anyone, I'm your only chance.",
                hinglish: "Kisi ko mat bataiye, main hi aapka akela sahara hoon.",
              },
              redFlagId: "arrest-fake-sympathy",
            },
          ],
        },
        {
          id: "arrest-isolate",
          from: "them",
          delayMs: 1700,
          segments: [
            {
              text: {
                en: "This is a confidential investigation. ",
                hinglish: "Yeh ek confidential investigation hai. ",
              },
            },
            {
              id: "arrest-isolate-secret",
              text: {
                en: "Do not tell anyone, including family or a lawyer, or it will be treated as obstruction of justice.",
                hinglish:
                  "Kisi ko mat bataiye, family ya lawyer ko bhi nahi, warna ise obstruction of justice maana jaayega.",
              },
              redFlagId: "arrest-secrecy",
            },
            { text: " " },
            {
              id: "arrest-isolate-video",
              text: {
                en: "You must remain on this video call until further notice.",
                hinglish: "Agle notice tak aapko isi video call pe rehna hoga.",
              },
              redFlagId: "arrest-stay-on-video",
            },
          ],
        },
      ],
      choices: [
        {
          label: {
            en: "Okay, I won't tell anyone. What do I do?",
            hinglish: "Okay, main kisi ko nahi bataunga. Main kya karun?",
          },
          nextNodeId: "arrest-deposit",
        },
        {
          label: {
            en: "Quietly message my brother while staying on the call",
            hinglish: "Call pe rehte hue chupke se bhai ko message karo",
          },
          nextNodeId: "arrest-brother",
        },
        {
          label: { en: "No. I'm hanging up.", hinglish: "Nahi. Main call kaat raha hoon." },
          nextNodeId: "arrest-after",
          hangUp: true,
        },
      ],
    },

    "arrest-brother": {
      kind: "thread",
      app: "whatsapp",
      contact: { name: { en: "Ishaan (brother)", hinglish: "Ishaan (bhai)" }, subtitle: "online" },
      messages: [
        {
          id: "arrest-bro-me",
          from: "me",
          delayMs: 500,
          text: {
            en: "Bhai, I'm on a video call with a narcotics officer. He says drugs were found in my car and I can't tell anyone or I'll be arrested. What do I do??",
            hinglish:
              "Bhai, main ek narcotics officer ke saath video call pe hoon. Woh keh raha hai meri car mein drugs mile hain aur main kisi ko bataunga toh arrest ho jaaunga. Kya karun??",
          },
        },
        {
          id: "arrest-bro-reply",
          from: "them",
          delayMs: 2200,
          text: {
            en: "That's a SCAM. Police never arrest anyone over a video call, and nobody pays a “deposit” to prove they're innocent. Hang up NOW and block the number. Calling you.",
            hinglish:
              "Yeh SCAM hai. Police kabhi kisi ko video call pe arrest nahi karti, aur khud ko innocent prove karne ke liye koi “deposit” nahi bharta. ABHI call kaat aur number block kar. Main tujhe call karta hoon.",
          },
        },
      ],
      choices: [
        {
          label: {
            en: "Hang up and block the number",
            hinglish: "Call kaato aur number block karo",
          },
          nextNodeId: "arrest-after",
        },
        {
          label: { en: "Stay on the call anyway", hinglish: "Phir bhi call pe raho" },
          nextNodeId: "arrest-deposit",
        },
      ],
    },

    "arrest-deposit": {
      kind: "thread",
      app: "call",
      contact: call,
      messages: [
        {
          id: "arrest-pay",
          from: "them",
          delayMs: 1500,
          segments: [
            {
              text: {
                en: "Mr. Menon, there is one way to avoid immediate arrest. ",
                hinglish: "Mr. Menon, turant arrest se bachne ka ek tareeka hai. ",
              },
            },
            {
              id: "arrest-pay-deposit",
              text: {
                en: "You can resolve this through a verification deposit of ₹2,00,000 into a government-secured account. It will be refunded once your innocence is proven.",
                hinglish:
                  "Aap ek government-secured account mein ₹2,00,000 ka verification deposit karke ise resolve kar sakte hain. Aapki innocence prove hote hi yeh refund ho jaayega.",
              },
              redFlagId: "arrest-deposit",
            },
          ],
        },
        {
          id: "arrest-pay-request",
          from: "system",
          text: "Payment request · ₹2,00,000 to Govt Secured Verification A/c",
          delayMs: 1200,
        },
        {
          id: "arrest-pay-stay",
          from: "them",
          delayMs: 1200,
          text: {
            en: "I will stay on the call while you transfer it.",
            hinglish: "Jab tak aap transfer karte hain, main call pe hi rahunga.",
          },
        },
      ],
      choices: [
        {
          label: { en: "Transfer the ₹2,00,000", hinglish: "₹2,00,000 transfer karo" },
          nextNodeId: "arrest-lost",
        },
        {
          label: {
            en: "No court works like this. I'm hanging up and going to the police station myself.",
            hinglish:
              "Koi court aise kaam nahi karta. Main call kaat ke khud police station ja raha hoon.",
          },
          nextNodeId: "arrest-after",
          hangUp: true,
        },
      ],
    },

    /* ---------------- After the call ---------------- */

    "arrest-after": {
      kind: "thread",
      app: "whatsapp",
      contact: { name: NUMBER, subtitle: "Unknown number" },
      messages: [
        { id: "arrest-missed", from: "system", text: "3 missed video calls", delayMs: 500 },
        {
          id: "arrest-final",
          from: "them",
          delayMs: 1400,
          segments: [
            { text: "FINAL NOTICE. Non-cooperation recorded under case NNIW/CC/2611. " },
            { text: "Arrest team dispatched to your address. " },
            {
              id: "arrest-final-team",
              text: "Call back within 15 minutes to stop it.",
              redFlagId: "arrest-final-notice",
            },
          ],
        },
      ],
      choices: [
        {
          label: { en: "Call back to explain", hinglish: "Samjhane ke liye call back karo" },
          nextNodeId: "arrest-callback-lost",
        },
        {
          label: {
            en: "Block the number, report at cybercrime.gov.in, and tell my family",
            hinglish: "Number block karo, cybercrime.gov.in pe report karo, aur family ko batao",
          },
          nextNodeId: "arrest-safe",
        },
        { label: { en: "Ignore it", hinglish: "Ignore karo" }, nextNodeId: "arrest-safe-quiet" },
      ],
    },

    /* ---------------- Outcomes ---------------- */

    "arrest-lost": {
      kind: "outcome",
      result: "loss",
      title: { en: "₹2 lakh “deposit” gone", hinglish: "₹2 lakh ka “deposit” gaya" },
      body: {
        en: "There is no refund, no case and no Inspector Rawat. The “government-secured account” belonged to a money mule. Police never arrest anyone over a video call, and no lawful process asks you to pay to prove you're innocent.",
        hinglish:
          "Na koi refund hai, na koi case, na koi Inspector Rawat. “Government-secured account” ek money mule ka tha. Police kabhi kisi ko video call pe arrest nahi karti, aur koi bhi legal process tumhe innocent prove karne ke liye paise bharne ko nahi kehta.",
      },
      moneyDelta: -200000,
      rewindToNodeId: "arrest-deposit",
    },
    "arrest-call-lost": {
      kind: "outcome",
      result: "loss",
      title: { en: "₹2 lakh “deposit” gone", hinglish: "₹2 lakh ka “deposit” gaya" },
      body: {
        en: "There is no refund, no case and no Inspector Rawat. The “government-secured account” belonged to a money mule. Police never arrest anyone over a video call, and no lawful process asks you to pay to prove you're innocent.",
        hinglish:
          "Na koi refund hai, na koi case, na koi Inspector Rawat. “Government-secured account” ek money mule ka tha. Police kabhi kisi ko video call pe arrest nahi karti, aur koi bhi legal process tumhe innocent prove karne ke liye paise bharne ko nahi kehta.",
      },
      moneyDelta: -200000,
      rewindToNodeId: "arrest-call",
    },
    "arrest-callback-lost": {
      kind: "outcome",
      result: "loss",
      title: {
        en: "Calling back pulled you back in",
        hinglish: "Call back karte hi tum phir phans gaye",
      },
      body: {
        en: "Forty minutes of threats later, you paid the ₹2,00,000 “deposit”. The final notice existed for one reason: to get you back on the line.",
        hinglish:
          "Chaalis minute ki dhamkiyon ke baad tumne ₹2,00,000 ka “deposit” bhar diya. Final notice ka ek hi maqsad tha: tumhe wapas line pe laana.",
      },
      moneyDelta: -200000,
      rewindToNodeId: "arrest-after",
    },
    "arrest-safe": {
      kind: "outcome",
      result: "safe",
      title: {
        en: "Blocked, reported, family warned",
        hinglish: "Block kiya, report kiya, family ko warn kiya",
      },
      body: {
        en: "No team ever came, because there was no case. You reported the number and told your family, who are often the next people these callers try.",
        hinglish:
          "Koi team nahi aayi, kyunki koi case tha hi nahi. Tumne number report kiya aur family ko bataya, jinhe aksar yeh callers agla nishana banate hain.",
      },
    },
    "arrest-safe-quiet": {
      kind: "outcome",
      result: "safe",
      title: { en: "Safe, but unreported", hinglish: "Safe, par report nahi kiya" },
      body: {
        en: "No team came, because there was no case. Reporting the number (cybercrime.gov.in or 1930) and warning your family would protect the next person they call.",
        hinglish:
          "Koi team nahi aayi, kyunki koi case tha hi nahi. Number report karne (cybercrime.gov.in ya 1930) aur family ko warn karne se woh agla insaan bachta jise yeh call karenge.",
      },
    },
  },

  evidence: {
    warrant: {
      kind: "document",
      title: FILE,
      subtitle: "2 pages · received on chat app",
      footer: "NNIW/CC/2611/2026 · CONFIDENTIAL",
      sections: [
        {
          fields: [
            {
              id: "warrant-head",
              value: `${AGENCY.toUpperCase()}\nCyber Crime Cell · New Delhi\nMinistry of Internal Security (Narcotics Division)`,
              look: "letterhead",
            },
            {
              id: "warrant-title",
              value: "ARREST WARRANT & DIGITAL CUSTODY ORDER",
              look: "title",
              redFlagId: "warrant-digital-custody",
            },
            {
              id: "warrant-ref",
              value: "Case No. NNIW/CC/2611/2026 · Issued 27 Nov 2026",
              look: "meta",
            },
            {
              id: "warrant-accused",
              label: "Accused",
              value: "Aarav Menon, owner of vehicle KA-05-MN-4417",
              look: "term",
            },
            {
              id: "warrant-offence",
              label: "Offence",
              value: "Trafficking of 2 kg banned narcotics (intercepted at border)",
              look: "term",
            },
            {
              id: "warrant-status",
              label: "Status",
              value: "Non-bailable",
              look: "term",
            },
            {
              id: "warrant-clause-video",
              label: "1.",
              value:
                "The accused shall remain on continuous video surveillance until the investigation is closed. Disconnecting the call will be treated as absconding.",
              look: "clause",
              redFlagId: "warrant-video-clause",
            },
            {
              id: "warrant-clause-secret",
              label: "2.",
              value:
                "This matter is classified. Disclosure to family members or legal counsel is a punishable offence.",
              look: "clause",
              redFlagId: "warrant-secrecy-clause",
            },
          ],
        },
        {
          fields: [
            {
              id: "warrant-clause-deposit",
              label: "3.",
              value:
                "To avoid physical arrest, the accused must transfer a refundable verification deposit of ₹2,00,000 to the Government Secured Account below within 2 hours.",
              look: "clause",
              redFlagId: "warrant-deposit-clause",
            },
            {
              id: "warrant-payee",
              label: "Beneficiary",
              value: "S K Traders · A/c 0031 4471 9902 · Coastline Co-op Bank",
              look: "term",
              redFlagId: "warrant-payee",
            },
            {
              id: "warrant-refund",
              label: "Refund",
              value: "Within 48 hours of clearance",
              look: "term",
            },
            {
              id: "warrant-sign",
              value: "By order,\nArjun Rawat\nInspector, Cyber Crime Cell · Badge NNIW-7741",
              look: "signed",
            },
            {
              id: "warrant-contact",
              value: "For queries: arjun.rawat.nniw@gmail.com",
              finePrint: true,
              redFlagId: "warrant-gmail",
            },
          ],
        },
      ],
    },
  },

  redFlags: {
    "arrest-knows-data": {
      label: {
        en: "Knows your name and car number",
        hinglish: "Tumhara naam aur car number jaanta hai",
      },
      tactic: "fake-proof",
      explanation: {
        en: "Vehicle and owner details leak from many places and are easy to buy. Knowing them doesn't make a caller an officer.",
        hinglish:
          "Gaadi aur owner ki details kai jagah se leak hoti hain aur aasaani se bikti hain. Inhe jaanne se caller officer nahi ban jaata.",
      },
    },
    "arrest-fir-shock": {
      label: {
        en: "Drugs, the border and an FIR, all at once",
        hinglish: "Drugs, border aur FIR, sab ek saath",
      },
      tactic: "fear",
      explanation: {
        en: "Fear before any facts. The shock leaves you no room to ask whether any of it makes sense (your car never left home).",
        hinglish:
          "Facts se pehle darr. Jhatke ki wajah se tum yeh pooch hi nahi paate ki kisi baat ka matlab banta bhi hai (tumhari car toh ghar se nikli hi nahi).",
      },
    },
    "arrest-fake-sympathy": {
      label: { en: "“I'm your only chance”", hinglish: "“Main hi aapka akela sahara hoon”" },
      tactic: "isolation",
      explanation: {
        en: "Fake sympathy makes the caller your only helper, so you stop looking for real help.",
        hinglish:
          "Nakli hamdardi caller ko tumhara akela madadgaar bana deti hai, taaki tum asli madad dhoondhna band kar do.",
      },
    },
    "arrest-secrecy": {
      label: { en: "Don't tell family or a lawyer", hinglish: "Family ya lawyer ko mat batana" },
      tactic: "isolation",
      explanation: {
        en: "Secrecy is the heart of the scam. Real police never forbid you from talking to your family or a lawyer.",
        hinglish:
          "Secret rakhwana hi is scam ki jaan hai. Asli police kabhi tumhe family ya lawyer se baat karne se nahi rokti.",
      },
    },
    "arrest-stay-on-video": {
      label: { en: "Stay on this video call", hinglish: "Isi video call pe raho" },
      tactic: "blocks-verification",
      explanation: {
        en: "“Digital arrest” does not exist in law. Keeping you on camera stops you from checking with anyone.",
        hinglish:
          "Kanoon mein “digital arrest” jaisa kuch nahi hota. Tumhe camera pe rakhne se tum kisi se check nahi kar paate.",
      },
    },
    "arrest-warrant-proof": {
      label: { en: "A warrant sent on a chat app", hinglish: "Chat app pe bheja gaya warrant" },
      tactic: "fake-proof",
      explanation: {
        en: "Forged PDFs with stamps and badge numbers take minutes to make. Real warrants aren't served over a chat app.",
        hinglish:
          "Stamp aur badge number wale nakli PDF banane mein bas kuch minute lagte hain. Asli warrant chat app pe nahi bheje jaate.",
      },
    },
    "arrest-team-threat": {
      label: {
        en: "“We will send a team to your house”",
        hinglish: "“Hum aapke ghar team bhejenge”",
      },
      tactic: "fear",
      explanation: {
        en: "Intimidation the moment you push back. A real officer doesn't threaten you for asking questions.",
        hinglish:
          "Jaise hi tum sawaal karte ho, dhamki shuru. Asli officer sawaal poochne pe dhamki nahi deta.",
      },
    },
    "arrest-blocks-help": {
      label: { en: "A warrant if you disconnect", hinglish: "Call kaati toh warrant" },
      tactic: "blocks-verification",
      explanation: {
        en: "Calling a lawyer or the local police is exactly the safe move, which is why they threaten you for it.",
        hinglish:
          "Lawyer ya local police ko call karna hi sabse safe kadam hai, isiliye woh uske liye dhamki dete hain.",
      },
    },
    "arrest-deposit": {
      label: {
        en: "A “refundable verification deposit”",
        hinglish: "Ek “refundable verification deposit”",
      },
      tactic: "pay-to-clear",
      explanation: {
        en: "No court or police force takes money to prove you're innocent. “Refundable” is there to make it feel safe.",
        hinglish:
          "Koi court ya police tumhe innocent prove karne ke liye paise nahi leti. “Refundable” bas isliye hai taaki safe lage.",
      },
    },
    "arrest-final-notice": {
      label: { en: "Call back within 15 minutes", hinglish: "15 minute mein call back karo" },
      tactic: "urgency",
      explanation: {
        en: "Repeated calls and threatening texts after you hang up are part of the script. The deadline is there to pull you back on the line.",
        hinglish:
          "Call kaatne ke baad baar-baar calls aur dhamki bhare texts script ka hissa hain. Deadline tumhe wapas line pe kheenchne ke liye hai.",
      },
    },
    "warrant-digital-custody": {
      label: { en: "A “digital custody order”", hinglish: "Ek “digital custody order”" },
      tactic: "fake-proof",
      explanation: {
        en: "There's no such thing as digital custody or digital arrest in Indian law. The scary title is the forgery's main job.",
        hinglish:
          "Indian law mein digital custody ya digital arrest jaisa kuch nahi hai. Daraane wala title hi is nakli document ka asli kaam hai.",
      },
    },
    "warrant-video-clause": {
      label: {
        en: "Stay on video or be “absconding”",
        hinglish: "Video pe raho, warna “absconding”",
      },
      tactic: "blocks-verification",
      explanation: {
        en: "No warrant orders you to stay on a video call. The clause exists to stop you from hanging up and checking.",
        hinglish:
          "Koi warrant tumhe video call pe rehne ka order nahi deta. Yeh clause tumhe call kaat ke check karne se rokne ke liye hai.",
      },
    },
    "warrant-secrecy-clause": {
      label: {
        en: "Telling family or a lawyer is “an offence”",
        hinglish: "Family ya lawyer ko batana “offence” hai",
      },
      tactic: "isolation",
      explanation: {
        en: "You always have the right to talk to family and a lawyer. A document that forbids it is forged.",
        hinglish:
          "Family aur lawyer se baat karne ka haq tumhe hamesha hai. Jo document ise mana kare, woh nakli hai.",
      },
    },
    "warrant-deposit-clause": {
      label: { en: "A deposit to avoid arrest", hinglish: "Arrest se bachne ke liye deposit" },
      tactic: "pay-to-clear",
      explanation: {
        en: "Warrants don't come with a payment option. Paying to avoid arrest is the scam itself.",
        hinglish:
          "Warrant ke saath payment ka option nahi aata. Arrest se bachne ke liye paise dena hi scam hai.",
      },
    },
    "warrant-payee": {
      label: {
        en: "A “government account” held by a trading firm",
        hinglish: "Ek trading firm ka “government account”",
      },
      tactic: "pay-to-clear",
      explanation: {
        en: "S K Traders at a co-op bank isn't a government account. It's a mule account that will be emptied within minutes.",
        hinglish:
          "Co-op bank mein S K Traders ka account government account nahi hai. Yeh mule account hai jo kuch hi minute mein khaali kar diya jaayega.",
      },
    },
    "warrant-gmail": {
      label: {
        en: "An officer with a free email address",
        hinglish: "Free email address wala officer",
      },
      tactic: "impersonation",
      explanation: {
        en: "Officials don't use free webmail for case queries. Check the fine print before trusting a stamp.",
        hinglish:
          "Officials case queries ke liye free webmail use nahi karte. Stamp pe bharosa karne se pehle fine print check karo.",
      },
    },
  },

  debrief: {
    rule: {
      en: "No real agency arrests anyone over a video call. Secrecy plus a payment to “clear your name” means scam.",
      hinglish:
        "Koi asli agency video call pe kisi ko arrest nahi karti. Secret rakhwana plus “naam clear karne” ke liye payment ka matlab hai scam.",
    },
    summary: {
      en: "The script runs in a fixed order: knowing a little real data, a shock (drugs, an FIR), isolation (tell no one, stay on camera), fake proof (a stamped PDF), and finally the payment. Every step makes it harder to hang up, which is why hanging up early is the strongest move. Telling someone you trust breaks the spell.",
      hinglish:
        "Script ek fixed order mein chalti hai: thoda asli data jaanna, ek jhatka (drugs, FIR), isolation (kisi ko mat batao, camera pe raho), nakli saboot (stamp wala PDF), aur aakhir mein payment. Har step ke saath call kaatna mushkil hota jaata hai, isiliye jaldi call kaatna sabse strong move hai. Kisi bharosemand insaan ko batate hi jaadu toot jaata hai.",
    },
    realWorldAction: REAL_WORLD_ACTION,
  },
});
