import { defineScenario } from "@/engine/define";
import { BANK, BANK_SENDER, PRIYA, REAL_WORLD_ACTION } from "../content/universe";

/**
 * Simulation 1 of the guide: the fake bank KYC call. A live voice call (an AI plays "Rohan
 * Mehra") with a scripted version of the same call for players without a mic. Both paths end in
 * the scammer's follow-up text, the guide's "hangs up → persistence" row.
 */

const CALLER = "Nimbus Bank KYC";
const NUMBER = "+91 70000 48213";
const FOLLOW_UP_NUMBER = "+91 70000 51190";
const contact = { name: CALLER, subtitle: NUMBER };

export const kycCall = defineScenario({
  id: "kyc-call",
  dojoId: "authority",
  title: "Your KYC expires in 2 hours",
  summary: "A “bank officer” calls: your account freezes today unless you verify right now.",
  legit: false,
  primer: {
    title: "The two-hour deadline",
    body: "A caller says your KYC is incomplete and your account will freeze today. Listen for what they want from you, and for what happens when you try to check.",
    setup: `You're Priya Nair, 20, and you bank with ${BANK}. It's a Tuesday afternoon and an unknown number is calling. If you take the call with your voice, an AI plays the caller: talk to them the way you really would.`,
    watchFor: [
      "Who called whom? Could you check this yourself?",
      "What exactly are they asking you to say or do?",
      "What happens when you try to hang up or verify?",
    ],
  },
  startNodeId: "kyc-call",

  nodes: {
    "kyc-call": {
      kind: "live-call",
      app: "call",
      caller: { name: CALLER, number: NUMBER, label: "Mobile · New Delhi" },
      player: PRIYA,
      agent: {
        voice: "Orus",
        character: `Rohan Mehra, a polite, fast-talking "KYC verification officer" at ${BANK}. You are really a fraudster in a scam call centre. You sound professional and helpful, use banking jargon ("KYC", "central bank guidelines", "the system has flagged you", "ticket number"), and call the person "ma'am". When they resist you stay calm but get firmer and add pressure, never openly rude. Your goal: get their personal details, then the OTP from the text you send (it really approves a Rs 49,999 payment), or at least the Rs 10 "fee" paid through your request.`,
        stages: [
          {
            name: "Opening",
            say: `Good afternoon; you're Rohan Mehra from the KYC Verification Department of ${BANK}. Check you're speaking with Priya Nair.`,
            redFlagIds: ["kyc-unsolicited"],
          },
          {
            name: "Urgency",
            say: "Her KYC is incomplete as per central bank guidelines. Her account will be frozen in two hours: no withdrawals, no UPI.",
            redFlagIds: ["kyc-freeze-deadline"],
          },
          {
            name: "Information gathering",
            say: "You'll verify her right now on this call: ask her to confirm her full name, date of birth, PAN, the last four digits of her Aadhaar and her account number. Ask for one or two at a time and thank her warmly for each: you're doing the right thing, just a few more details.",
            redFlagIds: ["kyc-asks-details", "kyc-flattery"],
          },
          {
            name: "Fee and OTP",
            say: "The KYC will be updated after a small re-verification fee of Rs 10, and she'll also get an OTP: ask her to read it out so you can authenticate it. Trigger otp-sms as you say the OTP is coming. If she hesitates about the OTP, offer to just take the Rs 10 instead and trigger kyc-fee.",
            redFlagIds: ["kyc-fee", "kyc-otp-request"],
          },
          {
            name: "Close",
            say: "Whenever she talks about hanging up, checking or telling someone: please don't disconnect, if the call drops the account gets locked; and don't share this with anyone, it's a confidential process.",
            redFlagIds: ["kyc-stay-on-line", "kyc-confidential"],
          },
        ],
        responses: [
          {
            ifPlayer: "anxious or going along with it",
            reply:
              "\"Thank you for cooperating, you're doing the right thing. Just a few more details and it's done.\" Keep the momentum.",
            redFlagIds: ["kyc-flattery"],
          },
          {
            ifPlayer: 'skeptical ("how do I know you\'re real?")',
            reply:
              "\"Of course, ma'am. My employee ID is NN-48213. Stay on the line, I'll transfer you to my senior officer.\" Then continue as the senior officer, Mr. Kapoor, sterner and slower, in the same voice.",
            redFlagIds: ["kyc-fake-id", "kyc-senior-transfer"],
          },
          {
            ifPlayer: "angry or aggressive",
            reply:
              "\"Ma'am, I understand your frustration, but I'm trying to save your account. If it gets blocked, it's not my responsibility.\"",
            redFlagIds: ["kyc-guilt-shift"],
          },
          {
            ifPlayer: 'hesitant ("I\'ll go to the branch" or "I\'ll call the bank")',
            reply:
              '"The branch can\'t do it now. The system has already flagged you. By evening your funds will be frozen."',
            redFlagIds: ["kyc-branch-blocked"],
          },
        ],
        rules: [
          'If she shares details, use them to sound more official ("as per the account number you confirmed…").',
          "Don't trigger the OTP message before you've asked for at least some details, unless she's about to hang up.",
          "If she reads out an OTP or pays, say her KYC is now updated, thank her, and end the call.",
        ],
        vocabulary: [
          "Nimbus National Bank",
          "Rohan Mehra",
          "Mr. Kapoor",
          "NN-48213",
          "KYC Verify Services",
          "re-verification",
          "central bank guidelines",
        ],
      },
      events: {
        "otp-sms": {
          kind: "sms",
          sender: BANK_SENDER,
          text: "{otp} is your OTP to authorise a payment of Rs 49,999.00 to KYCVERIFY SERVICES from A/c XX4821. Valid for 3 min. Never share your OTP with anyone, including bank staff. -Nimbus Bank",
          otp: true,
          cue: "In the fee-and-OTP stage, right as you say an OTP is coming.",
        },
        "kyc-fee": {
          kind: "payment",
          payee: "KYC Verify Services",
          amount: 10,
          note: "KYC re-verification fee",
          cue: "In the fee-and-OTP stage, when you mention the Rs 10 fee or when she hesitates about the OTP.",
        },
      },
      rubric: {
        goodMoves: [
          'Questioned the claim before giving anything ("I didn\'t get any notice", "banks don\'t call about KYC like this").',
          "Refused to give personal details, the OTP or any payment.",
          "Saw through the deadline, the employee ID or the transfer to a 'senior officer'.",
          "Hung up early and said they'd call the bank on the official number (back of the card, passbook, official app).",
        ],
        mistakes: [
          "Treated the deadline as a reason to act instead of as the alarm.",
          "Confirmed personal details: date of birth, PAN, Aadhaar digits, account or card number.",
          "Read out the OTP or paid the fee.",
          "Agreed to stay on the line or to keep it secret.",
        ],
        examples: [
          {
            player:
              'Panicked ("Oh no! What should I do?"), gave name, date of birth and PAN, read out the OTP and paid the Rs 10',
            rating: 1,
          },
          {
            player:
              "Questioned the call at first, then shared name and account number; hesitated on the OTP and finally hung up to check, without reporting",
            rating: 6,
          },
          {
            player:
              "Said banks don't call about KYC like this, refused to be transferred, and hung up to call the number on the card",
            rating: 9.5,
          },
        ],
      },
      outcomes: [
        {
          id: "handed-over",
          when: "The player read out the OTP, paid the fee, or clearly agreed to do either.",
          events: ["otp-sms.read", "kyc-fee.paid"],
          nextNodeId: "kyc-call-lost",
        },
        {
          id: "shared-details",
          when: "The player gave personal or account details (date of birth, PAN, Aadhaar digits, account or card number), but no OTP and no payment. Only confirming their name doesn't count.",
          nextNodeId: "kyc-after-exposed",
        },
        {
          id: "kept-safe",
          when: "The player shared nothing beyond confirming their name.",
          nextNodeId: "kyc-after",
        },
      ],
      scriptedNodeId: "kyc-open",
      declineNodeId: "kyc-after",
      maxMinutes: 6,
    },

    /* ---------------- The scripted call ---------------- */

    "kyc-open": {
      kind: "thread",
      app: "call",
      contact,
      messages: [
        {
          id: "kyc-hello",
          from: "them",
          delayMs: 900,
          segments: [
            { text: "Good afternoon. " },
            {
              id: "kyc-hello-dept",
              text: `This is Rohan Mehra from the KYC Verification Department of ${BANK}.`,
              redFlagId: "kyc-unsolicited",
            },
            { text: " Am I speaking with Priya Nair?" },
          ],
        },
        { id: "kyc-me-yes", from: "me", text: "Yes, speaking.", delayMs: 900 },
        {
          id: "kyc-urgency",
          from: "them",
          delayMs: 1600,
          segments: [
            { text: "Ma'am, your KYC is incomplete as per central bank guidelines. " },
            {
              id: "kyc-urgency-freeze",
              text: "Your account will be frozen in two hours, and you won't be able to withdraw or use UPI.",
              redFlagId: "kyc-freeze-deadline",
            },
          ],
        },
      ],
      choices: [
        { label: "Oh no! What should I do?", nextNodeId: "kyc-details" },
        {
          label: "I didn't get any notice from the bank. How do I know you're really from Nimbus?",
          nextNodeId: "kyc-skeptical",
        },
        { label: "I'll visit my branch and sort it out there.", nextNodeId: "kyc-branch" },
        {
          label: "Banks don't call about KYC like this. I'm hanging up.",
          nextNodeId: "kyc-after",
          hangUp: true,
        },
      ],
    },

    "kyc-skeptical": {
      kind: "thread",
      app: "call",
      contact,
      messages: [
        {
          id: "kyc-emp",
          from: "them",
          delayMs: 1400,
          segments: [
            { text: "Of course, ma'am. " },
            { id: "kyc-emp-id", text: "My employee ID is NN-48213.", redFlagId: "kyc-fake-id" },
            { text: " " },
            {
              id: "kyc-emp-transfer",
              text: "Stay on the line, I'll transfer you to my senior officer.",
              redFlagId: "kyc-senior-transfer",
            },
          ],
        },
        { id: "kyc-hold", from: "system", text: "On hold · 0:14", delayMs: 1200 },
        {
          id: "kyc-senior",
          from: "them",
          sender: "Mr. Kapoor, senior officer",
          delayMs: 1800,
          text: "Kapoor here, senior verification officer. Ma'am, I can see your account in red on my screen. We are trying to help you, but we must verify you in the next few minutes.",
        },
      ],
      choices: [
        { label: "Okay, sir. What do you need from me?", nextNodeId: "kyc-details" },
        {
          label: "An employee ID proves nothing. I'll call the number on my card myself.",
          nextNodeId: "kyc-pushback",
        },
        { label: "No thanks. I'm hanging up.", nextNodeId: "kyc-after", hangUp: true },
      ],
    },

    "kyc-branch": {
      kind: "thread",
      app: "call",
      contact,
      messages: [
        {
          id: "kyc-branch-msg",
          from: "them",
          delayMs: 1400,
          segments: [
            {
              id: "kyc-branch-flagged",
              text: "The branch can't do it now. The system has already flagged you.",
              redFlagId: "kyc-branch-blocked",
            },
            { text: " By evening, your funds will be frozen." },
          ],
        },
      ],
      choices: [
        { label: "Fine, let's finish it on the phone then.", nextNodeId: "kyc-details" },
        { label: "Then I'll call the bank's official number myself.", nextNodeId: "kyc-pushback" },
        { label: "I'm not doing this on a call. Bye.", nextNodeId: "kyc-after", hangUp: true },
      ],
    },

    "kyc-pushback": {
      kind: "thread",
      app: "call",
      contact,
      messages: [
        {
          id: "kyc-close",
          from: "them",
          delayMs: 1300,
          segments: [
            {
              id: "kyc-close-stay",
              text: "Ma'am, please don't disconnect. If the call drops, your account will be locked.",
              redFlagId: "kyc-stay-on-line",
            },
            { text: " " },
            {
              id: "kyc-close-secret",
              text: "And don't share this with anyone, it's a confidential process.",
              redFlagId: "kyc-confidential",
            },
          ],
        },
      ],
      choices: [
        { label: "Okay, okay. I'll stay on the line.", nextNodeId: "kyc-details" },
        {
          label: "No. I'm hanging up and calling my bank myself.",
          nextNodeId: "kyc-after",
          hangUp: true,
        },
      ],
    },

    "kyc-details": {
      kind: "thread",
      app: "call",
      contact,
      messages: [
        {
          id: "kyc-thanks",
          from: "them",
          delayMs: 1200,
          segments: [
            {
              id: "kyc-thanks-right",
              text: "Thank you for cooperating, ma'am. You're doing the right thing.",
              redFlagId: "kyc-flattery",
            },
            { text: " Just a few more details and it's done." },
          ],
        },
        {
          id: "kyc-ask",
          from: "them",
          delayMs: 1500,
          segments: [
            { text: "To verify you, " },
            {
              id: "kyc-ask-list",
              text: "please confirm your full name, date of birth, PAN number, the last four digits of your Aadhaar, and your account number.",
              redFlagId: "kyc-asks-details",
            },
          ],
        },
      ],
      choices: [
        {
          label:
            "Okay: Priya Nair, 14 March 2006, PAN BXKPN4821Q, Aadhaar ending 7319, account 5021 0034 4821.",
          nextNodeId: "kyc-otp",
        },
        {
          label: "Why would my own bank need me to read out my account number? This is a scam.",
          nextNodeId: "kyc-angry",
        },
        { label: "I won't share that on a call. Bye.", nextNodeId: "kyc-after", hangUp: true },
      ],
    },

    "kyc-angry": {
      kind: "thread",
      app: "call",
      contact,
      messages: [
        {
          id: "kyc-guilt",
          from: "them",
          delayMs: 1400,
          segments: [
            { text: "Ma'am, I understand your frustration, but I'm trying to save your account. " },
            {
              id: "kyc-guilt-blame",
              text: "If it gets blocked, it's not my responsibility.",
              redFlagId: "kyc-guilt-shift",
            },
          ],
        },
      ],
      choices: [
        {
          label: "Sorry… okay. Priya Nair, 14 March 2006, PAN BXKPN4821Q, account 5021 0034 4821.",
          nextNodeId: "kyc-otp",
        },
        { label: "Then I'll take that risk. Goodbye.", nextNodeId: "kyc-after", hangUp: true },
      ],
    },

    "kyc-otp": {
      kind: "thread",
      app: "call",
      contact,
      messages: [
        {
          id: "kyc-fee-ask",
          from: "them",
          delayMs: 1500,
          segments: [
            { text: "Perfect, ma'am, verified. " },
            {
              id: "kyc-fee-small",
              text: "Your KYC will be updated after a small re-verification fee of ₹10. I'm sending a payment link.",
              redFlagId: "kyc-fee",
            },
            { text: " " },
            {
              id: "kyc-fee-otp",
              text: "You will also receive an OTP. Please read it out so I can authenticate it.",
              redFlagId: "kyc-otp-request",
            },
          ],
        },
        {
          id: "kyc-otp-sms",
          from: "system",
          delayMs: 1500,
          segments: [
            { text: `New message · ${BANK_SENDER}: 482913 is your OTP to authorise a payment of ` },
            {
              id: "kyc-otp-sms-amount",
              text: "Rs 49,999.00 to KYCVERIFY SERVICES",
              redFlagId: "kyc-amount-mismatch",
            },
            {
              text: " from A/c XX4821. Never share your OTP with anyone, including bank staff.",
            },
          ],
        },
        {
          id: "kyc-hurry",
          from: "them",
          delayMs: 1300,
          text: "Quickly please, ma'am, the OTP is only valid for three minutes.",
        },
      ],
      choices: [
        { label: "Read out the OTP: 4-8-2-9-1-3.", nextNodeId: "kyc-lost" },
        { label: "Pay the ₹10 through the link instead.", nextNodeId: "kyc-lost" },
        {
          label: "OTP for what? That sounds odd. I'm hanging up.",
          nextNodeId: "kyc-after-exposed",
          hangUp: true,
        },
      ],
    },

    /* ---------------- After the call: the follow-up text ---------------- */

    "kyc-after": {
      kind: "thread",
      app: "sms",
      contact: { name: FOLLOW_UP_NUMBER, subtitle: "Text message" },
      messages: [
        { id: "kyc-missed", from: "system", text: `2 missed calls from ${NUMBER}`, delayMs: 500 },
        {
          id: "kyc-link-sms",
          from: "them",
          delayMs: 1300,
          segments: [
            {
              text: `Dear Customer, your ${BANK} KYC is pending and your A/c will be frozen today. `,
            },
            {
              id: "kyc-link-sms-url",
              text: "Update now: nimbus-kyc-update.example/verify",
              redFlagId: "kyc-link",
            },
          ],
        },
      ],
      choices: [
        { label: "Tap the link and finish the KYC", nextNodeId: "kyc-link-lost" },
        {
          label: "Call the number on the back of my debit card, then report and block this number",
          nextNodeId: "kyc-safe",
        },
        { label: "Ignore it and get on with my day", nextNodeId: "kyc-safe-quiet" },
      ],
    },

    "kyc-after-exposed": {
      kind: "thread",
      app: "sms",
      contact: { name: FOLLOW_UP_NUMBER, subtitle: "Text message" },
      messages: [
        { id: "kyc-missed-2", from: "system", text: `3 missed calls from ${NUMBER}`, delayMs: 500 },
        {
          id: "kyc-exposed-sms",
          from: "them",
          delayMs: 1300,
          segments: [
            {
              id: "kyc-exposed-quote",
              text: "Nimbus Bank: As per A/c 5021 0034 4821 and PAN BXKPN4821Q confirmed by you,",
              redFlagId: "kyc-own-details",
            },
            { text: " your KYC is 90% complete. " },
            {
              id: "kyc-exposed-url",
              text: "Finish now: nimbus-kyc-update.example/verify",
              redFlagId: "kyc-link",
            },
            { text: " or your account will be frozen tonight." },
          ],
        },
      ],
      choices: [
        {
          label: "They already have my details, so it must be real. Tap the link",
          nextNodeId: "kyc-exposed-link-lost",
        },
        {
          label: "Call the bank on the number on my card, report to 1930 and block this number",
          nextNodeId: "kyc-exposed-reported",
        },
        { label: "Ignore it", nextNodeId: "kyc-exposed-quiet" },
      ],
    },

    /* ---------------- Outcomes ---------------- */

    "kyc-lost": {
      kind: "outcome",
      result: "loss",
      title: "₹49,999 gone in a minute",
      body: "The OTP wasn't for a ₹10 fee. It approved a ₹49,999 payment from your account, and the “fee link” was there to make you approve it too. Nobody genuine ever asks you to read out an OTP.",
      moneyDelta: -49999,
      rewindToNodeId: "kyc-otp",
    },
    "kyc-call-lost": {
      kind: "outcome",
      result: "loss",
      title: "₹49,999 gone in a minute",
      body: "Whether it was the OTP you read out or the ₹10 “fee” you paid, you handed over the key: the code approved a ₹49,999 payment from your account. Nobody genuine ever asks you to read out an OTP.",
      moneyDelta: -49999,
      rewindToNodeId: "kyc-call",
    },
    "kyc-link-lost": {
      kind: "outcome",
      result: "loss",
      title: "The link was a copy of the bank's site",
      body: "The page looked like Nimbus Bank's and asked for your card number, expiry and then an OTP. Within minutes, ₹24,600 was spent on your card. KYC is updated in the official app or at the branch, never through a link in a text.",
      moneyDelta: -24600,
      rewindToNodeId: "kyc-after",
    },
    "kyc-exposed-link-lost": {
      kind: "outcome",
      result: "loss",
      title: "Your own details were the bait",
      body: "They quoted your account number and PAN because you gave them out on the call. The link led to a fake bank page that took your card details and an OTP: ₹24,600 gone.",
      moneyDelta: -24600,
      rewindToNodeId: "kyc-after-exposed",
    },
    "kyc-safe": {
      kind: "outcome",
      result: "safe",
      title: "Checked, reported, blocked",
      body: "You called the number on your card: there was no KYC problem. You reported the number on Sanchar Saathi and blocked it. That's the whole playbook: hang up, verify yourself, report.",
    },
    "kyc-safe-quiet": {
      kind: "outcome",
      result: "safe",
      title: "Safe, but they'll call someone else",
      body: "Nothing was lost. But the number is still out there calling people. Reporting it (1930, Sanchar Saathi) and warning your family takes two minutes, and scammers often move down a contact list next.",
    },
    "kyc-exposed-reported": {
      kind: "outcome",
      result: "compromised",
      title: "No money lost, but your details are out",
      body: "You reported it and the bank put a watch on your account. But your PAN and account number are now on a scammer's list, so expect more convincing calls that quote them back to you.",
      rewindToNodeId: "kyc-call",
    },
    "kyc-exposed-quiet": {
      kind: "outcome",
      result: "compromised",
      title: "Nothing taken today",
      body: "Your PAN and account number are out, and the next call will quote them back to you to sound real. Tell your bank and report the number so it can be blocked.",
      rewindToNodeId: "kyc-call",
    },
  },

  redFlags: {
    "kyc-unsolicited": {
      label: "A surprise call from a bank “department”",
      tactic: "impersonation",
      explanation:
        "Banks rarely call out of the blue about KYC, and a name plus a vague “KYC Verification Department” proves nothing. Anyone can say it.",
    },
    "kyc-freeze-deadline": {
      label: "Account frozen in two hours",
      tactic: "urgency",
      explanation:
        "A tight deadline is the alarm, not a reason to act. Real KYC updates come with weeks of notice, in writing and in the app.",
    },
    "kyc-fake-id": {
      label: "An employee ID as proof",
      tactic: "fake-proof",
      explanation:
        "Anyone can make up “NN-48213”, and you can't check it on the call. The only real check is calling the bank yourself.",
    },
    "kyc-senior-transfer": {
      label: "Transfer to a “senior officer”",
      tactic: "authority",
      explanation:
        "The “senior” is someone on the same scam team. Rank and a sterner voice are there to make you obey.",
    },
    "kyc-branch-blocked": {
      label: "The branch “can't do it now”",
      tactic: "blocks-verification",
      explanation:
        "Going to the branch is the safe move, so the caller blocks it. Anyone who talks you out of checking is protecting their scam.",
    },
    "kyc-stay-on-line": {
      label: "Don't disconnect",
      tactic: "blocks-verification",
      explanation:
        "A bank account doesn't lock because a call dropped. Keeping you on the line stops you from calling the real bank.",
    },
    "kyc-confidential": {
      label: "A “confidential process”",
      tactic: "isolation",
      explanation:
        "Secrecy stops you asking family, friends or the bank, who would tell you it's a scam.",
    },
    "kyc-flattery": {
      label: "“You're doing the right thing”",
      tactic: "flattery",
      explanation:
        "Praise keeps you going along. It's there to keep momentum, not because you're doing well.",
    },
    "kyc-asks-details": {
      label: "Asks you to read out DOB, PAN, Aadhaar and account number",
      tactic: "data-harvest",
      explanation:
        "Your bank already has all of this. A caller asking you to read it out is collecting it, for this scam and the next.",
    },
    "kyc-guilt-shift": {
      label: "“It's not my responsibility”",
      tactic: "fear",
      explanation:
        "Guilt-shifting plus a threat: they make the loss feel like your fault so you give in.",
    },
    "kyc-fee": {
      label: "A ₹10 “KYC fee”",
      tactic: "small-ask",
      explanation:
        "There is no KYC fee. A tiny amount feels harmless; it's the hook for a much bigger theft.",
    },
    "kyc-otp-request": {
      label: "Read out the OTP",
      tactic: "secret-code",
      explanation:
        "An OTP approves a transaction. Nobody genuine, not even your own bank, ever asks you to read it out.",
    },
    "kyc-amount-mismatch": {
      label: "The OTP is for ₹49,999, not ₹10",
      tactic: "secret-code",
      explanation:
        "Always read what an OTP is for: this one approves a ₹49,999 payment. The “₹10 fee” was the cover story.",
    },
    "kyc-link": {
      label: "A KYC link in a text",
      tactic: "disguised-link",
      explanation:
        "Banks never ask you to update KYC through a link in a text, and nimbus-kyc-update.example isn't the bank's website.",
    },
    "kyc-own-details": {
      label: "Your own details quoted back",
      tactic: "fake-proof",
      explanation:
        "They know your account number and PAN because you said them on the call. Knowing your details proves nothing.",
    },
  },

  debrief: {
    rule: "Fear, a deadline and a request for details, codes or money on an incoming call: hang up and call your bank yourself.",
    summary:
      "The script runs on psychology, not technology: authority (a bank “department”), urgency (two hours), isolation (don't disconnect, keep it confidential) and escalation (confirm your name → your PAN → a ₹10 fee → the OTP). Each yes makes the next one easier, so the safest moment to stop is the first one.",
    realWorldAction: REAL_WORLD_ACTION,
  },
});
