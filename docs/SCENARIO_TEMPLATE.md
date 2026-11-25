# Scenario script template

Copy this file to `docs/scenarios/<dojo-id>/<scenario-id>.md` and fill it in. Write it as a human, not with Claude: realism is the whole point, and it comes from real cases. Then run `/new-scenario docs/scenarios/<dojo-id>/<scenario-id>.md` in Claude Code.

---

**Dojo:** easy-money / dream-job / trust-me-bro / authority
**Scenario id:** (kebab-case, e.g. `mule-recruitment`; scene, outcome and flag ids are kebab-case too)
**Title:**
**One-line summary:**
**Scam or legit:**
**Cold run?** (no primer, no hints) yes / no
**Based on a real case:** (link to a news report, cybercrime advisory or victim's post; required for scams)

## Primer

Skip if this is a cold run.

**Title:** (the trick's name, e.g. "Small win first")
**Text:** (2 to 3 sentences)
**Your situation:** (optional, 1 to 2 sentences: who the player is and what just happened. No hints.)
**Ask yourself:** (optional, easy scenarios only: 1 to 4 general questions, e.g. "Do I remember applying for this?". Never point at a specific sentence.)

## Red flags

Tactics to choose from: small-win-first, pay-to-earn, urgency, social-proof, sunk-cost, authority, isolation, too-good-to-be-true, flattery, impersonation, no-real-process, data-harvest, malicious-file, disguised-link.

| Flag id | What the player should notice | Tactic | Why it's a red flag (one sentence) |
| ------- | ----------------------------- | ------ | ---------------------------------- |
|         |                               |        |                                    |

## Scenes

Copy one block per scene. Mark a message that carries a red flag with `[flag: <flag id>]`.

### Scene: `<scene-id>`

**App:** whatsapp / telegram / instagram (sms / upi / call screens are still placeholders: check with the lead before using them)
**Contact:** name · status line (e.g. "Priya · HR" · "Active now"). Keep both the same as the previous scene to continue the same chat.

Messages:

- them: ...
- them (Sender name, for group chats): ... [flag: ...]
- system: ... (credit alerts, "X joined", etc.)
- me: ... (only if the player "sent" something)

Choices:

- "choice text" → `<scene-id or outcome-id>`
- "choice text" → `<scene-id or outcome-id>`

### Email scene: `<scene-id>` (optional)

**Display name:** · **From:** (address) · show From without tapping? yes / no
**Reply-To:** · **To:** · **Date:** · **Subject:** · **Inbox preview:**
Body (mark phrases with `[flag: <flag id>]`):

- ...

Attachments: shown name · full name · actual type · preview panel id · `[flag: ...]`
Buttons / links: text · actual destination (never opened) · `[flag: ...]`
Evidence buttons: panel ids
Choices: as above. A "Reply" choice can lead to a **compose** scene that shows the To field.

### Evidence panel: `<panel-id>` (optional)

**Kind:** profile / company / web-page / document · **Title:**
Fields (one per line, `label: value`, mark `[flag: ...]`, mark buried clauses `(fine print)`):

- ...

### Inbox triage (optional)

One row per email: email (as above) · correct label: legit / scam / needs-checking · why (one sentence).

## Outcomes

Copy one block per ending.

### Outcome: `<outcome-id>`

**Result:** safe / loss / partial-loss / compromised / missed-opportunity
**Title:**
**Text:** (what happened, in 1 to 2 sentences)
**Money:** (e.g. −₹4,550; leave blank if none)
**Rewind to:** `<scene-id>` (for losses: the scene where the player could have stopped)

## Debrief

**Rule to remember (one line):**
**Real-world action:** (e.g. "Call 1930 right away and report at cybercrime.gov.in")

---

## Before you hand it to Claude

- [ ] Written in English; it reads like a real scam: casual, a bit sloppy, trust built slowly (Hinglish comes later with `/translate-hinglish`)
- [ ] 3 to 4 decision points, at least 3 red flags
- [ ] Every choice leads somewhere, and every path ends in an outcome
- [ ] Losses have a rewind point
- [ ] All names, companies and apps are fictional; no real brands or logos
- [ ] Nothing asks for a real OTP, PIN, password or card number
- [ ] Your partner has read it and played it in their head
