# Bhai, urgent

> The code lives in `src/dojos/trust-me-bro/scenarios/bhai-urgent.ts`.

**Dojo:** trust-me-bro
**Scenario id:** `bhai-urgent`
**Title:** Bhai, urgent
**One-line summary:** Your best friend's voice asks for ₹5,000 from a new number. Help him or check first?
**Scam or legit:** scam
**Cold run?** no
**Based on a real case:**

- https://gulfnews.com/world/asia/india/india-lucknow-reports-first-ai-generated-voice-fraud-case-1.1702870783452
- https://scroll.in/article/1066442/family-member-in-distress-or-an-ai-voice-clone-the-rise-of-a-disturbing-new-cyber-crime-scam
- https://www.easternmirrornagaland.com/tamil-nadu-police-warn-people-against-fraudsters-using-ai-based-voice-cloning

## Primer

**Title:** The cloned voice
**Text:** Just 3 seconds of someone's voice from a reel can be enough for an app to copy it. Scammers use a copied voice to ask friends and family for money, fast, from a number you've never seen.
**Your situation:** It's Saturday evening. Your friend Arjun was at Rohan's party last night. A number you don't know messages you on WhatsApp.
**Ask yourself:** How do I know who is really on the other end? · Can I reach this person some other way before I pay? · Whose name is on the account I'm paying?

## Red flags

| Flag id             | What the player should notice                         | Tactic        | Why it's a red flag                                               |
| ------------------- | ----------------------------------------------------- | ------------- | ----------------------------------------------------------------- |
| `new-number`        | "this is my cousin's phone, save this number"         | impersonation | Anyone can claim to be your friend from a new number.             |
| `urgent-money`      | "₹5,000 deposit right now before they admit him"      | urgency       | No time to think or check with anyone.                            |
| `someone-elses-upi` | rk.traders2291@okpay                                  | impersonation | Money for Arjun goes to an account in a business's name.          |
| `keep-it-secret`    | "don't tell anyone in the group"                      | isolation     | Keeps out the people who could tell you where Arjun really is.    |
| `wont-call`         | "can't talk bro, ward is so noisy and battery is 3%"  | isolation     | A live call would expose the copy.                                |
| `voice-as-proof`    | "Bhai it's me na, you know my voice." (voice note)    | impersonation | A voice can be copied; it proves nothing.                         |
| `dodges-question`   | "I'm literally in a hospital and you're quizzing me?" | impersonation | The real Arjun could answer; the fake turns the check into guilt. |
| `second-ask`        | "₹8,000 more for the scan"                            | sunk-cost     | Having paid once, a second ask is easier to say yes to.           |

## Scenes

### Scene: `new-number` · WhatsApp · "+91 97384 21065" · "online"

- them: Bro it's me Arjun
- them: My phone fell in the pool at Rohan's party 🤦 this is my cousin's phone, save this number [flag: new-number]

Choices: "Arjun?? What happened, you okay?" → `the-ask` · "Who is this? I'll call Arjun's old number" → `real-arjun`

### Scene: `the-ask` (same chat)

- them (voice note, 0:14): Bhai listen, I'm at City Care hospital with Papa. They need a ₹5,000 deposit right now before they admit him, [flag: urgent-money] and my UPI is blocked on this new SIM. I'll return it tonight, pakka.
- them: pls bro fast 🙏
- them: Send it to my cousin's UPI: rk.traders2291@okpay [flag: someone-elses-upi]
- them: And don't tell anyone in the group, [flag: keep-it-secret] Papa doesn't want people to know

Choices: "Send ₹5,000 now" → `sent-once` · "Call me, I want to hear you first" → `cant-talk` · "Quick: what did we order at Rohan's party?" → `the-quiz`

### Scene: `cant-talk` (same chat)

- them: can't talk bro, ward is so noisy and battery is 3% [flag: wont-call]
- them (voice note, 0:06): Bhai it's me na, you know my voice. [flag: voice-as-proof] Just send it, I'll explain everything later.

Choices: "Okay, sending ₹5,000" → `sent-once` · "Call Arjun's old number anyway" → `real-arjun`

### Scene: `the-quiz` (same chat)

- them: bro what is this, KBC? 😂
- them: I'm literally in a hospital and you're quizzing me? [flag: dodges-question] forget it, I thought you were my real friend

Choices: "Sorry bro, sending now" → `sent-once` · "Call Arjun's old number" → `real-arjun`

### Scene: `sent-once` (same chat)

- system: ₹5,000 paid to R K TRADERS · rk.traders2291@okpay
- them: thank you bro, lifesaver ❤️
- them: Bhai one more problem. Doctor says ₹8,000 more for the scan, only then they'll start [flag: second-ask]
- them: please, last time. I'll return all 13k tonight

Choices: "Send ₹8,000 more" → `lost-big` · "Stop and call Arjun's old number" → `real-arjun-after`

### Scene: `real-arjun` · WhatsApp · "Arjun" · "last seen today at 14:02"

- system: Voice call · 0:48
- them: bro my phone is totally fine, I'm in the library 😳
- them: that's NOT me. they must have copied my voice from my reels
- them: block and report that number pls, I'll warn the group too

Choices: "Block and report the number" → `safe`

### Scene: `real-arjun-after` (Arjun)

- system: Voice call · 1:12
- them: WHAT. bro I never sent you anything, my phone is right here
- them: call 1930 right now, the faster you report the better the chance they freeze it

Choices: "Call 1930 and report the number" → `partial`

## Outcomes

- `safe` · safe · "You checked with the real Arjun"
- `partial` · partial-loss · −₹5,000 · rewind to `the-ask`
- `lost-big` · loss · −₹13,000 · rewind to `the-ask`

## Debrief

**Rule to remember:** Before you send money to a friend, call them on the number you already have.
**Real-world action:** Paid a scammer? Call 1930 right away and report at cybercrime.gov.in. Then tell your friend, so they can warn others.
