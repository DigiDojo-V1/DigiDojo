import { defineScenario } from "@/engine/define";
import { BANK, BANK_SENDER, PRIYA, REAL_WORLD_ACTION } from "../content/universe";

/**
 * Simulation 1 of the guide: the fake bank KYC call. A live voice call (an AI plays "Rohan
 * Mehra") with a scripted version of the same call for players without a mic. Both paths end in
 * the scammer's follow-up text, the guide's "hangs up → persistence" row.
 */

const CALLER = { en: "Nimbus Bank KYC", hinglish: "Nimbus Bank KYC" };
const NUMBER = "+91 70000 48213";
const FOLLOW_UP_NUMBER = "+91 70000 51190";
const contact = { name: CALLER, subtitle: NUMBER };

export const kycCall = defineScenario({
  id: "kyc-call",
  dojoId: "authority",
  title: {
    en: "Your KYC expires in 2 hours",
    hinglish: "Tumhara KYC 2 ghante mein expire ho raha hai",
  },
  summary: {
    en: "A “bank officer” calls: your account freezes today unless you verify right now.",
    hinglish:
      "Ek “bank officer” ka call: abhi verify nahi kiya toh aaj hi tumhara account freeze ho jaayega.",
  },
  legit: false,
  primer: {
    title: { en: "The two-hour deadline", hinglish: "Do ghante ki deadline" },
    body: {
      en: "A caller says your KYC is incomplete and your account will freeze today. Listen for what they want from you, and for what happens when you try to check.",
      hinglish:
        "Caller kehta hai ki tumhara KYC incomplete hai aur aaj tumhara account freeze ho jaayega. Dhyaan se suno ki woh tumse kya chahte hain, aur jab tum check karne ki koshish karti ho tab kya hota hai.",
    },
    setup: {
      en: `You're Priya Nair, 20, and you bank with ${BANK}. It's a Tuesday afternoon and an unknown number is calling. If you take the call with your voice, an AI plays the caller: talk to them the way you really would.`,
      hinglish: `Tum Priya Nair ho, 20 saal ki, aur tumhara account ${BANK} mein hai. Tuesday ki dopahar hai aur ek anjaan number se call aa raha hai. Agar tum apni awaaz se call uthati ho, toh caller ka role ek AI play karta hai: unse waise hi baat karo jaise sach mein karti.`,
    },
    watchFor: [
      {
        en: "Who called whom? Could you check this yourself?",
        hinglish: "Call kisne kisko kiya? Kya tum yeh khud check kar sakti ho?",
      },
      {
        en: "What exactly are they asking you to say or do?",
        hinglish: "Woh tumse exactly kya bolne ya karne ko keh rahe hain?",
      },
      {
        en: "What happens when you try to hang up or verify?",
        hinglish: "Jab tum call kaatne ya verify karne ki koshish karti ho, tab kya hota hai?",
      },
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
              text: {
                en: `This is Rohan Mehra from the KYC Verification Department of ${BANK}.`,
                hinglish: `Main Rohan Mehra bol raha hoon, ${BANK} ke KYC Verification Department se.`,
              },
              redFlagId: "kyc-unsolicited",
            },
            {
              text: {
                en: " Am I speaking with Priya Nair?",
                hinglish: " Kya meri baat Priya Nair se ho rahi hai?",
              },
            },
          ],
        },
        {
          id: "kyc-me-yes",
          from: "me",
          text: { en: "Yes, speaking.", hinglish: "Haan, bol rahi hoon." },
          delayMs: 900,
        },
        {
          id: "kyc-urgency",
          from: "them",
          delayMs: 1600,
          segments: [
            {
              text: {
                en: "Ma'am, your KYC is incomplete as per central bank guidelines. ",
                hinglish: "Ma'am, central bank guidelines ke hisaab se aapka KYC incomplete hai. ",
              },
            },
            {
              id: "kyc-urgency-freeze",
              text: {
                en: "Your account will be frozen in two hours, and you won't be able to withdraw or use UPI.",
                hinglish:
                  "Do ghante mein aapka account freeze ho jaayega, aur aap na paise nikaal paayengi na UPI use kar paayengi.",
              },
              redFlagId: "kyc-freeze-deadline",
            },
          ],
        },
      ],
      choices: [
        {
          label: { en: "Oh no! What should I do?", hinglish: "Oh no! Ab main kya karun?" },
          nextNodeId: "kyc-details",
        },
        {
          label: {
            en: "I didn't get any notice from the bank. How do I know you're really from Nimbus?",
            hinglish:
              "Mujhe bank se koi notice nahi aaya. Mujhe kaise pata ki aap sach mein Nimbus se ho?",
          },
          nextNodeId: "kyc-skeptical",
        },
        {
          label: {
            en: "I'll visit my branch and sort it out there.",
            hinglish: "Main apni branch jaake wahin sort kar lungi.",
          },
          nextNodeId: "kyc-branch",
        },
        {
          label: {
            en: "Banks don't call about KYC like this. I'm hanging up.",
            hinglish: "Bank KYC ke liye aise call nahi karte. Main call kaat rahi hoon.",
          },
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
            { text: { en: "Of course, ma'am. ", hinglish: "Bilkul, ma'am. " } },
            {
              id: "kyc-emp-id",
              text: {
                en: "My employee ID is NN-48213.",
                hinglish: "Mera employee ID NN-48213 hai.",
              },
              redFlagId: "kyc-fake-id",
            },
            { text: " " },
            {
              id: "kyc-emp-transfer",
              text: {
                en: "Stay on the line, I'll transfer you to my senior officer.",
                hinglish: "Line pe rahiye, main aapko apne senior officer ko transfer karta hoon.",
              },
              redFlagId: "kyc-senior-transfer",
            },
          ],
        },
        { id: "kyc-hold", from: "system", text: "On hold · 0:14", delayMs: 1200 },
        {
          id: "kyc-senior",
          from: "them",
          sender: { en: "Mr. Kapoor, senior officer", hinglish: "Mr. Kapoor, senior officer" },
          delayMs: 1800,
          text: {
            en: "Kapoor here, senior verification officer. Ma'am, I can see your account in red on my screen. We are trying to help you, but we must verify you in the next few minutes.",
            hinglish:
              "Kapoor bol raha hoon, senior verification officer. Ma'am, meri screen pe aapka account red mein dikh raha hai. Hum aapki help karne ki koshish kar rahe hain, par agle kuch minute mein aapko verify karna zaroori hai.",
          },
        },
      ],
      choices: [
        {
          label: {
            en: "Okay, sir. What do you need from me?",
            hinglish: "Okay, sir. Aapko mujhse kya chahiye?",
          },
          nextNodeId: "kyc-details",
        },
        {
          label: {
            en: "An employee ID proves nothing. I'll call the number on my card myself.",
            hinglish:
              "Employee ID se kuch prove nahi hota. Main khud apne card pe likhe number pe call karungi.",
          },
          nextNodeId: "kyc-pushback",
        },
        {
          label: {
            en: "No thanks. I'm hanging up.",
            hinglish: "No thanks. Main call kaat rahi hoon.",
          },
          nextNodeId: "kyc-after",
          hangUp: true,
        },
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
              text: {
                en: "The branch can't do it now. The system has already flagged you.",
                hinglish:
                  "Branch abhi yeh nahi kar sakti. System ne aapko pehle hi flag kar diya hai.",
              },
              redFlagId: "kyc-branch-blocked",
            },
            {
              text: {
                en: " By evening, your funds will be frozen.",
                hinglish: " Shaam tak aapke funds freeze ho jaayenge.",
              },
            },
          ],
        },
      ],
      choices: [
        {
          label: {
            en: "Fine, let's finish it on the phone then.",
            hinglish: "Theek hai, phir phone pe hi khatam kar lete hain.",
          },
          nextNodeId: "kyc-details",
        },
        {
          label: {
            en: "Then I'll call the bank's official number myself.",
            hinglish: "Toh main khud bank ke official number pe call karungi.",
          },
          nextNodeId: "kyc-pushback",
        },
        {
          label: {
            en: "I'm not doing this on a call. Bye.",
            hinglish: "Main yeh call pe nahi karungi. Bye.",
          },
          nextNodeId: "kyc-after",
          hangUp: true,
        },
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
              text: {
                en: "Ma'am, please don't disconnect. If the call drops, your account will be locked.",
                hinglish:
                  "Ma'am, please call disconnect mat kariye. Call drop hua toh aapka account lock ho jaayega.",
              },
              redFlagId: "kyc-stay-on-line",
            },
            { text: " " },
            {
              id: "kyc-close-secret",
              text: {
                en: "And don't share this with anyone, it's a confidential process.",
                hinglish: "Aur yeh kisi se share mat kariye, yeh ek confidential process hai.",
              },
              redFlagId: "kyc-confidential",
            },
          ],
        },
      ],
      choices: [
        {
          label: {
            en: "Okay, okay. I'll stay on the line.",
            hinglish: "Okay, okay. Main line pe hoon.",
          },
          nextNodeId: "kyc-details",
        },
        {
          label: {
            en: "No. I'm hanging up and calling my bank myself.",
            hinglish: "Nahi. Main call kaat ke khud apne bank ko call karti hoon.",
          },
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
              text: {
                en: "Thank you for cooperating, ma'am. You're doing the right thing.",
                hinglish:
                  "Cooperate karne ke liye thank you, ma'am. Aap bilkul sahi kar rahi hain.",
              },
              redFlagId: "kyc-flattery",
            },
            {
              text: {
                en: " Just a few more details and it's done.",
                hinglish: " Bas thodi si aur details, phir ho gaya.",
              },
            },
          ],
        },
        {
          id: "kyc-ask",
          from: "them",
          delayMs: 1500,
          segments: [
            { text: { en: "To verify you, ", hinglish: "Aapko verify karne ke liye, " } },
            {
              id: "kyc-ask-list",
              text: {
                en: "please confirm your full name, date of birth, PAN number, the last four digits of your Aadhaar, and your account number.",
                hinglish:
                  "please apna poora naam, date of birth, PAN number, Aadhaar ke last four digits, aur account number confirm kariye.",
              },
              redFlagId: "kyc-asks-details",
            },
          ],
        },
      ],
      choices: [
        {
          label: {
            en: "Okay: Priya Nair, 14 March 2006, PAN BXKPN4821Q, Aadhaar ending 7319, account 5021 0034 4821.",
            hinglish:
              "Okay: Priya Nair, 14 March 2006, PAN BXKPN4821Q, Aadhaar ke last digits 7319, account 5021 0034 4821.",
          },
          nextNodeId: "kyc-otp",
        },
        {
          label: {
            en: "Why would my own bank need me to read out my account number? This is a scam.",
            hinglish:
              "Mere apne bank ko mujhse mera account number padhwane ki kya zaroorat? Yeh scam hai.",
          },
          nextNodeId: "kyc-angry",
        },
        {
          label: {
            en: "I won't share that on a call. Bye.",
            hinglish: "Main yeh call pe share nahi karungi. Bye.",
          },
          nextNodeId: "kyc-after",
          hangUp: true,
        },
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
            {
              text: {
                en: "Ma'am, I understand your frustration, but I'm trying to save your account. ",
                hinglish:
                  "Ma'am, main aapki frustration samajhta hoon, par main aapka account bachane ki koshish kar raha hoon. ",
              },
            },
            {
              id: "kyc-guilt-blame",
              text: {
                en: "If it gets blocked, it's not my responsibility.",
                hinglish: "Agar block ho gaya, toh meri responsibility nahi hai.",
              },
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
        {
          label: {
            en: "Then I'll take that risk. Goodbye.",
            hinglish: "Toh woh risk main le lungi. Goodbye.",
          },
          nextNodeId: "kyc-after",
          hangUp: true,
        },
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
            {
              text: {
                en: "Perfect, ma'am, verified. ",
                hinglish: "Perfect, ma'am, verify ho gaya. ",
              },
            },
            {
              id: "kyc-fee-small",
              text: {
                en: "Your KYC will be updated after a small re-verification fee of ₹10. I'm sending a payment link.",
                hinglish:
                  "₹10 ki chhoti si re-verification fee ke baad aapka KYC update ho jaayega. Main payment link bhej raha hoon.",
              },
              redFlagId: "kyc-fee",
            },
            { text: " " },
            {
              id: "kyc-fee-otp",
              text: {
                en: "You will also receive an OTP. Please read it out so I can authenticate it.",
                hinglish:
                  "Aapko ek OTP bhi aayega. Please use padh ke sunaiye taaki main authenticate kar sakoon.",
              },
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
          text: {
            en: "Quickly please, ma'am, the OTP is only valid for three minutes.",
            hinglish: "Jaldi please, ma'am, OTP sirf teen minute ke liye valid hai.",
          },
        },
      ],
      choices: [
        {
          label: {
            en: "Read out the OTP: 4-8-2-9-1-3.",
            hinglish: "OTP padh ke sunao: 4-8-2-9-1-3.",
          },
          nextNodeId: "kyc-lost",
        },
        {
          label: {
            en: "Pay the ₹10 through the link instead.",
            hinglish: "Uski jagah link se ₹10 pay karo.",
          },
          nextNodeId: "kyc-lost",
        },
        {
          label: {
            en: "OTP for what? That sounds odd. I'm hanging up.",
            hinglish: "OTP kis cheez ka? Yeh ajeeb lag raha hai. Main call kaat rahi hoon.",
          },
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
        {
          label: {
            en: "Tap the link and finish the KYC",
            hinglish: "Link pe tap karke KYC poora karo",
          },
          nextNodeId: "kyc-link-lost",
        },
        {
          label: {
            en: "Call the number on the back of my debit card, then report and block this number",
            hinglish:
              "Debit card ke peeche wale number pe call karo, phir is number ko report aur block karo",
          },
          nextNodeId: "kyc-safe",
        },
        {
          label: {
            en: "Ignore it and get on with my day",
            hinglish: "Ignore karo aur apne kaam mein lag jao",
          },
          nextNodeId: "kyc-safe-quiet",
        },
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
          label: {
            en: "They already have my details, so it must be real. Tap the link",
            hinglish: "Inke paas pehle se meri details hain, toh asli hi hoga. Link pe tap karo",
          },
          nextNodeId: "kyc-exposed-link-lost",
        },
        {
          label: {
            en: "Call the bank on the number on my card, report to 1930 and block this number",
            hinglish:
              "Card pe likhe number se bank ko call karo, 1930 pe report karo aur is number ko block karo",
          },
          nextNodeId: "kyc-exposed-reported",
        },
        { label: { en: "Ignore it", hinglish: "Ignore karo" }, nextNodeId: "kyc-exposed-quiet" },
      ],
    },

    /* ---------------- Outcomes ---------------- */

    "kyc-lost": {
      kind: "outcome",
      result: "loss",
      title: { en: "₹49,999 gone in a minute", hinglish: "Ek minute mein ₹49,999 gaye" },
      body: {
        en: "The OTP wasn't for a ₹10 fee. It approved a ₹49,999 payment from your account, and the “fee link” was there to make you approve it too. Nobody genuine ever asks you to read out an OTP.",
        hinglish:
          "OTP ₹10 ki fee ke liye nahi tha. Usne tumhare account se ₹49,999 ki payment approve kar di, aur “fee link” bhi isi liye tha ki tum woh bhi approve kar do. Koi genuine insaan kabhi OTP padh ke sunane ko nahi kehta.",
      },
      moneyDelta: -49999,
      rewindToNodeId: "kyc-otp",
    },
    "kyc-call-lost": {
      kind: "outcome",
      result: "loss",
      title: { en: "₹49,999 gone in a minute", hinglish: "Ek minute mein ₹49,999 gaye" },
      body: {
        en: "Whether it was the OTP you read out or the ₹10 “fee” you paid, you handed over the key: the code approved a ₹49,999 payment from your account. Nobody genuine ever asks you to read out an OTP.",
        hinglish:
          "Chahe tumne OTP padh ke sunaya ho ya ₹10 ki “fee” bhari ho, tumne chaabi de di: us code ne tumhare account se ₹49,999 ki payment approve kar di. Koi genuine insaan kabhi OTP padh ke sunane ko nahi kehta.",
      },
      moneyDelta: -49999,
      rewindToNodeId: "kyc-call",
    },
    "kyc-link-lost": {
      kind: "outcome",
      result: "loss",
      title: {
        en: "The link was a copy of the bank's site",
        hinglish: "Link bank ki site ki copy thi",
      },
      body: {
        en: "The page looked like Nimbus Bank's and asked for your card number, expiry and then an OTP. Within minutes, ₹24,600 was spent on your card. KYC is updated in the official app or at the branch, never through a link in a text.",
        hinglish:
          "Page Nimbus Bank jaisa dikhta tha aur usne tumhara card number, expiry aur phir OTP maanga. Kuch hi minute mein tumhare card se ₹24,600 kharch ho gaye. KYC official app mein ya branch mein update hota hai, kabhi text ke link se nahi.",
      },
      moneyDelta: -24600,
      rewindToNodeId: "kyc-after",
    },
    "kyc-exposed-link-lost": {
      kind: "outcome",
      result: "loss",
      title: {
        en: "Your own details were the bait",
        hinglish: "Tumhari apni details hi chaara bani",
      },
      body: {
        en: "They quoted your account number and PAN because you gave them out on the call. The link led to a fake bank page that took your card details and an OTP: ₹24,600 gone.",
        hinglish:
          "Unhone tumhara account number aur PAN isliye bataya kyunki tumne call pe khud diye the. Link ek fake bank page pe le gaya jisne tumhare card details aur OTP le liye: ₹24,600 gaye.",
      },
      moneyDelta: -24600,
      rewindToNodeId: "kyc-after-exposed",
    },
    "kyc-safe": {
      kind: "outcome",
      result: "safe",
      title: { en: "Checked, reported, blocked", hinglish: "Check kiya, report kiya, block kiya" },
      body: {
        en: "You called the number on your card: there was no KYC problem. You reported the number on Sanchar Saathi and blocked it. That's the whole playbook: hang up, verify yourself, report.",
        hinglish:
          "Tumne card pe likhe number pe call kiya: koi KYC problem nahi thi. Tumne number ko Sanchar Saathi pe report karke block kar diya. Yahi poora playbook hai: call kaato, khud verify karo, report karo.",
      },
    },
    "kyc-safe-quiet": {
      kind: "outcome",
      result: "safe",
      title: {
        en: "Safe, but they'll call someone else",
        hinglish: "Safe, par ab woh kisi aur ko call karenge",
      },
      body: {
        en: "Nothing was lost. But the number is still out there calling people. Reporting it (1930, Sanchar Saathi) and warning your family takes two minutes, and scammers often move down a contact list next.",
        hinglish:
          "Kuch nahi gaya. Par woh number abhi bhi logon ko call kar raha hai. Use report karne (1930, Sanchar Saathi) aur family ko warn karne mein do minute lagte hain, aur scammers aksar contact list mein agle insaan pe chale jaate hain.",
      },
    },
    "kyc-exposed-reported": {
      kind: "outcome",
      result: "compromised",
      title: {
        en: "No money lost, but your details are out",
        hinglish: "Paisa nahi gaya, par tumhari details leak ho gayi",
      },
      body: {
        en: "You reported it and the bank put a watch on your account. But your PAN and account number are now on a scammer's list, so expect more convincing calls that quote them back to you.",
        hinglish:
          "Tumne report kiya aur bank ne tumhare account pe nazar rakhni shuru kar di. Par tumhara PAN aur account number ab ek scammer ki list mein hai, toh aur bhi asli lagne wale calls ke liye ready raho jo yeh details tumhe hi suna denge.",
      },
      rewindToNodeId: "kyc-call",
    },
    "kyc-exposed-quiet": {
      kind: "outcome",
      result: "compromised",
      title: { en: "Nothing taken today", hinglish: "Aaj kuch nahi gaya" },
      body: {
        en: "Your PAN and account number are out, and the next call will quote them back to you to sound real. Tell your bank and report the number so it can be blocked.",
        hinglish:
          "Tumhara PAN aur account number leak ho chuka hai, aur agla call asli lagne ke liye yahi tumhe suna dega. Apne bank ko batao aur number report karo taaki woh block ho sake.",
      },
      rewindToNodeId: "kyc-call",
    },
  },

  redFlags: {
    "kyc-unsolicited": {
      label: {
        en: "A surprise call from a bank “department”",
        hinglish: "Bank ke kisi “department” se achanak call",
      },
      tactic: "impersonation",
      explanation: {
        en: "Banks rarely call out of the blue about KYC, and a name plus a vague “KYC Verification Department” proves nothing. Anyone can say it.",
        hinglish:
          "Bank KYC ke liye shayad hi kabhi achanak call karte hain, aur ek naam plus gol-mol “KYC Verification Department” se kuch prove nahi hota. Yeh koi bhi bol sakta hai.",
      },
    },
    "kyc-freeze-deadline": {
      label: { en: "Account frozen in two hours", hinglish: "Do ghante mein account freeze" },
      tactic: "urgency",
      explanation: {
        en: "A tight deadline is the alarm, not a reason to act. Real KYC updates come with weeks of notice, in writing and in the app.",
        hinglish:
          "Tight deadline khud ek alarm hai, jaldi karne ki wajah nahi. Asli KYC updates ka notice hafton pehle, likh ke aur app mein aata hai.",
      },
    },
    "kyc-fake-id": {
      label: { en: "An employee ID as proof", hinglish: "Saboot ke naam pe employee ID" },
      tactic: "fake-proof",
      explanation: {
        en: "Anyone can make up “NN-48213”, and you can't check it on the call. The only real check is calling the bank yourself.",
        hinglish:
          "“NN-48213” koi bhi bana sakta hai, aur call pe tum use check nahi kar sakte. Asli check sirf ek hai: khud bank ko call karna.",
      },
    },
    "kyc-senior-transfer": {
      label: {
        en: "Transfer to a “senior officer”",
        hinglish: "Kisi “senior officer” ko transfer",
      },
      tactic: "authority",
      explanation: {
        en: "The “senior” is someone on the same scam team. Rank and a sterner voice are there to make you obey.",
        hinglish:
          "“Senior” usi scam team ka koi aur hai. Bada rank aur sakht awaaz isliye hai taaki tum baat maan lo.",
      },
    },
    "kyc-branch-blocked": {
      label: { en: "The branch “can't do it now”", hinglish: "Branch “abhi nahi kar sakti”" },
      tactic: "blocks-verification",
      explanation: {
        en: "Going to the branch is the safe move, so the caller blocks it. Anyone who talks you out of checking is protecting their scam.",
        hinglish:
          "Branch jaana safe kadam hai, isliye caller use rokta hai. Jo bhi tumhe check karne se roke, woh apna scam bacha raha hai.",
      },
    },
    "kyc-stay-on-line": {
      label: { en: "Don't disconnect", hinglish: "Call disconnect mat karo" },
      tactic: "blocks-verification",
      explanation: {
        en: "A bank account doesn't lock because a call dropped. Keeping you on the line stops you from calling the real bank.",
        hinglish:
          "Call drop hone se bank account lock nahi hota. Tumhe line pe rakhne se tum asli bank ko call nahi kar paate.",
      },
    },
    "kyc-confidential": {
      label: { en: "A “confidential process”", hinglish: "Ek “confidential process”" },
      tactic: "isolation",
      explanation: {
        en: "Secrecy stops you asking family, friends or the bank, who would tell you it's a scam.",
        hinglish:
          "Secret rakhne se tum family, dosto ya bank se nahi poochte, jo tumhe bata dete ki yeh scam hai.",
      },
    },
    "kyc-flattery": {
      label: { en: "“You're doing the right thing”", hinglish: "“Aap bilkul sahi kar rahi hain”" },
      tactic: "flattery",
      explanation: {
        en: "Praise keeps you going along. It's there to keep momentum, not because you're doing well.",
        hinglish:
          "Tareef tumhe unke saath chalate rehne ke liye hai. Yeh momentum banaye rakhne ke liye hai, isliye nahi ki tum achha kar rahe ho.",
      },
    },
    "kyc-asks-details": {
      label: {
        en: "Asks you to read out DOB, PAN, Aadhaar and account number",
        hinglish: "DOB, PAN, Aadhaar aur account number padh ke sunane ko kehta hai",
      },
      tactic: "data-harvest",
      explanation: {
        en: "Your bank already has all of this. A caller asking you to read it out is collecting it, for this scam and the next.",
        hinglish:
          "Tumhare bank ke paas yeh sab pehle se hai. Jo caller tumse yeh padhwata hai, woh ise ikattha kar raha hai, is scam ke liye aur agle ke liye bhi.",
      },
    },
    "kyc-guilt-shift": {
      label: { en: "“It's not my responsibility”", hinglish: "“Meri responsibility nahi hai”" },
      tactic: "fear",
      explanation: {
        en: "Guilt-shifting plus a threat: they make the loss feel like your fault so you give in.",
        hinglish:
          "Guilt tum pe daalna plus dhamki: nuksaan tumhari galti jaisa lagwate hain taaki tum haar maan lo.",
      },
    },
    "kyc-fee": {
      label: { en: "A ₹10 “KYC fee”", hinglish: "₹10 ki “KYC fee”" },
      tactic: "small-ask",
      explanation: {
        en: "There is no KYC fee. A tiny amount feels harmless; it's the hook for a much bigger theft.",
        hinglish:
          "KYC ki koi fee nahi hoti. Chhoti si amount harmless lagti hai; yeh bahut badi chori ka kaanta hai.",
      },
    },
    "kyc-otp-request": {
      label: { en: "Read out the OTP", hinglish: "OTP padh ke sunao" },
      tactic: "secret-code",
      explanation: {
        en: "An OTP approves a transaction. Nobody genuine, not even your own bank, ever asks you to read it out.",
        hinglish:
          "OTP ek transaction approve karta hai. Koi genuine insaan, tumhara apna bank bhi, kabhi ise padh ke sunane ko nahi kehta.",
      },
    },
    "kyc-amount-mismatch": {
      label: { en: "The OTP is for ₹49,999, not ₹10", hinglish: "OTP ₹49,999 ka hai, ₹10 ka nahi" },
      tactic: "secret-code",
      explanation: {
        en: "Always read what an OTP is for: this one approves a ₹49,999 payment. The “₹10 fee” was the cover story.",
        hinglish:
          "Hamesha padho ki OTP kis cheez ke liye hai: yeh wala ₹49,999 ki payment approve karta hai. “₹10 fee” toh bas bahana thi.",
      },
    },
    "kyc-link": {
      label: { en: "A KYC link in a text", hinglish: "Text mein KYC ka link" },
      tactic: "disguised-link",
      explanation: {
        en: "Banks never ask you to update KYC through a link in a text, and nimbus-kyc-update.example isn't the bank's website.",
        hinglish:
          "Bank kabhi text ke link se KYC update karne ko nahi kehte, aur nimbus-kyc-update.example bank ki website nahi hai.",
      },
    },
    "kyc-own-details": {
      label: {
        en: "Your own details quoted back",
        hinglish: "Tumhari hi details tumhe sunayi gayi",
      },
      tactic: "fake-proof",
      explanation: {
        en: "They know your account number and PAN because you said them on the call. Knowing your details proves nothing.",
        hinglish:
          "Unhe tumhara account number aur PAN isliye pata hai kyunki tumne call pe bataya tha. Tumhari details jaanne se kuch prove nahi hota.",
      },
    },
  },

  debrief: {
    rule: {
      en: "Fear, a deadline and a request for details, codes or money on an incoming call: hang up and call your bank yourself.",
      hinglish:
        "Aaye hue call pe darr, deadline aur details, codes ya paison ki maang: call kaato aur khud apne bank ko call karo.",
    },
    summary: {
      en: "The script runs on psychology, not technology: authority (a bank “department”), urgency (two hours), isolation (don't disconnect, keep it confidential) and escalation (confirm your name → your PAN → a ₹10 fee → the OTP). Each yes makes the next one easier, so the safest moment to stop is the first one.",
      hinglish:
        "Yeh script technology pe nahi, psychology pe chalti hai: authority (bank ka “department”), urgency (do ghante), isolation (disconnect mat karo, confidential rakho) aur escalation (naam confirm karo → PAN → ₹10 fee → OTP). Har haan agli haan ko aasaan banati hai, isliye rukne ka sabse safe waqt pehla hi hai.",
    },
    realWorldAction: REAL_WORLD_ACTION,
  },
});
