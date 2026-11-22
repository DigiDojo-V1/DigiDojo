import { defineDojo } from "@/engine/define";
import { comingSoon } from "./scenarios/coming-soon";

export const authority = defineDojo({
  id: "authority",
  order: 4,
  name: "Authority",
  tagline: "Officer ka call aaya? Darr ke faisla mat lo.",
  scenarios: [comingSoon],
});
