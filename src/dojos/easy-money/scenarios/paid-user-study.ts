import { defineScenario } from "@/engine/define";
import { EMAIL_STUDY } from "../content/emails";
import { pickPanels } from "../content/evidence";

/**
 * Legit twin: a genuine paid user-research invite. Rejecting it is a missed opportunity, and
 * any flag is a false alarm. Source: docs/scenarios/easy-money/paid-user-study.md.
 */
export const paidUserStudy = defineScenario({
  id: "paid-user-study",
  dojoId: "easy-money",
  title: { en: "Paid for your opinion", hinglish: "Apni raay do, paise pao" },
  summary: {
    en: "A startup offers ₹500 for a 30-minute video call about how you split bills. Accept or ignore?",
    hinglish:
      "Ek startup 30 minute ki video call ke ₹500 de raha hai, topic: tum bills kaise split karte ho. Accept karoge ya ignore?",
  },
  legit: true,
  primer: {
    title: { en: "Not every offer is a scam", hinglish: "Har offer scam nahi hota" },
    body: {
      en: "Some companies really do pay students for their time and opinions. Check who's asking, what they want from you, and which way the money flows.",
      hinglish:
        "Kuch companies sach mein students ko unke time aur raay ke paise deti hain. Check karo kaun pooch raha hai, tumse kya chahiye, aur paisa kis taraf ja raha hai.",
    },
    setup: {
      en: "You're Rohan. Last Friday at your college fest, you filled in a short form at a startup's stall to join their student research panel. Today, an email arrives.",
      hinglish:
        "Tum Rohan ho. Pichle Friday college fest mein tumne ek startup ke stall pe unke student research panel ke liye ek chhota form bhara tha. Aaj ek email aata hai.",
    },
  },
  startNodeId: "study-invite",

  nodes: {
    "study-invite": {
      kind: "email",
      app: "gmail",
      email: EMAIL_STUDY,
      evidence: ["kosha-research-page"],
      choices: [
        {
          label: {
            en: "Book a slot on their research page",
            hinglish: "Unke research page pe slot book karo",
          },
          nextNodeId: "booked",
        },
        {
          label: {
            en: "Ignore it. Nobody pays ₹500 for a chat",
            hinglish: "Ignore karo. Baat karne ke ₹500 koi nahi deta",
          },
          nextNodeId: "missed",
        },
      ],
    },
    booked: {
      kind: "outcome",
      result: "safe",
      title: { en: "₹500 for your opinion", hinglish: "Tumhari raay ke ₹500" },
      body: {
        en: "You booked through their own research page and talked for 30 minutes. The ₹500 reached your UPI three days later. You gave your time, nothing else.",
        hinglish:
          "Tumne unke apne research page se book kiya aur 30 minute baat ki. Teen din baad ₹500 tumhare UPI mein aa gaye. Tumne sirf apna time diya, aur kuch nahi.",
      },
      moneyDelta: 500,
    },
    missed: {
      kind: "outcome",
      result: "missed-opportunity",
      title: { en: "You turned down a real ₹500", hinglish: "Tumne asli ₹500 thukra diye" },
      body: {
        en: "This one was genuine: you'd signed up yourself, the email came from the same domain as Kosha's own research page, it named the researcher, and it paid after the work while asking for nothing but your time.",
        hinglish:
          "Yeh wala genuine tha: sign up tumne khud kiya tha, email usi domain se aaya jis pe Kosha ka research page hai, usmein researcher ka naam tha, aur paise kaam ke baad milne the, bas tumhara time chahiye tha.",
      },
      rewindToNodeId: "study-invite",
    },
  },

  evidence: pickPanels(["kosha-research-page", "consent-form"]),
  redFlags: {},

  debrief: {
    rule: {
      en: "Getting paid for real work is normal. Paying to get paid, or lending your account, isn't.",
      hinglish:
        "Asli kaam ke paise milna normal hai. Paise paane ke liye paise bharna, ya apna account udhaar dena, normal nahi hai.",
    },
    summary: {
      en: "This invite checked out. You had signed up yourself, the email came from the same domain as Kosha's own research page, it named the researcher, and ₹500 fits a one-off 30-minute call. The money flowed one way, to you, after the work. It asked for no fee, no bank login and no app. Compare the task scam: a small payout first, then a “prepaid task” where you send the money.",
      hinglish:
        "Yeh invite sahi nikla. Sign up tumne khud kiya tha, email usi domain se aaya jis pe Kosha ka research page hai, researcher ka naam diya tha, aur ek baar ki 30 minute call ke liye ₹500 theek baithta hai. Paisa ek hi taraf gaya, tumhari taraf, kaam ke baad. Na koi fee maangi, na bank login, na koi app. Task scam se compare karo: pehle chhota payout, phir ek “prepaid task” jismein paise tum bhejte ho.",
    },
    realWorldAction: {
      en: "Not sure an offer is real? Find the company's website yourself and contact them from there. If you've already paid someone, call 1930 and report at cybercrime.gov.in.",
      hinglish:
        "Pakka nahi pata offer asli hai ya nahi? Company ki website khud dhoondo aur wahin se contact karo. Agar kisi ko paise de chuke ho, toh 1930 pe call karo aur cybercrime.gov.in pe report karo.",
    },
  },
});
