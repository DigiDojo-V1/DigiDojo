import { defineDojo } from "@/engine/define";
import { taskScamStarter } from "./scenarios/task-scam-starter";

export const easyMoney = defineDojo({
  id: "easy-money",
  order: 1,
  name: { en: "Easy Money", hinglish: "Easy Money" },
  tagline: {
    en: "Earning from home? Check this first.",
    hinglish: "Ghar baithe kamai? Pehle yeh dekh lo.",
  },
  scenarios: [taskScamStarter],
});
