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
