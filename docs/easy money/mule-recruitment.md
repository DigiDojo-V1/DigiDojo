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
