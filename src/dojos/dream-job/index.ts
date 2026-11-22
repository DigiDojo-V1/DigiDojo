import { defineDojo } from "@/engine/define";
import { comingSoon } from "./scenarios/coming-soon";

export const dreamJob = defineDojo({
  id: "dream-job",
  order: 2,
  name: "Dream Job",
  tagline: "Offer letter asli hai ya jaal?",
  scenarios: [comingSoon],
});
