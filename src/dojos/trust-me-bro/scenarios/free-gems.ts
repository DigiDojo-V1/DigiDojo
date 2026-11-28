import { defineScenario } from "@/engine/define";

/**
 * Free in-game currency → fake login page → account takeover. A "rewards" account DMs a
 * gamer about a free anniversary drop. Script: docs/scenarios/trust-me-bro/free-gems.md.
 * The game, the account and every domain are fictional.
 */

const REWARDS = {
  name: { en: "skyfall.arena.rewardz", hinglish: "skyfall.arena.rewardz" },
  subtitle: "Active now",
};

export const freeGems = defineScenario({
  id: "free-gems",
  dojoId: "trust-me-bro",
  title: { en: "2,000 free Gems", hinglish: "2,000 free Gems" },
  summary: {
    en: "A rewards account offers free Gems and a rare skin. Claim it or check first?",
    hinglish:
      "Ek rewards account free Gems aur ek rare skin de raha hai. Claim karoge ya pehle check?",
  },
  image: "/dojos/trust-me-bro/free-gems.jpg",
  legit: false,
  primer: {
    title: { en: "The free-reward login trap", hinglish: "Free reward wala login trap" },
    body: {
      en: "Free coins, skins or passes are the bait. The claim link opens a page that looks like your game's login, and whatever you type there, including the code the game texts you, goes straight to the scammer.",
      hinglish:
        "Free coins, skins ya passes chaara hain. Claim link ek aisa page kholta hai jo tumhare game ke login jaisa dikhta hai, aur wahan jo bhi type karoge, game ka text kiya hua code bhi, seedha scammer ke paas jaata hai.",
    },
    setup: {
      en: "You've played Skyfall Arena every day for two years and your account has rare skins. An account you don't follow sends you a DM.",
      hinglish:
        "Tum do saal se roz Skyfall Arena khel rahe ho aur tumhare account mein rare skins hain. Ek account jise tum follow nahi karte, tumhe DM bhejta hai.",
    },
    watchFor: [
      { en: "Who is this account, really?", hinglish: "Yeh account asal mein hai kaun?" },
      { en: "Where would a real reward show up?", hinglish: "Asli reward kahan dikhta?" },
      {
        en: "Why would anyone need my login or code to give me something?",
        hinglish: "Mujhe kuch dene ke liye kisi ko mera login ya code kyun chahiye?",
      },
    ],
  },
  startNodeId: "dm",

  nodes: {
    dm: {
      kind: "thread",
      app: "instagram",
      contact: REWARDS,
      evidence: ["rewards-profile"],
      messages: [
        {
          id: "dm-congrats",
          from: "them",
          text: {
            en: "🎉 Congrats! Your account was picked for the Skyfall Arena Season 7 anniversary drop",
            hinglish:
              "🎉 Congrats! Skyfall Arena Season 7 anniversary drop ke liye tumhara account chuna gaya hai",
          },
          delayMs: 1000,
        },
        {
          id: "dm-offer",
          from: "them",
          segments: [
            { text: { en: "You get ", hinglish: "Tumhe milega " } },
            {
              id: "dm-free",
              text: {
                en: "2,000 Gems + the Phoenix Legend skin, totally FREE",
                hinglish: "2,000 Gems + Phoenix Legend skin, bilkul FREE",
              },
              redFlagId: "free-too-much",
            },
            { text: " 🔥" },
          ],
          delayMs: 1300,
        },
        {
          id: "dm-slots",
          from: "them",
          text: {
            en: "Only 37 claims left, offer ends at midnight ⏳",
            hinglish: "Sirf 37 claims bache hain, offer midnight ko khatam ⏳",
          },
          redFlagId: "fake-deadline",
          delayMs: 1200,
        },
        {
          id: "dm-link",
          from: "them",
          segments: [
            { text: { en: "Claim here 👉 ", hinglish: "Yahan claim karo 👉 " } },
            {
              id: "dm-url",
              text: {
                en: "skyfall-arena-gifts.example/claim",
                hinglish: "skyfall-arena-gifts.example/claim",
              },
              redFlagId: "lookalike-link",
            },
          ],
          delayMs: 1100,
        },
      ],
      choices: [
        {
          label: { en: "Open the claim link", hinglish: "Claim link kholo" },
          nextNodeId: "claim-page",
        },
        {
          label: {
            en: "Check the game's own news page first",
            hinglish: "Pehle game ka apna news page check karo",
          },
          nextNodeId: "checked-first",
        },
      ],
    },

    "claim-page": {
      kind: "thread",
      app: "instagram",
      contact: REWARDS,
      evidence: ["claim-site", "rewards-profile"],
      messages: [
        {
          id: "cp-login",
          from: "them",
          text: {
            en: "Log in on the page with your Skyfall ID so the Gems go to the right account 👍",
            hinglish:
              "Page pe apni Skyfall ID se log in karo taaki Gems sahi account mein jaayein 👍",
          },
          delayMs: 1300,
        },
        {
          id: "cp-code",
          from: "them",
          segments: [
            {
              text: {
                en: "You'll get a 6-digit code from Skyfall, ",
                hinglish: "Skyfall se tumhe ek 6-digit code aayega, ",
              },
            },
            {
              id: "cp-send-code",
              text: {
                en: "send it here so we can confirm it's you",
                hinglish: "use yahan bhejo taaki hum confirm kar sakein ki tum hi ho",
              },
              redFlagId: "asks-for-code",
            },
          ],
          delayMs: 1400,
        },
      ],
      choices: [
        {
          label: {
            en: "Log in and send them the code",
            hinglish: "Log in karo aur unhe code bhejo",
          },
          nextNodeId: "hooked",
        },
        {
          label: {
            en: "Close the page and report the account",
            hinglish: "Page band karo aur account report karo",
          },
          nextNodeId: "safe-late",
        },
      ],
    },

    hooked: {
      kind: "thread",
      app: "instagram",
      contact: REWARDS,
      messages: [
        {
          id: "hk-alert",
          from: "system",
          text: "Skyfall Arena: New login from an unknown device. Your password was changed.",
          delayMs: 900,
        },
        {
          id: "hk-verified",
          from: "them",
          text: {
            en: "✅ verified! Gems are processing",
            hinglish: "✅ verified! Gems process ho rahe hain",
          },
          delayMs: 1300,
        },
        {
          id: "hk-fee",
          from: "them",
          segments: [
            { text: { en: "Last step: ", hinglish: "Last step: " } },
            {
              id: "hk-pay",
              text: {
                en: "pay ₹499 activation fee to unlock them instantly",
                hinglish: "turant unlock karne ke liye ₹499 activation fee bharo",
              },
              redFlagId: "pay-to-unlock",
            },
            {
              text: {
                en: ", or they expire tonight",
                hinglish: ", warna aaj raat expire ho jaayenge",
              },
            },
          ],
          delayMs: 1500,
        },
      ],
      choices: [
        {
          label: {
            en: "Pay ₹499 to unlock the Gems",
            hinglish: "Gems unlock karne ke liye ₹499 bharo",
          },
          nextNodeId: "lost-both",
        },
        {
          label: {
            en: "Don't pay. Try to recover my account",
            hinglish: "Paise mat do. Apna account recover karne ki koshish karo",
          },
          nextNodeId: "account-gone",
        },
      ],
    },

    "checked-first": {
      kind: "outcome",
      result: "safe",
      title: { en: "No such drop exists", hinglish: "Aisa koi drop hai hi nahi" },
      body: {
        en: "The game's own news page and in-game mailbox had no anniversary drop. Real rewards land inside the game. You reported the account and kept your skins.",
        hinglish:
          "Game ke apne news page aur in-game mailbox mein koi anniversary drop nahi tha. Asli rewards game ke andar hi aate hain. Tumne account report kiya aur tumhare skins bach gaye.",
      },
    },
    "safe-late": {
      kind: "outcome",
      result: "safe",
      title: { en: "You closed the fake login", hinglish: "Tumne fake login band kar diya" },
      body: {
        en: "The page's address wasn't the game's, and a real game never asks you to send it your login code. You reported the account and your login stayed yours.",
        hinglish:
          "Page ka address game ka nahi tha, aur asli game kabhi tumse login code bhejne ko nahi kehta. Tumne account report kiya aur tumhara login tumhara hi raha.",
      },
    },
    "account-gone": {
      kind: "outcome",
      result: "compromised",
      title: { en: "Your account is theirs now", hinglish: "Ab tumhara account unka hai" },
      body: {
        en: "With your password and the code, they changed your login email within a minute. Two years of skins are gone, and your account is DMing the same link to your squad.",
        hinglish:
          "Tumhare password aur code se unhone ek minute mein tumhara login email badal diya. Do saal ke skins gaye, aur tumhara account tumhare squad ko wahi link DM kar raha hai.",
      },
      rewindToNodeId: "claim-page",
    },
    "lost-both": {
      kind: "outcome",
      result: "loss",
      title: {
        en: "No Gems, no account, ₹499 gone",
        hinglish: "Na Gems, na account, ₹499 bhi gaye",
      },
      body: {
        en: 'The Gems never came. They kept your account and your ₹499, then asked for ₹999 for "express delivery".',
        hinglish:
          'Gems kabhi nahi aaye. Unhone tumhara account aur tumhare ₹499 rakh liye, phir "express delivery" ke liye ₹999 maange.',
      },
      moneyDelta: -499,
      rewindToNodeId: "claim-page",
    },
  },

  evidence: {
    "rewards-profile": {
      kind: "profile",
      title: "skyfall.arena.rewardz",
      subtitle: "Official rewards 🎁 DM to claim",
      sections: [
        {
          fields: [
            { id: "rp-name", slot: "name", label: "Name", value: "skyfall.arena.rewardz" },
            {
              id: "rp-bio",
              slot: "headline",
              label: "Bio",
              value: "Official rewards 🎁 DM to claim",
            },
            {
              id: "rp-followers",
              slot: "connections",
              label: "Followers",
              value: "214 followers · 3 posts",
            },
          ],
        },
        {
          heading: "About this account",
          fields: [
            {
              id: "rp-joined",
              label: "Date joined",
              value: "October 2026",
              redFlagId: "new-account",
            },
            { id: "rp-verified", label: "Verified", value: "No" },
            {
              id: "rp-renamed",
              label: "Former usernames",
              value: "2 (changed this month)",
              redFlagId: "new-account",
            },
          ],
        },
      ],
    },
    "claim-site": {
      kind: "web-page",
      title: "skyfall-arena-gifts.example/login",
      subtitle: "Skyfall Arena · Claim your anniversary drop",
      sections: [
        {
          heading: "Log in to claim 2,000 Gems",
          fields: [
            {
              id: "cs-address",
              label: "Address bar",
              value: "skyfall-arena-gifts.example/login",
              redFlagId: "lookalike-link",
            },
            {
              id: "cs-form",
              label: "Log in with",
              value: "Skyfall ID (email or phone) and password",
            },
            {
              id: "cs-terms",
              value:
                "By continuing you let our partner manage your account, linked email and saved payment methods.",
              finePrint: true,
              redFlagId: "hands-over-account",
            },
          ],
        },
      ],
    },
  },

  redFlags: {
    "free-too-much": {
      label: { en: "A huge free reward", hinglish: "Bahut bada free reward" },
      tactic: "too-good-to-be-true",
      explanation: {
        en: "2,000 Gems and a rare skin for nothing is worth real money. Games don't hand that out by DM.",
        hinglish:
          "Muft mein 2,000 Gems aur rare skin ki asli keemat hoti hai. Games yeh DM pe nahi baant-te.",
      },
    },
    "fake-deadline": {
      label: {
        en: "Claims left, ends at midnight",
        hinglish: "Claims bache hain, midnight ko khatam",
      },
      tactic: "urgency",
      explanation: {
        en: "A countdown makes you click before you stop to check.",
        hinglish: "Countdown tumse ruk ke check karne se pehle hi click karwa deta hai.",
      },
    },
    "lookalike-link": {
      label: { en: "Not the game's own site", hinglish: "Game ki apni site nahi" },
      tactic: "disguised-link",
      explanation: {
        en: "\"skyfall-arena-gifts\" borrows the game's name, but it isn't the game's site. Rewards show up inside the game itself.",
        hinglish:
          '"skyfall-arena-gifts" game ka naam udhaar leta hai, par yeh game ki site nahi hai. Rewards game ke andar hi milte hain.',
      },
    },
    "new-account": {
      label: { en: "A brand-new, renamed account", hinglish: "Ekdum naya, naam badla hua account" },
      tactic: "impersonation",
      explanation: {
        en: 'An "official" account that joined last month, isn\'t verified and keeps changing its name is pretending.',
        hinglish:
          'Jo "official" account pichle mahine bana, verified nahi hai aur baar-baar naam badalta hai, woh natak kar raha hai.',
      },
    },
    "asks-for-code": {
      label: { en: "Send us your login code", hinglish: "Humein apna login code bhejo" },
      tactic: "data-harvest",
      explanation: {
        en: "The code the game texts you is the key to your account. Anyone who asks for it wants to log in as you.",
        hinglish:
          "Game jo code tumhe text karta hai, woh tumhare account ki chaabi hai. Jo bhi use maange, woh tumhare naam se login karna chahta hai.",
      },
    },
    "hands-over-account": {
      label: {
        en: "Fine print hands over your account",
        hinglish: "Fine print tumhara account de deta hai",
      },
      tactic: "data-harvest",
      explanation: {
        en: 'The small print gives "our partner" control of your account, email and payment methods.',
        hinglish:
          'Chhote akshar wali shart "our partner" ko tumhare account, email aur payment methods ka control de deti hai.',
      },
    },
    "pay-to-unlock": {
      label: {
        en: "Pay to unlock a free gift",
        hinglish: "Free gift unlock karne ke liye pay karo",
      },
      tactic: "pay-to-earn",
      explanation: {
        en: "A gift that needs a fee isn't free. The fee is the second half of the scam.",
        hinglish: "Jis gift ke liye fee lage, woh free nahi hai. Fee scam ka doosra hissa hai.",
      },
    },
  },

  debrief: {
    rule: {
      en: "Free rewards show up inside the game. Never log in through a link or share a code to claim one.",
      hinglish:
        "Free rewards game ke andar milte hain. Claim karne ke liye kabhi link se log in mat karo ya code share mat karo.",
    },
    summary: {
      en: 'Every step pushed you off the game and onto their page: a big free prize, a countdown, a lookalike link, then a request for your login code. Once they had that, they had the account, and the "activation fee" was a bonus.',
      hinglish:
        'Har step tumhe game se hata ke unke page pe le gaya: bada free prize, countdown, milta-julta link, phir tumhare login code ki maang. Code milte hi account unka ho gaya, aur "activation fee" toh bas bonus thi.',
    },
    realWorldAction: {
      en: "Gave away a login or code? Change your password from the game's own app, sign out other devices, and tell your friends not to click links sent from your account. Lost money? Call 1930 and report at cybercrime.gov.in.",
      hinglish:
        "Login ya code de diya? Game ke apne app se password badlo, baaki devices se sign out karo, aur dosto ko bolo ki tumhare account se aaye links pe click na karein. Paise gaye? 1930 pe call karo aur cybercrime.gov.in pe report karo.",
    },
  },
});
