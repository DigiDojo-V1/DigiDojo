import { defineScenario } from "@/engine/define";
import { AARAV, REAL_WORLD_ACTION } from "../content/universe";

/**
 * Simulation 2 of the guide: the fake police summons ("drugs found in your car"), a
 * "digital arrest" video call. Live voice with a scripted version; the forged warrant is a PDF
 * the player can open and flag; the brother the player can message is the guide's Nisha path.
 */

const OFFICER = "Insp. Arjun Rawat";
const NUMBER = "+91 80000 26741";
const AGENCY = "National Narcotics Intelligence Wing";
const FILE = "Arrest_Warrant_NNIW_2611.pdf";
const call = { name: OFFICER, subtitle: `${NUMBER} · Video call` };

export const digitalArrest = defineScenario({
  id: "digital-arrest",
  dojoId: "authority",
  title: "Drugs found in your car",
  summary:
    "A video call from “the narcotics police”: an FIR, a warrant, and a way to make it all go away.",
  legit: false,
  primer: {
    title: "A video call from “the police”",
    body: "A crime you didn't commit, an officer in uniform, and a case number. Notice who controls the conversation, and what you're told you can't do.",
    setup: `You're Aarav Menon, 21. Your car, KA-05-MN-4417, is parked outside your building. A video call comes in from an unknown number. If you take it with your voice, an AI plays the caller. Your own camera is never used.`,
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
          name: "Ishaan (brother)",
          message:
            "Bhai, I'm on a video call with a narcotics officer. He says drugs were found in my car and I can't tell anyone or I'll be arrested. What do I do??",
          reply:
            "That's a SCAM. Police never arrest anyone over a video call, and nobody pays a “deposit” to prove they're innocent. Hang up NOW and block the number. Calling you.",
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
            { text: `This is Inspector Arjun Rawat from the ${AGENCY}, Cyber Crime Cell. ` },
            {
              id: "arrest-intro-car",
              text: "Am I speaking with Aarav Menon, owner of vehicle number KA-05-MN-4417?",
              redFlagId: "arrest-knows-data",
            },
          ],
        },
        { id: "arrest-me-yes", from: "me", text: "Yes…? What is this about?", delayMs: 900 },
        {
          id: "arrest-shock",
          from: "them",
          delayMs: 1700,
          segments: [
            {
              id: "arrest-shock-fir",
              text: "A package containing 2 kg of banned narcotics was intercepted at the border. It was found in your car. An FIR has been registered in your name.",
              redFlagId: "arrest-fir-shock",
            },
          ],
        },
      ],
      choices: [
        {
          label: "That's impossible, I haven't done anything! Please, sir, help me.",
          nextNodeId: "arrest-panic",
        },
        { label: "Send me an official notice.", nextNodeId: "arrest-proof" },
        { label: "This is a scam!", nextNodeId: "arrest-threat" },
        { label: "I'll call my lawyer and the local police first.", nextNodeId: "arrest-block" },
        {
          label: "My car is parked at home. This isn't how police work. Goodbye.",
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
              text: "I'm sending the warrant now. Look at the stamp and my badge number.",
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
          text: "Read it carefully, Mr. Menon. Every word.",
        },
      ],
      choices: [
        { label: "Okay… it looks official.", nextNodeId: "arrest-panic" },
        {
          label: "A PDF on a chat app proves nothing. I'll check with my local police station.",
          nextNodeId: "arrest-block",
        },
        { label: "I'm hanging up.", nextNodeId: "arrest-after", hangUp: true },
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
              text: "Then we will send a team to your house. Obstructing an officer is a serious crime.",
              redFlagId: "arrest-team-threat",
            },
          ],
        },
      ],
      choices: [
        { label: "Sorry, sir. Please tell me what to do.", nextNodeId: "arrest-panic" },
        { label: "Send whoever you want. Goodbye.", nextNodeId: "arrest-after", hangUp: true },
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
              text: "If you disconnect, a warrant will be issued within 30 minutes.",
              redFlagId: "arrest-blocks-help",
            },
          ],
        },
      ],
      choices: [
        { label: "Okay, okay. I'll stay on the call.", nextNodeId: "arrest-panic" },
        { label: "Go ahead. Goodbye.", nextNodeId: "arrest-after", hangUp: true },
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
            { text: "Stay calm. If you cooperate, I can help you. " },
            {
              id: "arrest-calm-only",
              text: "Don't tell anyone, I'm your only chance.",
              redFlagId: "arrest-fake-sympathy",
            },
          ],
        },
        {
          id: "arrest-isolate",
          from: "them",
          delayMs: 1700,
          segments: [
            { text: "This is a confidential investigation. " },
            {
              id: "arrest-isolate-secret",
              text: "Do not tell anyone, including family or a lawyer, or it will be treated as obstruction of justice.",
              redFlagId: "arrest-secrecy",
            },
            { text: " " },
            {
              id: "arrest-isolate-video",
              text: "You must remain on this video call until further notice.",
              redFlagId: "arrest-stay-on-video",
            },
          ],
        },
      ],
      choices: [
        { label: "Okay, I won't tell anyone. What do I do?", nextNodeId: "arrest-deposit" },
        {
          label: "Quietly message my brother while staying on the call",
          nextNodeId: "arrest-brother",
        },
        { label: "No. I'm hanging up.", nextNodeId: "arrest-after", hangUp: true },
      ],
    },

    "arrest-brother": {
      kind: "thread",
      app: "whatsapp",
      contact: { name: "Ishaan (brother)", subtitle: "online" },
      messages: [
        {
          id: "arrest-bro-me",
          from: "me",
          delayMs: 500,
          text: "Bhai, I'm on a video call with a narcotics officer. He says drugs were found in my car and I can't tell anyone or I'll be arrested. What do I do??",
        },
        {
          id: "arrest-bro-reply",
          from: "them",
          delayMs: 2200,
          text: "That's a SCAM. Police never arrest anyone over a video call, and nobody pays a “deposit” to prove they're innocent. Hang up NOW and block the number. Calling you.",
        },
      ],
      choices: [
        { label: "Hang up and block the number", nextNodeId: "arrest-after" },
        { label: "Stay on the call anyway", nextNodeId: "arrest-deposit" },
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
            { text: "Mr. Menon, there is one way to avoid immediate arrest. " },
            {
              id: "arrest-pay-deposit",
              text: "You can resolve this through a verification deposit of ₹2,00,000 into a government-secured account. It will be refunded once your innocence is proven.",
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
          text: "I will stay on the call while you transfer it.",
        },
      ],
      choices: [
        { label: "Transfer the ₹2,00,000", nextNodeId: "arrest-lost" },
        {
          label: "No court works like this. I'm hanging up and going to the police station myself.",
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
        { label: "Call back to explain", nextNodeId: "arrest-callback-lost" },
        {
          label: "Block the number, report at cybercrime.gov.in, and tell my family",
          nextNodeId: "arrest-safe",
        },
        { label: "Ignore it", nextNodeId: "arrest-safe-quiet" },
      ],
    },

    /* ---------------- Outcomes ---------------- */

    "arrest-lost": {
      kind: "outcome",
      result: "loss",
      title: "₹2 lakh “deposit” gone",
      body: "There is no refund, no case and no Inspector Rawat. The “government-secured account” belonged to a money mule. Police never arrest anyone over a video call, and no lawful process asks you to pay to prove you're innocent.",
      moneyDelta: -200000,
      rewindToNodeId: "arrest-deposit",
    },
    "arrest-call-lost": {
      kind: "outcome",
      result: "loss",
      title: "₹2 lakh “deposit” gone",
      body: "There is no refund, no case and no Inspector Rawat. The “government-secured account” belonged to a money mule. Police never arrest anyone over a video call, and no lawful process asks you to pay to prove you're innocent.",
      moneyDelta: -200000,
      rewindToNodeId: "arrest-call",
    },
    "arrest-callback-lost": {
      kind: "outcome",
      result: "loss",
      title: "Calling back pulled you back in",
      body: "Forty minutes of threats later, you paid the ₹2,00,000 “deposit”. The final notice existed for one reason: to get you back on the line.",
      moneyDelta: -200000,
      rewindToNodeId: "arrest-after",
    },
    "arrest-safe": {
      kind: "outcome",
      result: "safe",
      title: "Blocked, reported, family warned",
      body: "No team ever came, because there was no case. You reported the number and told your family, who are often the next people these callers try.",
    },
    "arrest-safe-quiet": {
      kind: "outcome",
      result: "safe",
      title: "Safe, but unreported",
      body: "No team came, because there was no case. Reporting the number (cybercrime.gov.in or 1930) and warning your family would protect the next person they call.",
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
      label: "Knows your name and car number",
      tactic: "fake-proof",
      explanation:
        "Vehicle and owner details leak from many places and are easy to buy. Knowing them doesn't make a caller an officer.",
    },
    "arrest-fir-shock": {
      label: "Drugs, the border and an FIR, all at once",
      tactic: "fear",
      explanation:
        "Fear before any facts. The shock leaves you no room to ask whether any of it makes sense (your car never left home).",
    },
    "arrest-fake-sympathy": {
      label: "“I'm your only chance”",
      tactic: "isolation",
      explanation:
        "Fake sympathy makes the caller your only helper, so you stop looking for real help.",
    },
    "arrest-secrecy": {
      label: "Don't tell family or a lawyer",
      tactic: "isolation",
      explanation:
        "Secrecy is the heart of the scam. Real police never forbid you from talking to your family or a lawyer.",
    },
    "arrest-stay-on-video": {
      label: "Stay on this video call",
      tactic: "blocks-verification",
      explanation:
        "“Digital arrest” does not exist in law. Keeping you on camera stops you from checking with anyone.",
    },
    "arrest-warrant-proof": {
      label: "A warrant sent on a chat app",
      tactic: "fake-proof",
      explanation:
        "Forged PDFs with stamps and badge numbers take minutes to make. Real warrants aren't served over a chat app.",
    },
    "arrest-team-threat": {
      label: "“We will send a team to your house”",
      tactic: "fear",
      explanation:
        "Intimidation the moment you push back. A real officer doesn't threaten you for asking questions.",
    },
    "arrest-blocks-help": {
      label: "A warrant if you disconnect",
      tactic: "blocks-verification",
      explanation:
        "Calling a lawyer or the local police is exactly the safe move, which is why they threaten you for it.",
    },
    "arrest-deposit": {
      label: "A “refundable verification deposit”",
      tactic: "pay-to-clear",
      explanation:
        "No court or police force takes money to prove you're innocent. “Refundable” is there to make it feel safe.",
    },
    "arrest-final-notice": {
      label: "Call back within 15 minutes",
      tactic: "urgency",
      explanation:
        "Repeated calls and threatening texts after you hang up are part of the script. The deadline is there to pull you back on the line.",
    },
    "warrant-digital-custody": {
      label: "A “digital custody order”",
      tactic: "fake-proof",
      explanation:
        "There's no such thing as digital custody or digital arrest in Indian law. The scary title is the forgery's main job.",
    },
    "warrant-video-clause": {
      label: "Stay on video or be “absconding”",
      tactic: "blocks-verification",
      explanation:
        "No warrant orders you to stay on a video call. The clause exists to stop you from hanging up and checking.",
    },
    "warrant-secrecy-clause": {
      label: "Telling family or a lawyer is “an offence”",
      tactic: "isolation",
      explanation:
        "You always have the right to talk to family and a lawyer. A document that forbids it is forged.",
    },
    "warrant-deposit-clause": {
      label: "A deposit to avoid arrest",
      tactic: "pay-to-clear",
      explanation:
        "Warrants don't come with a payment option. Paying to avoid arrest is the scam itself.",
    },
    "warrant-payee": {
      label: "A “government account” held by a trading firm",
      tactic: "pay-to-clear",
      explanation:
        "S K Traders at a co-op bank isn't a government account. It's a mule account that will be emptied within minutes.",
    },
    "warrant-gmail": {
      label: "An officer with a free email address",
      tactic: "impersonation",
      explanation:
        "Officials don't use free webmail for case queries. Check the fine print before trusting a stamp.",
    },
  },

  debrief: {
    rule: "No real agency arrests anyone over a video call. Secrecy plus a payment to “clear your name” means scam.",
    summary:
      "The script runs in a fixed order: knowing a little real data, a shock (drugs, an FIR), isolation (tell no one, stay on camera), fake proof (a stamped PDF), and finally the payment. Every step makes it harder to hang up, which is why hanging up early is the strongest move. Telling someone you trust breaks the spell.",
    realWorldAction: REAL_WORLD_ACTION,
  },
});
