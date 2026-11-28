import { defineDojo } from "@/engine/define";
import { cardAlert } from "./scenarios/card-alert";
import { digitalArrest } from "./scenarios/digital-arrest";
import { kycCall } from "./scenarios/kyc-call";

export const authority = defineDojo({
  id: "authority",
  order: 4,
  name: { en: "Authority", hinglish: "Authority" },
  tagline: {
    en: "An officer is calling? Don't let fear decide.",
    hinglish: "Officer ka call aaya? Darr ke faisla mat lo.",
  },
  scenarios: [kycCall, digitalArrest, cardAlert],
  // The guide's golden rules (docs/scenarios/authority/voice-call-scam-awareness-guide.pdf).
  takeaways: [
    {
      en: "Real banks, police and courts never demand money or OTPs over a call.",
      hinglish: "Asli bank, police aur court kabhi call pe paise ya OTP nahi maangte.",
    },
    {
      en: "No real agency “arrests” anyone over a video call. “Digital arrest” does not exist in law.",
      hinglish:
        "Koi asli agency video call pe kisi ko “arrest” nahi karti. Kanoon mein “digital arrest” jaisa kuch nahi hai.",
    },
    {
      en: "Hang up and call the official number yourself: from your card, your passbook or the official website.",
      hinglish:
        "Call kaato aur khud official number pe call karo: apne card, passbook ya official website se.",
    },
    {
      en: "Never share OTPs, PINs, CVV or passwords, and never install apps because a caller asked you to.",
      hinglish:
        "OTP, PIN, CVV ya password kabhi share mat karo, aur caller ke kehne pe kabhi koi app install mat karo.",
    },
    {
      en: "Fear and urgency, secrecy, and a request for money or codes: that's the scam. Hang up, verify independently, report.",
      hinglish:
        "Darr aur jaldi, secret rakhwana, aur paise ya codes ki maang: yahi scam hai. Call kaato, khud verify karo, report karo.",
    },
    {
      en: "In India, report fraud at 1930 or cybercrime.gov.in straight away. Quick reporting can freeze transfers.",
      hinglish:
        "India mein fraud turant 1930 ya cybercrime.gov.in pe report karo. Jaldi report karne se transfers freeze ho sakte hain.",
    },
    {
      en: "Not every call is a scam. A genuine bank asks for nothing secret and lets you call back, so verify instead of ignoring.",
      hinglish:
        "Har call scam nahi hota. Genuine bank kuch secret nahi maangta aur tumhe call back karne deta hai, isliye ignore karne ki jagah verify karo.",
    },
  ],
});
