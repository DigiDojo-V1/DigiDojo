import { defineDojo } from "@/engine/define";
import { taskScamStarter } from "./scenarios/task-scam-starter";

export const easyMoney = defineDojo({
  id: "easy-money",
  order: 1,
  name: "Easy Money",
  tagline: "Ghar baithe kamai? Pehle yeh dekh lo.",
  scenarios: [taskScamStarter],
});
