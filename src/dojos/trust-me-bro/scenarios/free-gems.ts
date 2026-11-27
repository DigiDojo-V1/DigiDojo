import { defineScenario } from "@/engine/define";

/**
 * Free in-game currency → fake login page → account takeover. A "rewards" account DMs a
 * gamer about a free anniversary drop. Script: docs/scenarios/trust-me-bro/free-gems.md.
 * The game, the account and every domain are fictional.
 */

const REWARDS = { name: "skyfall.arena.rewardz", subtitle: "Active now" };

export const freeGems = defineScenario({
  id: "free-gems",
  dojoId: "trust-me-bro",
  title: "2,000 free Gems",
  summary: "A rewards account offers free Gems and a rare skin. Claim it or check first?",
  legit: false,
  primer: {
    title: "The free-reward login trap",
    body: "Free coins, skins or passes are the bait. The claim link opens a page that looks like your game's login, and whatever you type there, including the code the game texts you, goes straight to the scammer.",
    setup:
      "You've played Skyfall Arena every day for two years and your account has rare skins. An account you don't follow sends you a DM.",
    watchFor: [
      "Who is this account, really?",
      "Where would a real reward show up?",
      "Why would anyone need my login or code to give me something?",
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
          text: "🎉 Congrats! Your account was picked for the Skyfall Arena Season 7 anniversary drop",
          delayMs: 1000,
        },
        {
          id: "dm-offer",
          from: "them",
          segments: [
            { text: "You get " },
            {
              id: "dm-free",
              text: "2,000 Gems + the Phoenix Legend skin, totally FREE",
              redFlagId: "free-too-much",
            },
            { text: " 🔥" },
          ],
          delayMs: 1300,
        },
        {
          id: "dm-slots",
          from: "them",
          text: "Only 37 claims left, offer ends at midnight ⏳",
          redFlagId: "fake-deadline",
          delayMs: 1200,
        },
        {
          id: "dm-link",
          from: "them",
          segments: [
            { text: "Claim here 👉 " },
            {
              id: "dm-url",
              text: "skyfall-arena-gifts.example/claim",
              redFlagId: "lookalike-link",
            },
          ],
          delayMs: 1100,
        },
      ],
      choices: [
        { label: "Open the claim link", nextNodeId: "claim-page" },
        { label: "Check the game's own news page first", nextNodeId: "checked-first" },
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
          text: "Log in on the page with your Skyfall ID so the Gems go to the right account 👍",
          delayMs: 1300,
        },
        {
          id: "cp-code",
          from: "them",
          segments: [
            { text: "You'll get a 6-digit code from Skyfall, " },
            {
              id: "cp-send-code",
              text: "send it here so we can confirm it's you",
              redFlagId: "asks-for-code",
            },
          ],
          delayMs: 1400,
        },
      ],
      choices: [
        { label: "Log in and send them the code", nextNodeId: "hooked" },
        { label: "Close the page and report the account", nextNodeId: "safe-late" },
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
          text: "✅ verified! Gems are processing",
          delayMs: 1300,
        },
        {
          id: "hk-fee",
          from: "them",
          segments: [
            { text: "Last step: " },
            {
              id: "hk-pay",
              text: "pay ₹499 activation fee to unlock them instantly",
              redFlagId: "pay-to-unlock",
            },
            { text: ", or they expire tonight" },
          ],
          delayMs: 1500,
        },
      ],
      choices: [
        { label: "Pay ₹499 to unlock the Gems", nextNodeId: "lost-both" },
        { label: "Don't pay. Try to recover my account", nextNodeId: "account-gone" },
      ],
    },

    "checked-first": {
      kind: "outcome",
      result: "safe",
      title: "No such drop exists",
      body: "The game's own news page and in-game mailbox had no anniversary drop. Real rewards land inside the game. You reported the account and kept your skins.",
    },
    "safe-late": {
      kind: "outcome",
      result: "safe",
      title: "You closed the fake login",
      body: "The page's address wasn't the game's, and a real game never asks you to send it your login code. You reported the account and your login stayed yours.",
    },
    "account-gone": {
      kind: "outcome",
      result: "compromised",
      title: "Your account is theirs now",
      body: "With your password and the code, they changed your login email within a minute. Two years of skins are gone, and your account is DMing the same link to your squad.",
      rewindToNodeId: "claim-page",
    },
    "lost-both": {
      kind: "outcome",
      result: "loss",
      title: "No Gems, no account, ₹499 gone",
      body: 'The Gems never came. They kept your account and your ₹499, then asked for ₹999 for "express delivery".',
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
      label: "A huge free reward",
      tactic: "too-good-to-be-true",
      explanation:
        "2,000 Gems and a rare skin for nothing is worth real money. Games don't hand that out by DM.",
    },
    "fake-deadline": {
      label: "Claims left, ends at midnight",
      tactic: "urgency",
      explanation: "A countdown makes you click before you stop to check.",
    },
    "lookalike-link": {
      label: "Not the game's own site",
      tactic: "disguised-link",
      explanation:
        "\"skyfall-arena-gifts\" borrows the game's name, but it isn't the game's site. Rewards show up inside the game itself.",
    },
    "new-account": {
      label: "A brand-new, renamed account",
      tactic: "impersonation",
      explanation:
        'An "official" account that joined last month, isn\'t verified and keeps changing its name is pretending.',
    },
    "asks-for-code": {
      label: "Send us your login code",
      tactic: "data-harvest",
      explanation:
        "The code the game texts you is the key to your account. Anyone who asks for it wants to log in as you.",
    },
    "hands-over-account": {
      label: "Fine print hands over your account",
      tactic: "data-harvest",
      explanation:
        'The small print gives "our partner" control of your account, email and payment methods.',
    },
    "pay-to-unlock": {
      label: "Pay to unlock a free gift",
      tactic: "pay-to-earn",
      explanation: "A gift that needs a fee isn't free. The fee is the second half of the scam.",
    },
  },

  debrief: {
    rule: "Free rewards show up inside the game. Never log in through a link or share a code to claim one.",
    summary:
      'Every step pushed you off the game and onto their page: a big free prize, a countdown, a lookalike link, then a request for your login code. Once they had that, they had the account, and the "activation fee" was a bonus.',
    realWorldAction:
      "Gave away a login or code? Change your password from the game's own app, sign out other devices, and tell your friends not to click links sent from your account. Lost money? Call 1930 and report at cybercrime.gov.in.",
  },
});
