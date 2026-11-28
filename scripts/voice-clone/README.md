# Voice-clone demo audio

The "Bhai, bohot urgent" scenario (`src/dojos/trust-me-bro/scenarios/bohot-urgent.ts`) uses a real voice, on purpose, to show that a few seconds of a reel is enough to clone someone.

| File                                                                    | What it is                                                                                                           |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `bohot-urgent-source.wav`                                               | The original 3.8 second WhatsApp voice note from a DigiDojo teammate: "Bhai bhai, bohot urgent hai, ₹5,000 bhej de!" |
| `public/voices/trust-me-bro/bohot-urgent/reel-audio.mp3`, `rk-reel.mp3` | That same clip, played as Kabir's reel                                                                               |
| `public/voices/trust-me-bro/bohot-urgent/clone-voice.mp3`               | An AI clone made from only that clip with F5-TTS (open source), saying a sentence the teammate never said            |

**Consent.** The teammate agreed to have their voice recorded and cloned for this awareness demo. Only clone the voice of someone who has agreed, and label the result as AI in the scenario.

**Re-making the clone.** Use F5-TTS with `bohot-urgent-source.wav` as reference audio, the reference text above, and the `clone-voice` transcript from the scenario as the text to generate. `npm run voices` never touches these files.
