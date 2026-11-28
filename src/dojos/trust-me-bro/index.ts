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
    {
      en: "A familiar voice proves nothing. Just 3 seconds of audio from a reel can be enough to copy it.",
      hinglish:
        "Jaani-pehchaani awaaz kuch prove nahi karti. Reel ki bas 3 second ki audio bhi use copy karne ke liye kaafi ho sakti hai.",
    },
    {
      en: "Before you send a friend money, call them on the number you already have.",
      hinglish:
        "Dost ko paise bhejne se pehle, us number pe call karo jo pehle se tumhare paas hai.",
    },
    {
      en: 'A "new number", a stranger\'s UPI name, "don\'t tell anyone" and "can\'t talk right now" together mean stop.',
      hinglish:
        '"Naya number", kisi anjaan ka UPI naam, "kisi ko mat batana" aur "abhi baat nahi kar sakta", yeh sab saath mein dikhe toh ruk jao.',
    },
    {
      en: "Free coins, skins and passes show up inside the game, never through a link in a DM.",
      hinglish: "Free coins, skins aur passes game ke andar milte hain, kabhi DM ke link se nahi.",
    },
    {
      en: "Never share the code your game, bank or app texts you. Whoever asks for it wants to log in as you.",
      hinglish:
        "Game, bank ya app jo code tumhe text kare, woh kabhi share mat karo. Jo bhi use maange, woh tumhare naam se login karna chahta hai.",
    },
    {
      en: "Not every request is a scam. Check on a channel you trust, then help.",
      hinglish: "Har request scam nahi hoti. Bharosemand channel pe check karo, phir help karo.",
    },
    {
      en: "Paid a scammer? Call 1930 right away and report at cybercrime.gov.in.",
      hinglish:
        "Scammer ko paise de diye? Turant 1930 pe call karo aur cybercrime.gov.in pe report karo.",
    },
  ],
});
