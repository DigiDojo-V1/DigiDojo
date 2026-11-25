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

  // Home
  "home.title": "DigiDojo",
  "home.tagline": "Real scams, fake apps. Practise here, lose nothing.",
  "home.scenarioCount": (n: number) => `${n} scenario${n === 1 ? "" : "s"}`,

  // Progress
  "progress.completed": "Completed",
  "progress.notCompleted": "Not completed",
  "progress.dojoAria": "Dojo progress",

  // Dojo page
  "dojo.eyebrow": (order: number) => `Dojo ${order}`,
  "dojo.empty": "No scenarios yet.",
  "dojo.legit": "Legit",
  "dojo.coldRun": "Cold run",
  "dojo.takeaways": "What to remember",

  // 404
  "notFound.body": "We couldn't find this page.",

  // Primer
  "primer.eyebrow": "The trick",
  "primer.start": "Start simulation",
  "primer.howToPlay": "How to play",
  "primer.setup": "Your situation",
  "primer.watchFor": "Ask yourself",
  "primer.goals": "Your goals",
  "primer.goalSpot": "Spot the red flags",
  "primer.goalCalm": "Avoid false alarms",
  "primer.goalDecide": "Make the right call",
  "primer.someGenuine": "Heads up: some messages are genuine. Don't flag everything.",

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
  "howto.highlight.title": "Spot it. Highlight it.",
  "howto.highlight.body":
    "Something in this message is off. Select those words: drag across them, or tap one word and then another. Then tap Flag this.",
  "howto.highlight.tryIt": "Your turn: find the giveaway.",
  "howto.highlight.miss": "Close! Look at what they want from you before you get the prize.",
  "howto.highlight.tooBig": "Too much. Pick just the few words that give it away.",
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

  // Mail
  "mail.inbox": "Inbox",
  "mail.reply": "Reply",
  "mail.hint": "Select words in the email, or tap the flag next to a detail, to flag it.",
  "mail.from": "From",
  "mail.replyTo": "Reply-To",
  "mail.to": "To",
  "mail.toMe": "to me",
  "mail.tapSender": "Tap the sender to see the full details",
  "mail.inspectLinkHint": "Hover over or tap a link to see where it really goes (nothing will open)",
  "mail.fileName": "File",
  "mail.fileType": "Actual type:",
  "mail.openDocument": "Open preview",
  "compose.subject": "Subject",
  "compose.from": "From",
  "mail.appName": "Mail",
  "mail.search": "Search in mail",
  "mail.primary": "Primary",
  "mail.compose": "Compose",
  "mail.inboxLabel": "Inbox",
  "mail.details": "Details",
  "mail.date": "Date",
  "mail.verify": "Verify independently:",
  "mail.attachments": (n: number) => `${n} attachment${n === 1 ? "" : "s"}`,
  "mail.showDetails": "Show sender details",
  "mail.hideDetails": "Hide sender details",

  // Highlighting and flagging
  "highlight.toolbar": "Selected words",
  "highlight.extendHint": "Drag to change the selection, or tap another word to add more.",
  "highlight.cancel": "Cancel selection",
  "highlight.flagThis": "Flag this",
  "highlight.flagged": "Flagged",
  "highlight.textAria":
    "Message text. Use the arrow keys to pick a word, Shift and arrows to select more, Enter to flag.",
  "flag.why": "Why is this suspicious?",
  "flag.loadingChips": "Finding possible reasons…",
  "flag.noteLabel": "In your own words",
  "flag.noteLabelOr": "Or say it in your own words",
  "flag.noteOptional": "(bonus points)",
  "flag.notePlaceholder": "What makes this look like a scam?",
  "flag.notePrivacy": "Don't type personal details.",
  "flag.pickReason": "Pick a reason to save this flag.",
  "flag.pickOrExplain": "Pick a reason, or explain it yourself.",
  "flag.explainTitle": "What’s off about this?",
  "flag.explainBody": "No hints for this one. Say what the trick is, in your own words.",
  "flag.explainPlaceholder": "What did you notice, and why would it trick someone?",
  "flag.explainHint": (min: number) => `Write at least ${min} characters to save this flag.`,
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
  "evidence.pdf.fit": "Fit",
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
  "debrief.notReached": "On paths you didn't take",
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
} satisfies Record<string, UiValue> & Record<TacticKey, string>;

export type UiDict = typeof en;
export type UiKey = keyof UiDict;

const hinglish: Partial<UiDict> = {
  "home.tagline": "Asli scams, nakli apps. Practice yahin karo, nuksaan kahin nahi.",
  "notFound.body": "Yeh page nahi mila.",

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
