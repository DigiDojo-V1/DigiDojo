# 2,000 free Gems

> The code lives in `src/dojos/trust-me-bro/scenarios/free-gems.ts`. "Skyfall Arena", its Gems and every domain are fictional.

**Dojo:** trust-me-bro
**Scenario id:** `free-gems`
**Title:** 2,000 free Gems
**One-line summary:** A rewards account offers free Gems and a rare skin. Claim it or check first?
**Scam or legit:** scam
**Cold run?** no
**Based on a real case:**

- https://www.freepressjournal.in/mumbai/mumbai-crooks-target-kids-playing-online-games-cyber-cautions-public
- https://www.deccanherald.com/amp/story/india%2Fkarnataka%2Fbengaluru%2Fgamer-unwittingly-links-dad-s-account-to-scam-site-1063289.html
- https://www.inkl.com/news/madhya-pradesh-cyber-hq-cautions-parents-against-online-gaming-frauds

## Primer

**Title:** The free-reward login trap
**Text:** Free coins, skins or passes are the bait. The claim link opens a page that looks like your game's login, and whatever you type there, including the code the game texts you, goes straight to the scammer.
**Your situation:** You've played Skyfall Arena every day for two years and your account has rare skins. An account you don't follow sends you a DM.
**Ask yourself:** Who is this account, really? · Where would a real reward show up? · Why would anyone need my login or code to give me something?

## Red flags

| Flag id              | What the player should notice                        | Tactic              |
| -------------------- | ---------------------------------------------------- | ------------------- |
| `free-too-much`      | "2,000 Gems + the Phoenix Legend skin, totally FREE" | too-good-to-be-true |
| `fake-deadline`      | "Only 37 claims left, offer ends at midnight"        | urgency             |
| `lookalike-link`     | skyfall-arena-gifts.example (DM and page address)    | disguised-link      |
| `new-account`        | Profile: joined October 2026, renamed twice          | impersonation       |
| `asks-for-code`      | "send it here so we can confirm it's you"            | data-harvest        |
| `hands-over-account` | Page fine print: "our partner" manages your account  | data-harvest        |
| `pay-to-unlock`      | "pay ₹499 activation fee to unlock them instantly"   | pay-to-earn         |

## Scenes

### Scene: `dm` · Instagram · "skyfall.arena.rewardz" · "Active now" · evidence: `rewards-profile`

- them: 🎉 Congrats! Your account was picked for the Skyfall Arena Season 7 anniversary drop
- them: You get 2,000 Gems + the Phoenix Legend skin, totally FREE [flag: free-too-much] 🔥
- them: Only 37 claims left, offer ends at midnight ⏳ [flag: fake-deadline]
- them: Claim here 👉 skyfall-arena-gifts.example/claim [flag: lookalike-link]

Choices: "Open the claim link" → `claim-page` · "Check the game's own news page first" → `checked-first`

### Scene: `claim-page` (same chat) · evidence: `claim-site`, `rewards-profile`

- them: Log in on the page with your Skyfall ID so the Gems go to the right account 👍
- them: You'll get a 6-digit code from Skyfall, send it here so we can confirm it's you [flag: asks-for-code]

Choices: "Log in and send them the code" → `hooked` · "Close the page and report the account" → `safe-late`

### Scene: `hooked` (same chat)

- system: Skyfall Arena: New login from an unknown device. Your password was changed.
- them: ✅ verified! Gems are processing
- them: Last step: pay ₹499 activation fee to unlock them instantly [flag: pay-to-unlock], or they expire tonight

Choices: "Pay ₹499 to unlock the Gems" → `lost-both` · "Don't pay. Try to recover my account" → `account-gone`

### Evidence panel: `rewards-profile` · profile · "skyfall.arena.rewardz"

- Bio: Official rewards 🎁 DM to claim · Followers: 214 followers · 3 posts
- Date joined: October 2026 [flag: new-account] · Verified: No · Former usernames: 2 (changed this month) [flag: new-account]

### Evidence panel: `claim-site` · web-page · "skyfall-arena-gifts.example/login"

- Address bar: skyfall-arena-gifts.example/login [flag: lookalike-link]
- Log in with: Skyfall ID (email or phone) and password
- (fine print) By continuing you let our partner manage your account, linked email and saved payment methods. [flag: hands-over-account]

## Outcomes

- `checked-first` · safe · "No such drop exists"
- `safe-late` · safe · "You closed the fake login"
- `account-gone` · compromised · rewind to `claim-page`
- `lost-both` · loss · −₹499 · rewind to `claim-page`

## Debrief

**Rule to remember:** Free rewards show up inside the game. Never log in through a link or share a code to claim one.
**Real-world action:** Change your password from the game's own app, sign out other devices, warn friends. Lost money? Call 1930 and report at cybercrime.gov.in.
