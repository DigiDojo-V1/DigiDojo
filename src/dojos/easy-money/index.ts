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
    {
      en: "If you have to pay to get paid, it's a scam. “Prepaid”, “VIP”, “combo” and “unlock” tasks are all deposits.",
      hinglish:
        "Agar paise kamane ke liye pehle paise bharne pade, toh woh scam hai. “Prepaid”, “VIP”, “combo” aur “unlock” tasks sab deposits hi hain.",
    },
    {
      en: "A small, fast payout for trivial work is bait to win your trust before the big ask.",
      hinglish:
        "Chhote-mote kaam ka chhota, jaldi payout chaara hai, taaki badi maang se pehle tumhara bharosa jeet sakein.",
    },
    {
      en: "A balance on their screen isn't money. If a withdrawal is “frozen” until you pay a fee, the money is already gone.",
      hinglish:
        "Unki screen pe dikhne wala balance paisa nahi hai. Agar fee bharne tak withdrawal “frozen” hai, toh paisa ja chuka hai.",
    },
    {
      en: "Earner screenshots and busy groups can be staged, especially when only admins can post.",
      hinglish:
        "Kamane walon ke screenshots aur bhare hue groups nakli ho sakte hain, khaas kar jab sirf admins post kar sakte hon.",
    },
    {
      en: "Never let anyone use your bank account, UPI, ATM card, PIN, net banking or SIM. That's money-mule work, and the account owner gets frozen and named in the case.",
      hinglish:
        "Apna bank account, UPI, ATM card, PIN, net banking ya SIM kabhi kisi ko use mat karne do. Yeh money-mule ka kaam hai, aur account owner ka account freeze hota hai aur case mein naam aata hai.",
    },
    {
      en: "If unexpected money lands in your account, don't forward it. Call your bank.",
      hinglish:
        "Account mein achanak paisa aa jaaye, toh use aage mat bhejo. Apne bank ko call karo.",
    },
    {
      en: "Real paid work: you signed up yourself, the company checks out on its own website, you're paid after the work, and you give nothing but your time.",
      hinglish:
        "Asli paid kaam: sign up tumne khud kiya, company apni website pe sahi nikalti hai, paise kaam ke baad milte hain, aur tum apne time ke alawa kuch nahi dete.",
    },
    {
      en: "Already paid or shared your details? Call 1930 and report at cybercrime.gov.in.",
      hinglish:
        "Paise de diye ya details share kar di? 1930 pe call karo aur cybercrime.gov.in pe report karo.",
    },
  ],
});
