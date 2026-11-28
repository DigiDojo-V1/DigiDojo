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
    "Real banks, police and courts never demand money or OTPs over a call.",
    "No real agency “arrests” anyone over a video call. “Digital arrest” does not exist in law.",
    "Hang up and call the official number yourself: from your card, your passbook or the official website.",
    "Never share OTPs, PINs, CVV or passwords, and never install apps because a caller asked you to.",
    "Fear and urgency, secrecy, and a request for money or codes: that's the scam. Hang up, verify independently, report.",
    "In India, report fraud at 1930 or cybercrime.gov.in straight away. Quick reporting can freeze transfers.",
    "Not every call is a scam. A genuine bank asks for nothing secret and lets you call back, so verify instead of ignoring.",
  ],
});
