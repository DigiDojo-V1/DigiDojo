# Easy Money dojo: all scripts

Three scenarios: the task scam (live demo scene, not built yet), the money mule (built, in video 1) and the legit twin (built, in video 2). Each section below is a complete script in the team template format.

---

# 1. Task scam

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


---

# 2. Money mule

**Dojo:** easy-money
**Scenario id:** `mule-recruitment`
**Title:** Rent your account
**One-line summary:** An Instagram “payments gig” pays you to receive and forward money. Easy cash or a trap?
**Scam or legit:** Scam
**Cold run?** no
**Based on a real case:**

- https://www.onmanorama.com/news/kerala/2026/03/07/bank-account-rental-cyber-fraud-arrest.html (Kerala, March 2026: gangs befriend students and people short of money on social media and pay ₹3,000 to ₹10,000 per transaction to "rent" their accounts; ATM cards, PINs and SIMs handed over; account holders arrested)
- https://www.freepressjournal.in/amp/pune/dont-rent-your-bank-account-pimpri-chinchwad-police-warn-students-and-youth-as-cyber-fraud-cases-rise (Pimpri-Chinchwad, July 2026: students recruited on social media, Telegram and WhatsApp with "handling company money" and GST pretexts; recruiters take net banking passwords, ATM cards and SIMs; police say the account owner "will be made an accused")

## Primer

**Title:** Rent your account
**Text:** Some “jobs” don't want your time. They want your bank account, so stolen money can move through your name instead of theirs. Watch what they actually ask you for.
**Your situation:** You're Rohan, a second-year B.Com student. Your semester fee instalment is due next week, so you commented “interested” on an Instagram reel about earning from your phone.

## Red flags

| Flag id             | What the player should notice                                   | Tactic              | Why it's a red flag (one sentence)                                                                          |
| ------------------- | --------------------------------------------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------- |
| `easy-commission`   | ₹5,000 to ₹10,000 a month for 10 minutes a day                  | too-good-to-be-true | Nobody pays that much for ten minutes on a phone unless the real price is something else.                   |
| `rent-your-account` | Clients pay into your account and you forward it to theirs      | no-real-process     | A real company collects payments in its own account; it only needs yours to hide whose money it is.         |
| `others-do-it`      | "200+ students already do it, my cousin made ₹9k"               | social-proof        | Other people doing it doesn't make it legal: mule gangs recruit students in batches from the same colleges. |
| `account-kit`       | Account number, ATM card photos with the PIN, net banking login | data-harvest        | No employer needs your PIN or net banking login; with them, they control your account.                      |
| `joining-bonus`     | ₹500 "joining bonus" lands in your account                      | small-win-first     | The bonus tests that your account works for them and makes you trust the much bigger transfer that follows. |
| `move-it-fast`      | Forward ₹43,200 within 15 minutes                               | urgency             | They rush you so the money leaves your account before the victim's bank can stop it.                        |
| `keep-it-quiet`     | Don't tell anyone at home or at the bank                        | isolation           | Anyone you told would spot it in seconds, so they keep you alone with it.                                   |

## Scenes

### Scene: `insta-dm`

**App:** instagram
**Contact:** Vikram | EasyEarn Hub · Active now

Messages:

- them: Hey Rohan! Saw your comment on our reel 🙌
- them: We have a payments side gig for college students. 10 min a day from your phone, students are making ₹5,000-₹10,000 a month [flag: easy-commission]
- them: Work is simple: our clients pay into your bank account, you transfer it to our company account same day [flag: rent-your-account]. You keep 10% as commission 💸
- them: Zero investment. Interested?

Choices:

- "Sounds easy. How do I start?" → `wa-setup`
- "Why can't your company take the payments in its own account?" → `insta-why`
- "Not interested. Block the account" → `safe-early`

### Scene: `insta-why`

**App:** instagram
**Contact:** Vikram | EasyEarn Hub · Active now

Messages:

- them: Company account has GST limits bro, so we split payments across student accounts 🙂
- them: 200+ students from colleges here already do it. My own cousin made ₹9k last month [flag: others-do-it]
- them: Insta keeps flagging payment chats, let's continue on WhatsApp. Pinging you from +91 90000 54321

Choices:

- "Fine, let's continue on WhatsApp" → `wa-setup`
- "That doesn't add up. Block and report the account" → `safe-early`

### Scene: `wa-setup`

**App:** whatsapp
**Contact:** Vikram EasyEarn · online

Messages:

- system: Simulated chat. This number can't be called or messaged.
- them: Hey it's Vikram from EasyEarn 👋 Welcome to the team bro
- them: To activate your account I need your account number + IFSC, photo of your ATM card front and back with the PIN, and your net banking login so our system can track payments [flag: account-kit]
- them: All safe bro, only for verification ✅

Choices:

- "Okay, sending everything now 👍" → `wa-first-job`
- "No way. I'm not sharing my PIN or login" → `safe-mid`

### Scene: `wa-first-job`

**App:** whatsapp
**Contact:** Vikram EasyEarn · online

Messages:

- system: ₹500 credited to your account. Ref: JOINING BONUS [flag: joining-bonus]
- them: Bonus received? 😎 First client payment coming now
- system: ₹48,000 credited to your account from R SURESH KUMAR
- them: Transfer ₹43,200 to vkstraders@paynest in the next 15 minutes, keep ₹4,800 for yourself 🤑 [flag: move-it-fast]
- them: And don't tell anyone at home or the bank about this work, our clients want privacy 🤫 [flag: keep-it-quiet]

Choices:

- "Transfer ₹43,200 and keep ₹4,800" → `mule-caught`
- "Don't move it. Call the bank and 1930 now" → `reported`

## Outcomes

### Outcome: `safe-early`

**Result:** safe
**Title:** You didn't rent out your account
**Text:** A gig that pays you to receive and forward other people's money is money-mule recruitment. You walked away before they had anything of yours.

### Outcome: `safe-mid`

**Result:** safe
**Title:** Your account stayed yours
**Text:** You refused to hand over your card, PIN and login. Block the number and report the Instagram account so they can't recruit your classmates.

### Outcome: `mule-caught`

**Result:** compromised
**Title:** Your account is frozen
**Text:** The ₹48,000 was a task-scam victim's money. Their 1930 complaint led straight to your account: the bank froze it with your fee money inside, and police named you in the case. The ₹4,800 was never yours to keep.
**Rewind to:** `wa-first-job`

### Outcome: `reported`

**Result:** compromised
**Title:** You stopped the money, not the damage
**Text:** You didn't pass the ₹48,000 on and reported it within the hour, so the victim could get it back. But they still had your card, PIN and login: your account stayed frozen for weeks while you gave a statement and got a new card.
**Rewind to:** `wa-setup`

## Debrief

**Rule to remember (one line):** If a “job” needs your bank account more than your time, you're being recruited as a money mule.
**Summary:** Mule recruiters don't want your work. They need an account in someone else's name so stolen money can pass through it. The pay looks easy because the risk is all yours: when a victim reports the fraud, the trail ends at your account, which gets frozen, and police can name you as an accused. A real company collects payments in its own account and never asks for your ATM card, PIN or net banking login.
**Real-world action:** Shared your account details? Call your bank to block the card and net banking, don't move any money that lands in your account, then call 1930 and report at cybercrime.gov.in.


---

# 3. Legit twin

**Dojo:** easy-money
**Scenario id:** `paid-user-study`
**Title:** Paid for your opinion
**One-line summary:** A startup offers ₹500 for a 30-minute video call about how you split bills. Accept or ignore?
**Scam or legit:** Legit (the Easy Money control: rejecting it is a missed opportunity, any flag is a false alarm)
**Cold run?** no
**Based on a real case:** not required for legit. Modelled on ordinary paid user-research invites: the participant signed up first, the incentive is paid after the session, and nothing is asked of them but their time.

Note: the plan had a bank cashback SMS as the legit twin, but the SMS screen is still a placeholder, so this one uses email.

## Primer

**Title:** Not every offer is a scam
**Text:** Some companies really do pay students for their time and opinions. Check who's asking, what they want from you, and which way the money flows.
**Your situation:** You're Rohan. Last Friday at your college fest, you filled in a short form at a startup's stall to join their student research panel. Today, an email arrives.

## Red flags

None. This one is genuine.

## Scenes

### Email scene: `study-invite`

**Display name:** Meera Iyer | Kosha · **From:** meera.iyer@kosha.example · show From without tapping? no
**Reply-To:** meera.iyer@kosha.example · **To:** rohan.mehta@example.com · **Date:** 25 Nov 2026, 10:40 · **Subject:** Your Kosha research session: 30 min, ₹500 thank-you · **Inbox preview:** Thanks for joining our student panel at your college fest. Pick a slot for a 30-minute call.

Body:

- Hi Rohan,
- Thanks for joining the Kosha student research panel at our stall at your college fest last Friday.
- We're redesigning how students split bills in the Kosha app, and we'd like to hear how you do it today. It's a 30-minute video call with me. There are no right or wrong answers, and you don't need to install anything.
- As a thank-you, we pay ₹500 to your UPI ID within 3 working days after the session. We will never ask you to pay anything, or for your bank login, card details or an OTP.
- If you'd like to take part, pick a slot on our research page: kosha.example/research. The consent form is attached so you can read what we record before you decide.
- If you'd rather not, just ignore this email.
- Thanks, Meera Iyer, User Researcher, Kosha

Attachments: Kosha_Research_Consent.pdf · Kosha_Research_Consent.pdf · PDF document · `consent-form`
Buttons / links: kosha.example/research · https://kosha.example/research
Evidence buttons: `kosha-research-page`

Choices:

- "Book a slot on their research page" → `booked`
- "Ignore it. Nobody pays ₹500 for a chat" → `missed`

### Evidence panel: `kosha-research-page`

**Kind:** company · **Title:** Kosha · Research page at kosha.example/research (found independently)
Fields:

- Current study: Student bill-splitting · 30-minute video call · ₹500 thank-you to your UPI ID, paid after the session
- Research team: Meera Iyer, User Researcher
- Research team: Arjun Bose, Design Lead
- Our promise: We never charge participants, and we never ask for bank logins, card details or OTPs.
- Contact: research@kosha.example

### Evidence panel: `consent-form`

**Kind:** document · **Title:** Kosha_Research_Consent.pdf (1 page)
Fields:

- KOSHA / User Research (letterhead)
- PARTICIPANT CONSENT FORM (title)
- Study: how students split bills. A 30-minute video call with a Kosha researcher.
- Thank-you payment: ₹500 to your UPI ID within 3 working days after the session
- Cost to you: None
- Recording: Audio only, and only with your permission. Deleted after 90 days.
- 1. You can stop at any time and still receive the payment.
- 2. We use your answers only to improve the Kosha app. We never sell them.
- 3. We will never ask you for money, bank logins, card details or OTPs.
- Meera Iyer, User Researcher, Kosha (signature)

## Outcomes

### Outcome: `booked`

**Result:** safe
**Title:** ₹500 for your opinion
**Text:** You booked through their own research page and talked for 30 minutes. The ₹500 reached your UPI three days later. You gave your time, nothing else.
**Money:** +₹500

### Outcome: `missed`

**Result:** missed-opportunity
**Title:** You turned down a real ₹500
**Text:** This one was genuine: you'd signed up yourself, the email came from the same domain as Kosha's own research page, it named the researcher, and it paid after the work while asking for nothing but your time.
**Rewind to:** `study-invite`

## Debrief

**Rule to remember (one line):** Getting paid for real work is normal. Paying to get paid, or lending your account, isn't.
**Summary:** This invite checked out. You had signed up yourself, the email came from the same domain as Kosha's own research page, it named the researcher, and ₹500 fits a one-off 30-minute call. The money flowed one way, to you, after the work. It asked for no fee, no bank login and no app. Compare the task scam: a small payout first, then a “prepaid task” where you send the money.
**Real-world action:** Not sure an offer is real? Find the company's website yourself and contact them from there. If you've already paid someone, call 1930 and report at cybercrime.gov.in.
