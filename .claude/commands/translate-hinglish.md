---
description: Add Hinglish to every text field of one scenario that doesn't have it yet
argument-hint: <path to scenario file, e.g. src/dojos/easy-money/scenarios/task-scam-starter.ts>
---

You are adding Hinglish to ONE DigiDojo scenario. The English is already written and reviewed; your job is the translation pass only.

Scenario file: $ARGUMENTS

Follow these steps in order:

1. Read `CLAUDE.md`, `docs/CONTEXT.md` §5 (the `LocalizedText` part), the scenario file, and `src/dojos/easy-money/scenarios/task-scam-starter.ts` as the reference for tone. If the path isn't a scenario file under `src/dojos/<dojo-id>/scenarios/`, stop and say so.
2. Find every player-facing text field that has no Hinglish yet:
   - scenario `title`, `summary`, `primer.title`, `primer.body`
   - per thread: `contact.name`, `contact.subtitle`, each message's `text` and `sender`, each choice's `label`
   - per outcome: `title`, `body`
   - per red flag: `label`, `explanation`
   - `debrief.rule`, `debrief.realWorldAction`

   A field lacks Hinglish if it is a plain string (`text: "..."`) or an object without `hinglish` (`text: { en: "..." }`).

3. For each of those fields:
   - Plain string `"X"` becomes `{ en: "X", hinglish: "..." }`. An object `{ en: "X" }` gains a `hinglish` key.
   - Copy `en` **character for character**. Never reword, fix or reformat the English.
   - Write the Hinglish in Roman script, casual and natural, the way real Indian scam texts and WhatsApp chats mix Hindi and English: English for words people really say in English (task, payment, account, group, link, OTP, KYC, screenshot, interested), Hindi grammar and filler around them ("bas", "jaldi karo", "aapka", "ho gaye"). No Devanagari. No formal or textbook Hindi ("dhanraashi", "kripya" only if a real scammer would say it).
   - Match the speaker. Scammers are friendly, pushy or official depending on the script. System lines (credit alerts, "X joined the group") read like app notifications. Outcomes, red flags and the debrief speak to the player as "tum".
   - Keep every number, rupee amount (₹ and Indian digit grouping), emoji, `[screenshot]`-style marker, URL, phone number (1930) and site name (cybercrime.gov.in) exactly as in `en`.
   - Names and handles (contact names, senders, group names like "Earn Daily VIP") usually stay the same: set `hinglish` equal to `en`. Translate a contact subtitle only if it is ordinary words.
4. Never change anything else: no ids, `redFlagId`s, `nextNodeId`s, `rewindToNodeId`s, tactics, `delayMs`, `moneyDelta`, `legit`, `coldRun`, node order or structure. Leave any existing `hinglish` exactly as it is. Edit only this one file.
5. Run `npm run lint && npm run typecheck && npm test && npm run build`. Fix failures in this file only, without touching `en`. Then run `npm run i18n:report` and confirm this scenario shows 0 missing.
6. Finish with a review table for a human who reads Hinglish, one row per field you translated, in file order:

   | Field | en  | hinglish |
   | ----- | --- | -------- |

   Use the field path as `npm run i18n:report` would name it (e.g. `nodes.dm.messages.dm-offer.text`). Below the table, list any line where you were unsure of the tone or meaning, so the reviewer checks those first.
