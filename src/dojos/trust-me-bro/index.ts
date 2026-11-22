import { defineDojo } from "@/engine/define";
import { comingSoon } from "./scenarios/coming-soon";

export const trustMeBro = defineDojo({
  id: "trust-me-bro",
  order: 3,
  name: "Trust Me Bro",
  tagline: "Dost ki awaaz, scammer ka plan.",
  scenarios: [comingSoon],
});
