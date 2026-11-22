import { defineDojo } from "@/engine/define";
import { comingSoon } from "./scenarios/coming-soon";

export const authority = defineDojo({
  id: "authority",
  order: 4,
  name: { en: "Authority", hinglish: "Authority" },
  tagline: {
    en: "An officer is calling? Don't let fear decide.",
    hinglish: "Officer ka call aaya? Darr ke faisla mat lo.",
  },
  scenarios: [comingSoon],
});
