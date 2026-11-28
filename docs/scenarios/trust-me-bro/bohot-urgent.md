# Bhai, bohot urgent

> The code lives in `src/dojos/trust-me-bro/scenarios/bohot-urgent.ts`. The voice notes are a real clip of a consenting teammate and an AI clone made from it: see `scripts/voice-clone/README.md`.

**Dojo:** trust-me-bro
**Scenario id:** `bohot-urgent`
**Title:** Bhai, bohot urgent
**One-line summary:** Your friend's funny reel, then his voice from a new number. Same voice, so same person?
**Scam or legit:** scam
**Cold run?** no
**Based on a real case:** the AI voice-clone cases linked in [bhai-urgent.md](bhai-urgent.md).

## Primer

**Title:** Your reel is their recording
**Text:** A public reel gives anyone a few seconds of your voice. That's enough for a free app to make your voice say anything. In this scenario, the voice note on WhatsApp really is an AI clone, made from 3.8 seconds of a real person's reel.
**Your situation:** Your friend Kabir posts comedy reels on a public Instagram account. Tonight he sends you his newest one.

## Story

1. **Instagram DM.** Kabir shares his new comedy reel: "Bhai bhai, bohot urgent hai, ₹5,000 bhej de!" (the real clip). His profile is public, with 48 reels.
2. **WhatsApp, next day.** A new number: "Bhai Kabir here, lost my phone." A voice note in Kabir's voice (the AI clone) asks for ₹5,000 for a hostel fee, to a roommate's UPI.
3. **Choices.** Pay, ask for a call (he can't talk, "you heard my voice na"), or call Kabir's saved number.
4. **Reveal.** The real Kabir's phone is fine. He replays his reel: that's the only real recording, and the scammer made it say a whole new sentence.
5. **Paying** leads to a second ask of ₹3,000.

## Red flags

| Flag id             | What to notice                                          | Tactic              |
| ------------------- | ------------------------------------------------------- | ------------------- |
| `public-voice`      | Public account, 48 reels                                | data-harvest        |
| `new-number`        | "Lost my phone, this is my roommate's number"           | impersonation       |
| `urgent-money`      | "Hostel fee is due today, send five thousand right now" | urgency             |
| `someone-elses-upi` | mk.store4410@okpay                                      | impersonation       |
| `wont-call`         | "can't talk, I'm at the fee counter"                    | blocks-verification |
| `voice-as-proof`    | "you heard my voice na bro"                             | impersonation       |
| `second-ask`        | "₹3,000 late fine also"                                 | sunk-cost           |

## Outcomes

- **safe:** called the saved number. No loss.
- **too-late (partial-loss, −₹5,000):** paid once, then called Kabir.
- **lost-big (loss, −₹8,000):** paid twice.

## Debrief

**Rule:** A voice can be copied from a reel. Check the person on the number you already have.
