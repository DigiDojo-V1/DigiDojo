import { defineDojo } from "@/engine/define";
import { bhaiUrgent } from "./scenarios/bhai-urgent";
import { freeGems } from "./scenarios/free-gems";
import { realFriend } from "./scenarios/real-friend";

export const trustMeBro = defineDojo({
  id: "trust-me-bro",
  order: 3,
  name: { en: "Trust Me Bro", hinglish: "Trust Me Bro" },
  tagline: {
    en: "A friend's voice, a scammer's plan.",
    hinglish: "Dost ki awaaz, scammer ka plan.",
  },
  scenarios: [bhaiUrgent, freeGems, realFriend],
  takeaways: [
    "A familiar voice proves nothing. A few seconds from a reel is enough to copy it.",
    "Before you send a friend money, call them on the number you already have.",
    'A "new number", a stranger\'s UPI name, "don\'t tell anyone" and "can\'t talk right now" together mean stop.',
    "Free coins, skins and passes show up inside the game, never through a link in a DM.",
    "Never share the code your game, bank or app texts you. Whoever asks for it wants to log in as you.",
    "Not every request is a scam. Check on a channel you trust, then help.",
    "Paid a scammer? Call 1930 right away and report at cybercrime.gov.in.",
  ],
});
