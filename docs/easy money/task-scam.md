**Dojo:** easy-money
**Scenario id:** `task-scam`
**Title:** Like videos, lose lakhs
**One-line summary:** ₹50 a like turns into a "VIP task" that needs your money. How far do you go?
**Scam or legit:** Scam
**Cold run?** no
**Based on a real case:**

- https://www.freepressjournal.in/amp/mumbai/fpj-cyber-secure-42-yr-old-panvel-man-loses-45-lakh-in-like-earn-online-scam (Panvel: ₹50 per YouTube like, added to a Telegram group, a ₹1,000 task paid back ₹1,480, then bigger deposits; ₹4.57 lakh lost)
- https://english.gujaratsamachar.com/news/gujarat/bcom-student-cheated-of-7-lakh-in-telegram-hotel-review-task-in-ahmedabad (Ahmedabad, Nov 2025: 19-year-old BCom student lost over ₹7 lakh on Telegram "prepaid tasks")

## Primer

**Title:** Small win first
**Text:** They pay you a little, fast, so you trust them with a lot. Watch for the moment the money starts flowing the other way.
**Your situation:** You're Rohan, a second-year B.Com student saving up for a new phone. An account messages you on Instagram about a part-time job.

## Red flags

| Flag id | What the player should notice | Tactic | Why it's a red flag (one sentence) |
| ------- | ----------------------------- | ------ | ---------------------------------- |
| `paid-for-likes` | ₹50 per like, ₹1,500 to ₹3,000 a day | too-good-to-be-true | Nobody pays ₹50 for a two-second like; the pay is bait, not wages. |
| `instant-payout` | ₹150 lands right after 3 likes | small-win-first | The quick payout exists only to make you trust them before they ask for money. |
| `fake-earners` | "Karan just withdrew ₹18,400" posts in the group | social-proof | Group members and screenshots are fakes or the scammers themselves. |
| `deposit-task` | Deposit ₹1,000 to get ₹1,480 back | pay-to-earn | The moment you pay to earn, it's no longer a job, it's a scam. |
| `slots-left` | "Only 3 VIP slots left today" | urgency | The countdown is there to stop you thinking it through. |
| `pay-to-withdraw` | Pay ₹25,000 more to "unlock" your balance | sunk-cost | Your "balance" is just a number on their screen; paying more only adds to the loss. |

## Scenes

### Scene: `insta-dm`

**App:** instagram
**Contact:** Riya | Digital Promotions · Active now

Messages:

- them: Hi Rohan! We're hiring part-timers to like YouTube videos for our clients 😊
- them: ₹50 per like, takes 2 minutes. Students earn ₹1,500-₹3,000 a day from their phone [flag: paid-for-likes]
- them: Want to try now? Like these 3 videos and send me screenshots 👇

Choices:

- "Sure, sending the screenshots now" → `first-payout`
- "Not interested. Block the account" → `safe-early`

### Scene: `first-payout`

**App:** instagram
**Contact:** Riya | Digital Promotions · Active now

Messages:

- system: ₹150 credited to your account from RIYA DIGITAL [flag: instant-payout]
- them: Done! ₹150 for 3 likes 🥳 You're fast
- them: For more tasks, join our Telegram group TaskEarn VIP. Our mentor Anjali will guide you

Choices:

- "Join the Telegram group" → `tg-group`
- "Keep the ₹150 and stop here" → `safe-early-bonus`

### Scene: `tg-group`

**App:** telegram
**Contact:** TaskEarn VIP · 1,284 members

Messages:

- system: Simulated group. These members and links aren't real.
- them: Anjali (Mentor): Welcome new members 🎉 Today's top earners 👇
- them: Karan just withdrew ₹18,400 💰 Sneha ₹22,750 🔥 Thank you Anjali ma'am!! [flag: fake-earners]
- them: Anjali (Mentor): VIP prepaid task: deposit ₹1,000, get ₹1,480 back in 10 minutes [flag: deposit-task]
- them: Anjali (Mentor): Only 3 VIP slots left today ⏳ [flag: slots-left]

Choices:

- "Pay ₹1,000 for the VIP task" → `vip-paid`
- "Leave the group and report it" → `safe-group`

### Scene: `vip-paid`

**App:** telegram
**Contact:** TaskEarn VIP · 1,284 members

Messages:

- system: ₹1,480 credited to your account from TASKEARN PAYOUTS
- them: Anjali (Mentor): See? 48% profit in 10 mins 😎
- them: Anjali (Mentor): Next level: deposit ₹8,000, get ₹11,200. Most members do this one twice a day

Choices:

- "Pay ₹8,000 for the next task" → `withdraw-blocked`
- "Stop here, I'm ₹630 up" → `safe-ahead`

### Scene: `withdraw-blocked`

**App:** telegram
**Contact:** TaskEarn VIP · 1,284 members

Messages:

- me: Paid ₹8,000. When do I get the ₹11,200?
- them: Anjali (Mentor): Your balance is ₹11,200 ✅ But you made an error in task 3, so withdrawal is frozen
- them: Anjali (Mentor): Complete 2 more combo tasks (₹25,000) to unlock everything. Then you get ₹46,000 [flag: pay-to-withdraw]
- them: Anjali (Mentor): If you stop now, your ₹11,200 is lost. Your choice 🤷‍♀️

Choices:

- "Pay ₹25,000 to unlock it" → `lost-big`
- "Stop paying. Call 1930 and report now" → `lost-some`

## Outcomes

### Outcome: `safe-early`

**Result:** safe
**Title:** You didn't take the bait
**Text:** Getting paid ₹50 for a like is the opening move of a task scam. You walked away before it started.

### Outcome: `safe-early-bonus`

**Result:** safe
**Title:** You kept ₹150 and left
**Text:** That ₹150 was bait meant to pull you into the Telegram group. Leaving here cost them money, not you. Block and report the account.

### Outcome: `safe-group`

**Result:** safe
**Title:** You left before paying
**Text:** The moment a "job" asks you to deposit money, it's a scam. You left the group with nothing lost.

### Outcome: `safe-ahead`

**Result:** safe
**Title:** You got out ₹630 up, by luck
**Text:** They paid the first VIP task back on purpose so you'd trust them with ₹8,000. Most people don't stop here. Report the group so others don't get pulled in.

### Outcome: `lost-some`

**Result:** partial-loss
**Title:** ₹7,370 gone
**Text:** Your "₹11,200 balance" was never real. You stopped and reported fast, which gives the police the best chance of freezing the money, but most of it is usually gone.
**Money:** −₹7,370
**Rewind to:** `vip-paid`

### Outcome: `lost-big`

**Result:** loss
**Title:** ₹32,370 gone
**Text:** After the ₹25,000 there was another "error" and another fee. There always is. The group blocked you once you stopped paying.
**Money:** −₹32,370
**Rewind to:** `withdraw-blocked`

## Debrief

**Rule to remember (one line):** If you have to pay to get paid, it's a scam.
**Summary:** Task scams start with real money: small, fast payouts for trivial work so you trust them. Then comes the "prepaid" or "VIP" task where you deposit first, and the first one even pays back. Once the amounts grow, withdrawal gets "frozen" until you pay more. The balance on their screen is fake, and every extra payment only adds to the loss.
**Real-world action:** Paid a task group? Stop paying, take screenshots, call 1930 right away and report at cybercrime.gov.in. Speed matters: the faster you report, the better the chance of freezing the money.
