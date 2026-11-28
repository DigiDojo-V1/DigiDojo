# Neha needs a favour

> The dojo's legit control. The code lives in `src/dojos/trust-me-bro/scenarios/real-friend.ts`.

**Dojo:** trust-me-bro
**Scenario id:** `real-friend`
**Title:** Neha needs a favour
**One-line summary:** A friend sends a voice note asking you to book her ticket. Scam or a real favour?
**Scam or legit:** legit
**Cold run?** no

## Primer

**Title:** Check, then trust
**Text:** Not every money request from a friend is a scam. The habit that protects you is the same one that lets you help: confirm it's them on a channel you already trust.
**Your situation:** Neha is in your college group and you've been to two gigs together. She's saved in your contacts and messages you on WhatsApp.

## Red flags

None. Any flag is a false alarm.

## Scenes

### Scene: `the-favour` · WhatsApp · "Neha" · "online"

- them: heyyy are you free for 2 min
- them (voice note, 0:11): Okay so early-bird tickets for the Lagori Fest open in ten minutes and my card got blocked this morning. Can you book mine with yours? It's ₹800, I'll send it back as soon as I'm home.
- them: same site we used last time, I'll be in the same zone as you

Choices: "Call Neha to check it's her" → `on-call` · "Nope. Block her, this is a scam" → `blocked`

### Scene: `on-call` (same chat)

- system: Voice call · 0:41
- them: lol yes it's me, good that you checked 😂
- them: typed my PIN wrong three times, the bank unblocks it tomorrow
- them: book it on the fest's own site, I'll pay you back from my account tonight

Choices: "Book her ticket on the fest's site" → `booked` · "Still say no, just in case" → `said-no`

## Outcomes

- `booked` · safe · "Two tickets, one happy friend"
- `blocked` · missed-opportunity · rewind to `the-favour`
- `said-no` · missed-opportunity · rewind to `on-call`

## Debrief

**Rule to remember:** Not every request is a scam. Check on a channel you trust, then help.
**Real-world action:** If a friend's request ever feels off, call them on their saved number before you pay. If you've already paid a scammer, call 1930 and report at cybercrime.gov.in.
