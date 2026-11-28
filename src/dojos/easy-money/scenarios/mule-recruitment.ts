import { defineScenario } from "@/engine/define";
import { pickPanels } from "../content/evidence";
import { pickRedFlags } from "../content/red-flags";

/**
 * Money mule: an Instagram "payments gig" that rents your bank account.
 * Source: docs/scenarios/easy-money/mule-recruitment.md.
 */
const vikramInsta = {
  name: { en: "Vikram | EasyEarn Hub", hinglish: "Vikram | EasyEarn Hub" },
  subtitle: "Active now",
  avatar: "/dojos/easy-money/vikram.jpg",
};
const vikramWa = {
  name: { en: "Vikram EasyEarn", hinglish: "Vikram EasyEarn" },
  subtitle: "online",
  avatar: "/dojos/easy-money/vikram.jpg",
};

export const muleRecruitment = defineScenario({
  id: "mule-recruitment",
  dojoId: "easy-money",
  title: { en: "Rent your account", hinglish: "Apna account kiraye pe do" },
  summary: {
    en: "An Instagram “payments gig” pays you to receive and forward money. Easy cash or a trap?",
    hinglish:
      "Ek Instagram “payments gig” paise receive karke aage bhejne ke paise deta hai. Aasaan kamai ya jaal?",
  },
  legit: false,
  primer: {
    title: { en: "Rent your account", hinglish: "Apna account kiraye pe do" },
    body: {
      en: "Some “jobs” don't want your time. They want your bank account, so stolen money can move through your name instead of theirs. Watch what they actually ask you for.",
      hinglish:
        "Kuch “jobs” ko tumhara time nahi chahiye. Unhe tumhara bank account chahiye, taaki chori ka paisa unke naam ki jagah tumhare naam se ghoome. Dekho woh asal mein tumse kya maang rahe hain.",
    },
    setup: {
      en: "You're Rohan, a second-year B.Com student. Your semester fee instalment is due next week, so you commented “interested” on an Instagram reel about earning from your phone.",
      hinglish:
        "Tum Rohan ho, B.Com second year ke student. Agle hafte semester fee ki instalment bharni hai, isliye tumne phone se kamai wali ek Instagram reel pe “interested” comment kar diya.",
    },
  },
  startNodeId: "insta-dm",

  nodes: {
    "insta-dm": {
      kind: "thread",
      app: "instagram",
      contact: vikramInsta,
      messages: [
        {
          id: "mule-hello",
          from: "them",
          delayMs: 1000,
          text: {
            en: "Hey Rohan! Saw your comment on our reel 🙌",
            hinglish: "Hey Rohan! Humari reel pe tumhara comment dekha 🙌",
          },
        },
        {
          id: "mule-gig",
          from: "them",
          delayMs: 1300,
          segments: [
            {
              text: {
                en: "We have a payments side gig for college students. ",
                hinglish: "College students ke liye humare paas ek payments side gig hai. ",
              },
            },
            {
              id: "mule-gig-pay",
              text: {
                en: "10 min a day from your phone, students are making ₹5,000-₹10,000 a month",
                hinglish:
                  "Phone se bas din ke 10 min, students mahine ke ₹5,000-₹10,000 kama rahe hain",
              },
              redFlagId: "easy-commission",
            },
          ],
        },
        {
          id: "mule-work",
          from: "them",
          delayMs: 1500,
          segments: [
            { text: { en: "Work is simple: ", hinglish: "Kaam simple hai: " } },
            {
              id: "mule-work-forward",
              text: {
                en: "our clients pay into your bank account, you transfer it to our company account same day",
                hinglish:
                  "humare clients tumhare bank account mein pay karenge, tum usi din humare company account mein transfer kar dena",
              },
              redFlagId: "rent-your-account",
            },
            {
              text: {
                en: ". You keep 10% as commission 💸",
                hinglish: ". 10% commission tumhara 💸",
              },
            },
          ],
        },
        {
          id: "mule-zero",
          from: "them",
          text: {
            en: "Zero investment. Interested?",
            hinglish: "Zero investment. Interested ho?",
          },
        },
      ],
      evidence: ["vikram-profile"],
      choices: [
        {
          label: {
            en: "Sounds easy. How do I start?",
            hinglish: "Aasaan lag raha hai. Shuru kaise karun?",
          },
          nextNodeId: "wa-setup",
        },
        {
          label: {
            en: "Why can't your company take the payments in its own account?",
            hinglish: "Tumhari company apne hi account mein payments kyun nahi le sakti?",
          },
          nextNodeId: "insta-why",
        },
        {
          label: {
            en: "Not interested. Block the account",
            hinglish: "Interested nahi. Account block karo",
          },
          nextNodeId: "safe-early",
        },
      ],
    },

    "insta-why": {
      kind: "thread",
      app: "instagram",
      // Same app and contact as `insta-dm`, so the chat carries on.
      contact: vikramInsta,
      messages: [
        {
          id: "why-gst",
          from: "them",
          delayMs: 1300,
          text: {
            en: "Company account has GST limits bro, so we split payments across student accounts 🙂",
            hinglish:
              "Company account pe GST limits hain bro, isliye hum payments student accounts mein baant dete hain 🙂",
          },
        },
        {
          id: "why-others",
          from: "them",
          delayMs: 1300,
          text: {
            en: "200+ students from colleges here already do it. My own cousin made ₹9k last month",
            hinglish:
              "Yahan ke colleges ke 200+ students pehle se kar rahe hain. Mere apne cousin ne pichle mahine ₹9k kamaye",
          },
          redFlagId: "others-do-it",
        },
        {
          id: "why-whatsapp",
          from: "them",
          delayMs: 1200,
          text: {
            en: "Insta keeps flagging payment chats, let's continue on WhatsApp. Pinging you from +91 90000 54321",
            hinglish:
              "Insta payment chats ko flag karta rehta hai, WhatsApp pe baat karte hain. +91 90000 54321 se ping kar raha hoon",
          },
        },
      ],
      evidence: ["vikram-profile"],
      choices: [
        {
          label: {
            en: "Fine, let's continue on WhatsApp",
            hinglish: "Theek hai, WhatsApp pe baat karte hain",
          },
          nextNodeId: "wa-setup",
        },
        {
          label: {
            en: "That doesn't add up. Block and report the account",
            hinglish: "Yeh baat jam nahi rahi. Account block aur report karo",
          },
          nextNodeId: "safe-early",
        },
      ],
    },

    "wa-setup": {
      kind: "thread",
      app: "whatsapp",
      contact: vikramWa,
      messages: [
        {
          id: "wa-inert",
          from: "system",
          delayMs: 300,
          text: {
            en: "Simulated chat. This number can't be called or messaged.",
            hinglish: "Simulated chat hai. Is number pe call ya message nahi ho sakta.",
          },
        },
        {
          id: "wa-welcome",
          from: "them",
          delayMs: 1000,
          text: {
            en: "Hey it's Vikram from EasyEarn 👋 Welcome to the team bro",
            hinglish: "Hey, main Vikram, EasyEarn se 👋 Team mein welcome bro",
          },
        },
        {
          id: "wa-kit",
          from: "them",
          delayMs: 1600,
          segments: [
            {
              text: {
                en: "To activate your account I need ",
                hinglish: "Tumhara account activate karne ke liye mujhe chahiye ",
              },
            },
            {
              id: "wa-kit-details",
              text: {
                en: "your account number + IFSC, photo of your ATM card front and back with the PIN, and your net banking login",
                hinglish:
                  "tumhara account number + IFSC, ATM card ke front aur back ki photo PIN ke saath, aur tumhara net banking login",
              },
              redFlagId: "account-kit",
            },
            {
              text: {
                en: " so our system can track payments",
                hinglish: ", taaki humara system payments track kar sake",
              },
            },
          ],
        },
        {
          id: "wa-safe",
          from: "them",
          text: {
            en: "All safe bro, only for verification ✅",
            hinglish: "Sab safe hai bro, bas verification ke liye ✅",
          },
        },
      ],
      choices: [
        {
          label: {
            en: "Okay, sending everything now 👍",
            hinglish: "Okay, abhi sab bhej raha hoon 👍",
          },
          nextNodeId: "wa-first-job",
        },
        {
          label: {
            en: "No way. I'm not sharing my PIN or login",
            hinglish: "Bilkul nahi. Main apna PIN ya login share nahi karunga",
          },
          nextNodeId: "safe-mid",
        },
      ],
    },

    "wa-first-job": {
      kind: "thread",
      app: "whatsapp",
      contact: vikramWa,
      messages: [
        {
          id: "job-bonus",
          from: "system",
          delayMs: 1200,
          text: "₹500 credited to your account. Ref: JOINING BONUS",
          redFlagId: "joining-bonus",
        },
        {
          id: "job-client-next",
          from: "them",
          text: {
            en: "Bonus received? 😎 First client payment coming now",
            hinglish: "Bonus mil gaya? 😎 Ab pehla client payment aa raha hai",
          },
        },
        {
          id: "job-credit",
          from: "system",
          delayMs: 1500,
          text: "₹48,000 credited to your account from R SURESH KUMAR",
        },
        {
          id: "job-forward",
          from: "them",
          delayMs: 1200,
          text: {
            en: "Transfer ₹43,200 to vkstraders@paynest in the next 15 minutes, keep ₹4,800 for yourself 🤑",
            hinglish:
              "Agle 15 minute mein ₹43,200 vkstraders@paynest pe transfer karo, ₹4,800 tumhare 🤑",
          },
          redFlagId: "move-it-fast",
        },
        {
          id: "job-quiet",
          from: "them",
          delayMs: 1300,
          text: {
            en: "And don't tell anyone at home or the bank about this work, our clients want privacy 🤫",
            hinglish:
              "Aur is kaam ke baare mein ghar pe ya bank mein kisi ko mat batana, humare clients ko privacy chahiye 🤫",
          },
          redFlagId: "keep-it-quiet",
        },
      ],
      choices: [
        {
          label: {
            en: "Transfer ₹43,200 and keep ₹4,800",
            hinglish: "₹43,200 transfer karo aur ₹4,800 rakh lo",
          },
          nextNodeId: "mule-caught",
        },
        {
          label: {
            en: "Don't move it. Call the bank and 1930 now",
            hinglish: "Paise aage mat bhejo. Abhi bank aur 1930 pe call karo",
          },
          nextNodeId: "reported",
        },
      ],
    },

    "safe-early": {
      kind: "outcome",
      result: "safe",
      title: {
        en: "You didn't rent out your account",
        hinglish: "Tumne apna account kiraye pe nahi diya",
      },
      body: {
        en: "A gig that pays you to receive and forward other people's money is money-mule recruitment. You walked away before they had anything of yours.",
        hinglish:
          "Jo gig dusron ke paise receive karke aage bhejne ke paise de, woh money-mule recruitment hai. Unke haath tumhara kuch bhi lagne se pehle tum nikal gaye.",
      },
    },
    "safe-mid": {
      kind: "outcome",
      result: "safe",
      title: { en: "Your account stayed yours", hinglish: "Tumhara account tumhara hi raha" },
      body: {
        en: "You refused to hand over your card, PIN and login. Block the number and report the Instagram account so they can't recruit your classmates.",
        hinglish:
          "Tumne apna card, PIN aur login dene se mana kar diya. Number block karo aur Instagram account report karo, taaki woh tumhare classmates ko recruit na kar sakein.",
      },
    },
    "mule-caught": {
      kind: "outcome",
      result: "compromised",
      title: { en: "Your account is frozen", hinglish: "Tumhara account freeze ho gaya" },
      body: {
        en: "The ₹48,000 was a task-scam victim's money. Their 1930 complaint led straight to your account: the bank froze it with your fee money inside, and police named you in the case. The ₹4,800 was never yours to keep.",
        hinglish:
          "Woh ₹48,000 ek task-scam victim ke paise the. Unki 1930 complaint seedha tumhare account tak pahunchi: bank ne tumhari fee ke paison samet account freeze kar diya, aur police ne case mein tumhara naam daal diya. Woh ₹4,800 kabhi tumhare the hi nahi.",
      },
      rewindToNodeId: "wa-first-job",
    },
    reported: {
      kind: "outcome",
      result: "compromised",
      title: {
        en: "You stopped the money, not the damage",
        hinglish: "Paisa ruk gaya, nuksaan nahi",
      },
      body: {
        en: "You didn't pass the ₹48,000 on and reported it within the hour, so the victim could get it back. But they still had your card, PIN and login: your account stayed frozen for weeks while you gave a statement and got a new card.",
        hinglish:
          "Tumne ₹48,000 aage nahi bheje aur ghante bhar mein report kar diya, toh victim ko paisa wapas mil saka. Par unke paas ab bhi tumhara card, PIN aur login tha: hafton tak tumhara account frozen raha, jab tak tumne statement diya aur naya card banwaya.",
      },
      rewindToNodeId: "wa-setup",
    },
  },

  evidence: pickPanels(["vikram-profile"]),
  redFlags: pickRedFlags([
    "easy-commission",
    "rent-your-account",
    "others-do-it",
    "account-kit",
    "joining-bonus",
    "move-it-fast",
    "keep-it-quiet",
    "renamed-account",
  ]),

  debrief: {
    rule: {
      en: "If a “job” needs your bank account more than your time, you're being recruited as a money mule.",
      hinglish:
        "Agar kisi “job” ko tumhare time se zyada tumhara bank account chahiye, toh tumhe money mule banaya ja raha hai.",
    },
    summary: {
      en: "Mule recruiters don't want your work. They need an account in someone else's name so stolen money can pass through it. The pay looks easy because the risk is all yours: when a victim reports the fraud, the trail ends at your account, which gets frozen, and police can name you as an accused. A real company collects payments in its own account and never asks for your ATM card, PIN or net banking login.",
      hinglish:
        "Mule recruiters ko tumhara kaam nahi chahiye. Unhe kisi aur ke naam ka account chahiye, jisse chori ka paisa guzar sake. Pay aasaan isliye lagta hai kyunki saara risk tumhara hai: jab victim fraud report karta hai, toh trail tumhare account pe khatam hota hai, account freeze hota hai, aur police tumhe accused bana sakti hai. Asli company payments apne hi account mein leti hai aur kabhi tumhara ATM card, PIN ya net banking login nahi maangti.",
    },
    realWorldAction: {
      en: "Shared your account details? Call your bank to block the card and net banking, don't move any money that lands in your account, then call 1930 and report at cybercrime.gov.in.",
      hinglish:
        "Account details share kar di? Card aur net banking block karwane ke liye apne bank ko call karo, account mein jo bhi paisa aaye use aage mat bhejo, phir 1930 pe call karo aur cybercrime.gov.in pe report karo.",
    },
  },
});
