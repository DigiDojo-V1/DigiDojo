import { defineDojo } from "@/engine/define";
import { comingSoon } from "./scenarios/coming-soon";

export const dreamJob = defineDojo({
  id: "dream-job",
  order: 2,
  name: { en: "Dream Job", hinglish: "Dream Job" },
  tagline: {
    en: "Is that offer letter real or a trap?",
    hinglish: "Offer letter asli hai ya jaal?",
  },
  scenarios: [comingSoon],
});
