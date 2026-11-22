import { defineDojo } from "@/engine/define";
import { comingSoon } from "./scenarios/coming-soon";

export const trustMeBro = defineDojo({
  id: "trust-me-bro",
  order: 3,
  name: { en: "Trust Me Bro", hinglish: "Trust Me Bro" },
  tagline: {
    en: "A friend's voice, a scammer's plan.",
    hinglish: "Dost ki awaaz, scammer ka plan.",
  },
  scenarios: [comingSoon],
});
