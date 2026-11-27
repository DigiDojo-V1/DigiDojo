import { defineDojo } from "@/engine/define";
import { muleRecruitment } from "./scenarios/mule-recruitment";
import { paidUserStudy } from "./scenarios/paid-user-study";
import { taskScam } from "./scenarios/task-scam";

export const easyMoney = defineDojo({
  id: "easy-money",
  order: 1,
  name: { en: "Easy Money", hinglish: "Easy Money" },
  tagline: {
    en: "Earning from home? Check this first.",
    hinglish: "Ghar baithe kamai? Pehle yeh dekh lo.",
  },
  scenarios: [taskScam, muleRecruitment, paidUserStudy],
  takeaways: [
    "If you have to pay to get paid, it's a scam. “Prepaid”, “VIP”, “combo” and “unlock” tasks are all deposits.",
    "A small, fast payout for trivial work is bait to win your trust before the big ask.",
    "A balance on their screen isn't money. If a withdrawal is “frozen” until you pay a fee, the money is already gone.",
    "Earner screenshots and busy groups can be staged, especially when only admins can post.",
    "Never let anyone use your bank account, UPI, ATM card, PIN, net banking or SIM. That's money-mule work, and the account owner gets frozen and named in the case.",
    "If unexpected money lands in your account, don't forward it. Call your bank.",
    "Real paid work: you signed up yourself, the company checks out on its own website, you're paid after the work, and you give nothing but your time.",
    "Already paid or shared your details? Call 1930 and report at cybercrime.gov.in.",
  ],
});
