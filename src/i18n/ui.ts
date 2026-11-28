import type { Tactic } from "@/engine/schema";
import type { Locale } from "./locale";

/**
 * Every player-facing string the components show, outside scenario data.
 *
 * `en` is the source of truth: it must have every key, and a key it lacks is a type error
 * wherever it's used. `hinglish` may be partial; missing keys fall back to `en`.
 * Values are plain strings, or small functions when the text needs a number or a name.
 */

type TacticKey = `tactic.${Tactic}.label` | `tactic.${Tactic}.explanation`;
type UiValue = string | ((...args: never[]) => string);

const en = {
  // Shared
  "nav.back": "Back",
  "nav.backToHome": "Back to home",
  "nav.backToDojo": "Back to dojo",
  "language.label": "Language",
  "simulation.badge": "Simulation",
  "simulation.badgeAria": "This is a simulation",

  // Landing page (/)
  "landing.brand": "DigiDojo",
  "landing.menu": "Menu",
  "landing.menu.close": "Close",
  "landing.menu.openApp": "Open the app",
  "landing.rail.aria": "Where you are on the page",
  "landing.section.home": "Home",
  "landing.section.why": "Why",
  "landing.section.numbers": "By the numbers",
  "landing.section.wave": "So far",
  "landing.section.learn": "What you'll spot",
  "landing.section.dojos": "Dojos",
  "landing.section.app": "DigiDojo",
  "landing.section.help": "1930",
  "landing.hero.word1": "Digi",
  "landing.hero.word2": "Dojo",
  "landing.hero.eyebrow": "Scam simulator · for 15–25",
  "landing.hero.blurb":
    "Scam season is open. Practise against real scams inside fake versions of the apps they happen in.",
  "landing.hero.scroll": "Scroll to explore",
  "landing.why.eyebrow": "Why it matters",
  "landing.why.title1": "One tap",
  "landing.why.title2": "from a scam",
  "landing.why.body":
    "We grew up on our phones, but nobody taught us how scams work. They arrive as a friendly DM, a dream internship, a call from “the police” or a friend who needs money fast. They rush you, flatter you and pay you a little first. Spotting them is a skill, and skills take practice.",
  "landing.why.phone.contact": "Priya · HR",
  "landing.why.phone.status": "online",
  "landing.why.phone.msg1": "Hi! Saw your profile 😊",
  "landing.why.phone.msg2": "Part-time work from home. Earn ₹3,000/day just by liking videos.",
  "landing.why.phone.msg3": "No experience needed. Interested?",
  "landing.why.phone.reply": "Yes, interested!",
  "landing.numbers.lost.label": "Lost to cyber fraud in 2025",
  "landing.numbers.lost.unit": "Cr",
  "landing.numbers.complaints.label": "Fraud complaints in 2025, about 6,600 a day",
  "landing.numbers.complaints.unit": "lakh",
  "landing.numbers.report.label": "Of 15–24 year-olds know how to report cyber fraud",
  "landing.wave.title": "The scam wave",
  "landing.wave.subtitle": "So far",
  "landing.year.2021": "Where it starts",
  "landing.year.2022": "4× the money",
  "landing.year.2023": "Complaints double",
  "landing.year.2024": "3× the money, again",
  "landing.year.2025": "Now",
  "landing.year.body": (lakh: string, crore: string) =>
    `${lakh} lakh fraud complaints. ₹${crore} crore reported lost.`,
  "landing.year.poll": "Tap 👍 if you've had a message like this",
  "landing.year.pollYes": "Yes, I have",
  "landing.year.pollNo": "No, not yet",
  "landing.year.pollThanks": "You're not alone. Next time, you'll spot it.",
  "landing.pretend.eyebrow": "Who they pretend to be",
  "landing.pretend.line1": "HR recruiter",
  "landing.pretend.line2": "Your best friend",
  "landing.pretend.line3": "Cyber police officer",
  "landing.pretend.line4": "Anyone you trust",
  "landing.pretend.stat":
    "90% of rural 14–18 year-olds used social media last week. Only half of them know how to block or report a profile.",
  "landing.pretend.sticker.name": "Priya Sharma",
  "landing.pretend.sticker.role": "Talent Lead · NovaHire",
  "landing.pretend.sticker.badge": "Verified recruiter",
  "landing.pretend.tag": "Fake",
  "landing.learn.title": "What you'll spot",
  "landing.learn.caption": "The tricks behind the scams",
  "landing.dojos.title1": "Four",
  "landing.dojos.title2": "Dojos",
  "landing.dojos.caption": "Four dojos · more soon",
  "landing.dojos.enter": "Enter dojo",
  "landing.dojos.soon": "Coming soon",
  "landing.dojos.imageAlt": (name: string) => `A scenario from the ${name} dojo`,
  "landing.app.pill": "The app",
  "landing.app.wordmark": "DigiDojo",
  "landing.app.headlineA": "The",
  "landing.app.headlineEm": "scam",
  "landing.app.headlineB": "simulator for India's 15–25s.",
  "landing.app.body":
    "Live through the scams that target you, inside fake chat, SMS, UPI, call and email screens. Make the calls, flag the red flags, rewind when you slip, and get a debrief on every trick.",
  "landing.app.meta": "Free · no sign-up · about 3 min a scenario",
  "landing.app.cta": "Enter the dojo",
  "landing.app.videoLabel": "A scenario playing in DigiDojo",
  "landing.finale.title": "Don't take the bait",
  "landing.finale.help": "Lost money? Call",
  "landing.finale.number": "1930",
  "landing.finale.copy": "Copy number",
  "landing.finale.copied": "Copied",
  "landing.finale.report": "or report at cybercrime.gov.in",
  "landing.footer.sources": "Sources",
  "landing.footer.openApp": "Open the app",
  "landing.footer.simulation": "Simulation only · all names fictional",
  "landing.footer.copyright": "© 2026 DigiDojo",
  "landing.sources.title": "Sources",
  "landing.sources.intro":
    "Every figure on this page comes from a public source. Derived figures (like “about 6,600 a day”) are our own arithmetic on these.",
  "landing.source": (source: string) => `Source: ${source}`,

  // Home
  "home.title": "DigiDojo",
  "home.scenarioCount": (n: number) => `${n} scenario${n === 1 ? "" : "s"}`,
  "home.start": "Start",
  "home.comingSoon": "Coming soon",
  "home.carousel": "Dojos",
  "home.prev": "Previous dojo",
  "home.next": "Next dojo",
  "home.slide": (i: number, n: number) => `Dojo ${i} of ${n}`,
  "home.counter": (i: number, n: number) =>
    `${String(i).padStart(2, "0")} / ${String(n).padStart(2, "0")}`,
  "home.goTo": (name: string) => `Show ${name}`,

  // Progress
  "progress.completed": "Completed",
  "progress.notCompleted": "Not completed",
  "progress.dojoAria": "Dojo progress",

  // Dojo page
  "dojo.eyebrow": (order: number) => `Dojo ${order}`,
  "dojo.empty": "No scenarios yet.",
  "dojo.takeaways": "What to remember",
  "dojo.scenarios": "Scenarios",

  // 404
  "notFound.body": "We couldn't find this page.",

  // App chrome
  "chrome.progressBody": (done: number, total: number) =>
    `${done} of ${total} scenario${total === 1 ? "" : "s"} done`,
  "chrome.how1": "Live through a real scam inside a fake app.",
  "chrome.how2": "Flag anything suspicious, then make your call.",
  "chrome.how3": "See what you caught, and what you missed, in the debrief.",
  "chrome.helpBody": "Call 1930 right away and report it at cybercrime.gov.in.",

  // Dojo panel (the side panel next to a fake app on wide screens)
  "panel.label": "Dojo controls",
  "panel.instructions":
    "Click any sentence that looks suspicious. Use the flag next to details like addresses, links and files.",
  "panel.waiting": "Read carefully. Your options appear here when it's time to decide.",
  "panel.flagged": (n: number) => `${n} flagged`,
  "panel.exit": "Exit simulation",

  // Fake app chrome on wide screens (decorative)
  "desktop.search": "Search",
  "desktop.chats": "Chats",
  "desktop.messages": "Messages",
  "desktop.typeMessage": "Type a message",
  "desktop.focused": "Focused",
  "desktop.other": "Other",
  "desktop.navHome": "Home",
  "desktop.navNetwork": "My Network",
  "desktop.navJobs": "Jobs",
  "desktop.navMessaging": "Messaging",
  "desktop.navNotifications": "Notifications",
  "desktop.navMe": "Me",

  // Instagram (decorative app chrome; the inbox rows are fictional people)
  "ig.appName": "Instagram",
  "ig.navHome": "Home",
  "ig.navSearch": "Search",
  "ig.navExplore": "Explore",
  "ig.navReels": "Reels",
  "ig.navNotifications": "Notifications",
  "ig.navCreate": "Create",
  "ig.navProfile": "Profile",
  "ig.navMore": "More",
  "ig.myHandle": "rohan.k_07",
  "ig.requests": "Requests",
  "ig.messagePlaceholder": "Message...",
  "ig.viewProfile": "View profile",
  "ig.activeNow": "Active now",
  "ig.seen": "Seen",
  "ig.now": "now",
  "ig.inbox1.name": "Emily Carter",
  "ig.inbox1.preview": "sent a reel by college.memes",
  "ig.inbox1.time": "1h",
  "ig.inbox2.name": "IIMB UG",
  "ig.inbox2.preview": "Karan: who has the accounts notes?",
  "ig.inbox2.time": "3h",
  "ig.inbox3.name": "Rahul Verma",
  "ig.inbox3.preview": "Liked a message",
  "ig.inbox3.time": "1d",
  "ig.inbox4.name": "Kabir Mehta",
  "ig.inbox4.preview": "haha same. match on sunday?",
  "ig.inbox4.time": "2d",
  "ig.inbox5.name": "The Chai Corner",
  "ig.inbox5.preview": "Thanks for the review! See you soon ☕",
  "ig.inbox5.time": "5d",
  "ig.inbox6.name": "Sneha Iyer",
  "ig.inbox6.preview": "You: ok see you at 4",
  "ig.inbox6.time": "1w",
  "ig.inbox7.name": "Arjun",
  "ig.inbox7.preview": "Sent you a message",
  "ig.inbox7.time": "2w",

  // Telegram (decorative app chrome; the other chats are fictional people)
  "tg.search": "Search",
  "tg.messagePlaceholder": "Message",
  "tg.today": "Today",
  "tg.lastSeenRecently": "last seen recently",
  /** A message's time from minutes after midnight, e.g. 1182 → "7:42 PM". */
  "tg.time": (minutes: number) => {
    const h = Math.floor(minutes / 60) % 24;
    const m = String(minutes % 60).padStart(2, "0");
    return `${h % 12 === 0 ? 12 : h % 12}:${m} ${h < 12 ? "AM" : "PM"}`;
  },
  "tg.chat1.name": "Telegram",
  "tg.chat1.preview": "Welcome to Telegram! 👋",
  "tg.chat1.time": "Mon",
  "tg.chat2.name": "Saved Messages",
  "tg.chat2.preview": "📷 Photo",
  "tg.chat2.time": "Sun",
  "tg.chat3.name": "Mummy",
  "tg.chat3.preview": "Did you eat? Call me when free",
  "tg.chat3.time": "6:58 PM",
  "tg.chat4.name": "B.Com 2nd Year (Sec B)",
  "tg.chat4.preview": "Priya: Accounts assignment due Friday",
  "tg.chat4.time": "5:20 PM",
  "tg.chat5.name": "Aditya Rao",
  "tg.chat5.preview": "ok sending the eco notes now",
  "tg.chat5.time": "Yesterday",
  "tg.chat6.name": "Campus Memes",
  "tg.chat6.preview": "🖼 Photo",
  "tg.chat6.time": "Yesterday",

  // Primer
  "primer.start": "Start simulation",
  "primer.howToPlay": "How to play",
  "primer.step1": "Play it out in the fake app, as if it's really happening to you.",
  "primer.step2": "Tap anything suspicious to flag it. Some messages are genuine.",
  "primer.step3": "Make your call, then see what you caught in the debrief.",

  // How to play
  "howto.title": "How to play",
  "howto.skip": "Skip",
  "howto.next": "Next",
  "howto.ready": "I'm ready",
  "howto.stepOf": (n: number, total: number) => `Step ${n} of ${total}`,
  "howto.practice": "Practice",
  "howto.sender": "Lucky Draw Desk",
  "howto.scamMessage":
    "Congrats!! 🎉 Your number won ₹50,000 in our lucky draw. To claim it, pay a ₹499 processing fee today.",
  "howto.highlight.title": "Spot it. Tap it.",
  "howto.highlight.body": "Something in this message is off. Tap the sentence that gives it away.",
  "howto.highlight.tryIt": "Your turn: find the giveaway.",
  "howto.highlight.miss": "Close! Look at what they want from you before you get the prize.",
  "howto.why.title": "Say why",
  "howto.why.body":
    "Every flag asks why it's suspicious. Pick the reason that fits best. You can also write it in your own words for bonus points.",
  "howto.why.tap": "Tap your flagged words to choose a reason.",
  "howto.why.right": "Nailed it. Real prizes never charge you a fee to collect them.",
  "howto.why.wrong":
    "Not quite. The giveaway is paying to receive money: real prizes never charge a fee.",
  "howto.why.secret":
    "In the real thing, nobody tells you if you're right. Everything is scored at the end.",
  "howto.mixed.title": "Not everything is a scam",
  "howto.mixed.body":
    "Some messages are genuine, and flagging them costs you points. What about these two?",
  "howto.mixed.fine": "Looks fine",
  "howto.mixed.suspicious": "Suspicious",
  "howto.mixed.legitSender": "Campus Placement Cell",
  "howto.mixed.legitText":
    "Hi! Your interview with the hiring panel is confirmed for Thursday, 3 pm, Room 204. Reply here if you need to reschedule.",
  "howto.mixed.scamSender": "Unknown number",
  "howto.mixed.scamText":
    "Your account will be blocked in 2 hours. Share the OTP you just received to keep it active.",
  "howto.mixed.legitRight": "Right. A normal interview message: no money, no rush, no secrets.",
  "howto.mixed.legitWrong":
    "This one is genuine. Nothing is asked of you except to turn up. Flagging it would be a false alarm.",
  "howto.mixed.scamRight": "Right. A deadline plus a request for your OTP is a classic trap.",
  "howto.mixed.scamWrong":
    "Look again: a 2-hour deadline and a request for your OTP. Nobody genuine ever asks for an OTP.",
  "howto.mixed.lesson": "Train your judgement, not paranoia. False alarms cost points.",
  "howto.recap.title": "Dig, decide, debrief",
  "howto.recap.dig": "Dig for clues",
  "howto.recap.digBody":
    "Tap buttons like View profile or Check careers page. Some clues only show up there.",
  "howto.recap.decide": "Make your call",
  "howto.recap.decideBody": "Pick a reply at each step. Every choice has a consequence.",
  "howto.recap.debrief": "Rewind and learn",
  "howto.recap.debriefBody":
    "Slipped up? Rewind to the moment it went wrong. Then see every red flag you caught or missed.",
  "howto.recap.scoring": "Scoring",
  "howto.recap.right": "right reason",
  "howto.recap.bonus": "good explanation",
  "howto.recap.falseAlarm": "false alarm",

  // Thread
  "thread.prompt": "What do you do?",
  "thread.hint":
    "Spot something off? Select the words (drag, or tap word by word), then flag them.",
  "chat.typing": (sender?: string) => (sender ? `${sender} is typing…` : "typing…"),
  "chat.typingAria": "typing",
  "chat.flagAria": (text: string) => `Flag message: ${text}`,
  "chat.unflagAria": (text: string) => `Unflag message: ${text}`,
  "shell.comingSoon": (name: string) => `Coming soon: ${name} shell`,
  "thread.evidenceHint": "Check before you decide:",
  "chat.you": "You",
  "chat.sent": "Sent",
  "chat.more": "More options",
  "chat.viewProfile": (name: string) => `View ${name}'s profile`,
  "chat.call": "Voice call",
  "chat.videoCall": "Video call",
  "voice.play": "Play voice note",
  "voice.stop": "Stop voice note",
  "voice.label": (length: string) => `Voice note, ${length}`,
  "voice.transcript": "Transcript",
  "composer.suggested": "Suggested replies",
  "composer.placeholder": "Write a message…",
  "split.messages": "Messages",
  "split.evidence": "Recruiter & company",
  "split.flaggedBadge": (n: number) => `${n} flagged`,
  "split.hint": "Scroll through the profile and the company's own information before you decide.",
  "transition.title": "Conversation moved",
  "transition.body": (name: string, from: string, to: string) =>
    `${name} asked you to leave the ${from} and continue in a ${to}.`,
  "channel.whatsapp": "private chat app",
  "channel.telegram": "messaging app",
  "channel.instagram": "social media app",
  "channel.linkedin": "job network",
  "channel.sms": "text messages",
  "channel.upi": "payment app",
  "channel.call": "phone call",
  "channel.gmail": "email",
  "channel.inbox": "inbox",

  // Calls (scripted and live)
  "call.incoming": "Incoming call",
  "call.incomingVideo": "Incoming video call",
  "call.answer": "Answer",
  "call.answerVoice": "Answer with your voice",
  "call.answerText": "Answer without mic (reply options)",
  "call.decline": "Decline",
  "call.hangUp": "Hang up",
  "call.mute": "Mute",
  "call.unmute": "Unmute",
  "call.captions": "Captions",
  "call.details": "My details",
  "call.flag": "Flag",
  "call.speaking": "speaking…",
  "call.listening": "Listening…",
  "call.connecting": "Connecting…",
  "call.ringing": "Ringing…",
  "call.youSaid": "You",
  "call.whatDoYouSay": "What do you say?",
  "call.voiceOn": "Caller voice on",
  "call.voiceOff": "Caller voice off",
  "call.cameraOff": "Your camera is off",
  "call.rec": "REC",
  "call.captionsEmpty": "Captions appear here when someone speaks.",
  "call.before.title": "Before you answer",
  "call.before.ai":
    "An AI plays the caller and talks with you in real time. Say whatever you'd really say.",
  "call.before.details":
    "Use the made-up details on your card if you choose to share any. Never say your real ones.",
  "call.before.earphones": "Earphones work best, so the caller doesn't hear itself.",
  "call.before.privacy":
    "Your voice goes to Google's Gemini to run the call. DigiDojo doesn't store it.",
  "call.voiceUnavailable":
    "Live voice calls are off right now. You'll take this call with reply options instead.",
  "call.micDenied":
    "We couldn't use your microphone. Allow mic access and try again, or answer with reply options.",
  "call.failed": "The call couldn't connect.",
  "call.retry": "Try again",
  "call.useScripted": "Continue with reply options",
  "call.ended": "Call ended",
  "call.endedByYou": "You hung up.",
  "call.endedByCaller": "The caller hung up.",
  "call.endedTimeout": "The call timed out.",
  "call.endedError": "The call dropped.",
  "call.analysing": "Reviewing your call…",
  "call.continue": "Continue",
  "call.persona.title": "Your details (made up)",
  "call.persona.note": "Only for this simulation. Never say your real details.",
  "call.persona.name": "Name",
  "call.flag.title": "What's off about what they just said?",
  "call.flag.nothingYet": "Wait for the caller to say something first.",
  "call.flag.saved": "Flagged. You'll see how you did at the end.",
  "call.flag.count": (n: number) => `${n} flagged`,
  "call.notification.now": "now",
  "call.notification.sms": "Messages",
  "call.notification.whatsapp": "Chat app",
  "call.notification.open": "Open",
  "call.payment.title": "Payment request",
  "call.payment.to": "To",
  "call.payment.pay": (amount: string) => `Pay ${amount}`,
  "call.payment.decline": "Decline",
  "call.payment.paid": "Payment sent",
  "call.payment.declined": "Request declined",
  "call.payment.sim": "Simulated payment. No real money moves.",
  "call.lifeline.button": (name: string) => `Message ${name}`,
  "call.lifeline.title": (name: string) => `Quietly message ${name}`,
  "call.lifeline.send": "Send",
  "call.lifeline.sent": "Sent",
  "call.lifeline.close": "Back to the call",
  "call.timer": (seconds: number) =>
    `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`,

  // Call report (debrief)
  "report.title": "Your call",
  "report.rating": (rating: string) => `${rating}/10`,
  "report.band.vulnerable": "Highly vulnerable",
  "report.band.moderate": "Moderately safe",
  "report.band.savvy": "Scam-savvy",
  "report.good": "What you did well",
  "report.mistakes": "Where it went wrong",
  "report.better": "Do this next time",
  "report.transcript": "Call transcript",
  "report.caller": "Caller",
  "report.you": "You",
  "report.pending": "Reviewing your call…",
  "report.notAnalysed":
    "We couldn't review the call in detail this time, so this is a rough rating.",
  "report.duration": (time: string) => `Call length ${time}`,

  // Mail
  "mail.inbox": "Inbox",
  "mail.reply": "Reply",
  "mail.hint": "Select words in the email, or tap the flag next to a detail, to flag it.",
  "mail.from": "From",
  "mail.replyTo": "Reply-To",
  "mail.to": "To",
  "mail.toMe": "to me",
  "mail.tapSender": "Tap the sender to see the full details",
  "mail.inspectLinkHint":
    "Hover over or tap a link to see where it really goes (nothing will open)",
  "mail.fileName": "File",
  "mail.fileType": "Actual type:",
  "mail.openDocument": "Open preview",
  "compose.subject": "Subject",
  "compose.from": "From",
  "mail.appName": "Gmail",
  "mail.search": "Search in mail",
  "mail.primary": "Primary",
  "mail.promotions": "Promotions",
  "mail.social": "Social",
  "mail.updates": "Updates",
  "mail.labels": "Labels",
  "mail.replyAll": "Reply all",
  "mail.subject": "subject",
  "mail.scannedBy": "Scanned by Gmail",
  "mail.addToDrive": "Add to Drive",
  "mail.addAllToDrive": "Add all to Drive",
  "mail.download": "Download",
  "mail.range": (from: number, to: number, total: number) => `${from}–${to} of ${total}`,
  "mail.position": (n: number, total: number) => `${n} of ${total}`,
  "mail.starred": "Starred",
  "mail.snoozed": "Snoozed",
  "mail.sent": "Sent",
  "mail.drafts": "Drafts",
  "mail.more": "More",
  "mail.forward": "Forward",
  "mail.newMessage": "New message",
  "mail.send": "Send",
  "mail.compose": "Compose",
  "mail.inboxLabel": "Inbox",
  "mail.details": "Details",
  "mail.date": "Date",
  "mail.verify": "Verify independently:",
  "mail.attachments": (n: number) => (n === 1 ? "One attachment" : `${n} attachments`),
  "mail.showDetails": "Show sender details",
  "mail.hideDetails": "Hide sender details",

  // Flagging sentences
  "highlight.flagged": "Flagged",
  "highlight.flagSentence": "Flag this sentence",
  "highlight.openFlag": "Flagged sentence. Open to change or remove the flag.",
  "flag.why": "Why is this suspicious?",
  "flag.noteLabel": "In your own words",
  "flag.noteLabelOr": "Or say it in your own words",
  "flag.noteOptional": "(bonus points)",
  "flag.notePlaceholder": "What makes this look like a scam?",
  "flag.notePrivacy": "Don't type personal details.",
  "flag.pickReason": "Pick a reason to save this flag.",
  "flag.pickOrExplain": "Pick a reason, or explain it yourself.",
  "flag.save": "Flag it",
  "flag.update": "Save",
  "flag.remove": "Remove",
  "flag.close": "Close",

  // Evidence panels
  "evidence.close": "Close",
  "evidence.hint": "Tap the flag next to anything that looks wrong.",
  "evidence.kind.profile": "Profile",
  "evidence.kind.company": "Company",
  "evidence.kind.web-page": "Web page",
  "evidence.kind.document": "Document",
  "evidence.open.profile": "View profile",
  "evidence.open.company": "Company page",
  "evidence.open.record": "Company record",
  "evidence.open.web-page": "Careers site",
  "evidence.open.document": "Open document",
  "evidence.checked": "Checked",
  "evidence.about": "About",
  "evidence.intro": "Intro",
  "evidence.record.heading": "Official company record",
  "evidence.record.note": "Public registry extract (simulated)",
  "evidence.company.about": "Company details",
  "evidence.browser.secure": "Secure connection",
  "evidence.browser.address": "Address",
  "evidence.pdf.page": (n: number, total: number) => `Page ${n} of ${total}`,
  "evidence.pdf.pages": (n: number) => `${n} page${n === 1 ? "" : "s"}`,
  "evidence.pdf.badge": "PDF",
  "evidence.pdf.pageWord": "Page",
  "evidence.pdf.menu.file": "File",
  "evidence.pdf.menu.view": "View",
  "evidence.pdf.menu.tools": "Tools",
  "evidence.pdf.menu.help": "Help",
  "evidence.pdf.editWith": "Edit with",
  "evidence.pdf.download": "Download",
  "evidence.pdf.print": "Print",
  "evidence.pdf.fullscreen": "Full screen",
  "evidence.pdf.zoomIn": "Zoom in",
  "evidence.pdf.zoomOut": "Zoom out",
  "evidence.pdf.prev": "Previous page",
  "evidence.pdf.next": "Next page",

  // Inbox triage
  "triage.hint": "Open each email and label it. You can inspect senders and attachments first.",
  "triage.prompt": "How would you label this email?",
  "triage.legit": "Legit",
  "triage.scam": "Scam",
  "triage.needs-checking": "Needs checking",
  "triage.unlabelled": "Not labelled",
  "triage.backToInbox": "Back to inbox",
  "triage.submit": "Submit labels",
  "triage.progress": (done: number, total: number) => `${done} of ${total} labelled`,

  // Outcome
  "outcome.safe": "Safe",
  "outcome.loss": "Money lost",
  "outcome.partial-loss": "Partial loss",
  "outcome.compromised": "Compromised",
  "outcome.missed-opportunity": "Missed opportunity",
  "outcome.rewind": "Rewind to where you could have stopped",
  "outcome.seeDebrief": "See debrief",

  // Debrief
  "debrief.eyebrow": "Debrief",
  "debrief.caughtSummary": (caught: number, seen: number) =>
    `You caught ${caught} of ${seen} red flags you saw.`,
  "debrief.noFlags": "There were no red flags on the path you took.",
  "debrief.falseAlarmSummary": (n: number) =>
    `${n} false alarm${n === 1 ? "" : "s"}: you flagged messages that were fine.`,
  "debrief.caught": "Caught",
  "debrief.missed": "Missed",
  "debrief.missedNone": "None. You spotted every red flag you saw.",
  "debrief.falseAlarms": "False alarms",
  "debrief.falseAlarmNote":
    "This one was fine. Being careful is good, but suspecting everything means missing real chances.",
  "debrief.notReached": (n: number) =>
    `Bonus: ${n} red flag${n === 1 ? "" : "s"} on paths you didn't take`,
  "debrief.notReachedNote":
    "These were on routes you didn't play. They don't count toward your score. Play again to try them.",
  "debrief.notReachedTag": "Not on your path",
  "debrief.notInspected": "You didn't check",
  "debrief.notInspectedNote": "These were one tap away. Inspect before you decide.",
  "debrief.triage": "Inbox labels",
  "debrief.triageScore": (right: number, total: number) =>
    `You labelled ${right} of ${total} emails correctly.`,
  "debrief.triageYouSaid": "You said",
  "debrief.triageAnswer": "Answer",
  "debrief.where.message": "Message",
  "debrief.where.email-body": "Email text",
  "debrief.where.from": "From address",
  "debrief.where.reply-to": "Reply-To address",
  "debrief.where.to": "Reply goes to",
  "debrief.where.attachment": "Attachment",
  "debrief.where.link": "Button or link",
  "debrief.where.panel-field": "Profile or record",
  "debrief.where.fine-print": "Fine print",
  "debrief.where.call": "On the call",
  "debrief.spotted": "Spotted, wrong reason",
  "debrief.spottedNote": "You found it, but the trick behind it was different.",
  "debrief.youFlagged": "You flagged",
  "debrief.yourReason": "Your reason",
  "debrief.ownWords": "Your own words",
  "debrief.rightReason": "The trick",
  "debrief.yourNote": "You wrote",
  "debrief.judgePending": "Checking your explanation…",
  "debrief.judgeError": "We couldn't check your explanation this time.",
  "debrief.judge.good": "Great explanation (+1)",
  "debrief.judge.partial": "Partly right",
  "debrief.judge.off": "Not quite",
  "score.title": "Your score",
  "score.points": (points: number, max: number) => `${points} / ${max} points`,
  "score.accuracy": (caught: number, total: number, falseAlarms: number) =>
    `${caught} of ${total} red flags · ${falseAlarms} false alarm${falseAlarms === 1 ? "" : "s"}`,
  "score.pathOnly": "Scored only on the red flags on the path you played.",
  "score.howItWorks":
    "Right reason (or a spot-on explanation) +3 · wrong reason +1 · false alarm −1 · good explanation +1",
  "rank.rookie": "Rookie",
  "rank.sharp": "Sharp",
  "rank.scam-proof": "Scam-proof",
  "debrief.rule": "Rule to remember",
  "debrief.playAgain": "Play again",

  // Tactics: a short label and one line the debrief shows under each red flag.
  "tactic.small-win-first.label": "Small win first",
  "tactic.small-win-first.explanation":
    "They pay you a little first, so you'll trust them with a lot.",
  "tactic.pay-to-earn.label": "Pay to earn",
  "tactic.pay-to-earn.explanation":
    "They ask you to pay before you can earn. Real work never works like that.",
  "tactic.urgency.label": "Urgency",
  "tactic.urgency.explanation": "They rush you so you don't stop to think or ask anyone.",
  "tactic.social-proof.label": "Social proof",
  "tactic.social-proof.explanation":
    "Fake members and screenshots make it look like everyone is earning.",
  "tactic.sunk-cost.label": "Sunk cost",
  "tactic.sunk-cost.explanation":
    "Once you've paid, they ask for more to 'unlock' the money you already put in.",
  "tactic.authority.label": "Authority",
  "tactic.authority.explanation":
    "They pose as police, a bank or an officer to scare you into obeying without checking.",
  "tactic.isolation.label": "Isolation",
  "tactic.isolation.explanation": "They tell you to keep it secret, so nobody can warn you.",
  "tactic.too-good-to-be-true.label": "Too good to be true",
  "tactic.too-good-to-be-true.explanation":
    "The money or prize is far more than the work is worth.",
  "tactic.flattery.label": "Flattery",
  "tactic.flattery.explanation":
    "Praise and 'you've been specially selected' make you drop your guard.",
  "tactic.impersonation.label": "Impersonation",
  "tactic.impersonation.explanation": "They pretend to be someone you know or trust.",
  "tactic.no-real-process.label": "No real process",
  "tactic.no-real-process.explanation":
    "No interview, no named people, vague duties: a real employer actually selects you.",
  "tactic.data-harvest.label": "Data harvesting",
  "tactic.data-harvest.explanation":
    "They want your ID, bank details or selfie, which can be misused for fraud or loans.",
  "tactic.malicious-file.label": "Disguised file",
  "tactic.malicious-file.explanation":
    "A file dressed up as a document is really an app that can take over your phone.",
  "tactic.disguised-link.label": "Disguised link",
  "tactic.disguised-link.explanation":
    "The link looks familiar but goes somewhere else. Check the real destination.",
  "tactic.fear.label": "Fear",
  "tactic.fear.explanation":
    "A shock first (an FIR, a frozen account, arrest) so panic takes over before you think.",
  "tactic.blocks-verification.label": "Blocks checking",
  "tactic.blocks-verification.explanation":
    "They talk you out of hanging up, visiting the branch or calling the official number, because checking would expose them.",
  "tactic.fake-proof.label": "Fake proof",
  "tactic.fake-proof.explanation":
    "An ID number, a badge, a stamped PDF or your own details read back to you proves nothing. Anyone can fake them.",
  "tactic.secret-code.label": "Asks for a code",
  "tactic.secret-code.explanation":
    "An OTP, PIN or CVV is the key to your money. No bank, police officer or company ever asks you to read one out.",
  "tactic.small-ask.label": "Small ask first",
  "tactic.small-ask.explanation":
    "A tiny request (₹10, “just confirm your name”) feels harmless, and every yes makes the next, bigger one easier.",
  "tactic.pay-to-clear.label": "Pay to make it go away",
  "tactic.pay-to-clear.explanation":
    "A “deposit”, “fine” or “fee” to clear a threat. No court, police force or bank settles anything this way.",
} satisfies Record<string, UiValue> & Record<TacticKey, string>;

export type UiDict = typeof en;
export type UiKey = keyof UiDict;

const hinglish: Partial<UiDict> = {
  "notFound.body": "Yeh page nahi mila.",
  "voice.play": "Voice note chalao",
  "voice.stop": "Voice note roko",

  "tactic.small-win-first.explanation":
    "Pehle thode paise dete hain, taaki tum unpe bada bharosa kar lo.",
  "tactic.pay-to-earn.explanation":
    "Kamane se pehle paise bharne ko kehte hain. Asli kaam mein aisa kabhi nahi hota.",
  "tactic.urgency.explanation":
    "Time ka pressure daalte hain taaki tum soch na sako ya kisi se pooch na sako.",
  "tactic.social-proof.explanation":
    "Fake members aur screenshots se lagta hai ki sab kama rahe hain.",
  "tactic.sunk-cost.explanation":
    "Ek baar paise de diye, toh woh 'unlock' karne ke naam pe aur maangte hain.",
  "tactic.authority.explanation":
    "Police, bank ya officer ban ke darate hain taaki tum bina check kiye maan lo.",
  "tactic.isolation.explanation":
    "Kehte hain kisi ko mat batana, taaki koi tumhe warn na kar sake.",
  "tactic.too-good-to-be-true.explanation": "Kaam ke hisaab se paisa ya inaam bahut zyada hai.",
  "tactic.flattery.explanation":
    "Tareef aur 'aap special selected ho' sun ke guard neeche aa jaata hai.",
  "tactic.impersonation.explanation":
    "Kisi jaan-pehchaan wale ya bharosemand insaan ki nakal karte hain.",
};

export const UI_STRINGS: { en: UiDict; hinglish: Partial<UiDict> } = { en, hinglish };

/** The string (or string function) for `key` in `locale`, falling back to English. */
export function translate<K extends UiKey>(locale: Locale, key: K): UiDict[K] {
  if (locale !== "en") {
    const value = UI_STRINGS[locale][key];
    if (value !== undefined) return value as UiDict[K];
  }
  return UI_STRINGS.en[key];
}
