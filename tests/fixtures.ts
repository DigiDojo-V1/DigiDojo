import { resolveSpot, type FlagRecord, type FlagSpot, type JudgeState } from "@/engine/flags";
import { findTarget, targetText } from "@/engine/highlight";
import { ScenarioSchema, type Scenario, type ScenarioInput, type Tactic } from "@/engine/schema";

/**
 * A small valid scenario as an author writes it: plain English strings, no Hinglish.
 * Schema tests clone it and break one rule at a time.
 */
export function validScenarioInput(): ScenarioInput {
  return {
    id: "fixture",
    dojoId: "easy-money",
    title: "Fixture",
    summary: "A test scenario.",
    legit: false,
    primer: { title: "Primer", body: "Watch out." },
    startNodeId: "start",
    nodes: {
      start: {
        kind: "thread",
        app: "whatsapp",
        contact: { name: "Stranger" },
        messages: [
          { id: "m1", from: "them", text: "Hello" },
          { id: "m2", from: "them", text: "Send ₹500 to earn ₹5,000", redFlagId: "pay-first" },
        ],
        choices: [
          { label: "Pay", nextNodeId: "follow-up" },
          { label: "Block", nextNodeId: "safe" },
        ],
      },
      "follow-up": {
        kind: "thread",
        app: "whatsapp",
        contact: { name: "Stranger" },
        messages: [{ id: "m3", from: "them", text: "Only 2 minutes left!", redFlagId: "hurry" }],
        choices: [{ label: "Pay again", nextNodeId: "lost" }],
      },
      safe: { kind: "outcome", result: "safe", title: "Safe", body: "You blocked them." },
      lost: {
        kind: "outcome",
        result: "loss",
        title: "Lost",
        body: "You lost ₹1,000.",
        moneyDelta: -1000,
        rewindToNodeId: "start",
      },
    },
    redFlags: {
      "pay-first": { label: "Pay first", tactic: "pay-to-earn", explanation: "Pay to earn." },
      hurry: { label: "Hurry", tactic: "urgency", explanation: "Fake deadline." },
    },
    debrief: { rule: "Never pay to earn.", realWorldAction: "Call 1930." },
  };
}

/** The same scenario after parsing: every text field is `{ en }`. */
export function validScenario(): Scenario {
  return ScenarioSchema.parse(validScenarioInput());
}

/**
 * A scenario that uses every evidence feature: a segmented message, an evidence panel,
 * an email with hidden details, a link and an attachment, a reply composer and an inbox triage.
 */
export function richScenarioInput(): ScenarioInput {
  const email = {
    displayName: "Acme HR",
    from: { id: "e-from", address: "hr@acme-jobs.example", redFlagId: "lookalike" },
    replyTo: { id: "e-reply-to", address: "desk@free.example", redFlagId: "reply-to" },
    to: { id: "e-to", address: "me@example.com" },
    date: "1 Jan",
    subject: "Your offer",
    preview: "Please review",
    body: [[{ text: "Dear " }, { id: "e-greeting", text: "Candidate", redFlagId: "generic" }]],
    attachments: [
      {
        id: "e-file",
        shownName: "Offer.pdf",
        fullName: "Offer.pdf.apk",
        actualType: "Android app",
        documentId: "offer-pdf",
        redFlagId: "apk",
      },
    ],
    links: [{ id: "e-link", text: "Open offer", actualUrl: "https://x.example/login" }],
  };
  return {
    id: "rich",
    dojoId: "dream-job",
    title: "Rich",
    summary: "Every feature.",
    legit: false,
    startNodeId: "dm",
    nodes: {
      dm: {
        kind: "thread",
        app: "linkedin",
        contact: { name: "Recruiter" },
        messages: [
          {
            id: "dm-1",
            from: "them",
            segments: [
              { text: "Hi! " },
              { id: "dm-pay", text: "Pay ₹999 to register.", redFlagId: "fee" },
              { id: "dm-role", text: " The role is in Bengaluru." },
            ],
          },
        ],
        evidence: ["profile"],
        choices: [
          { label: "Check email", nextNodeId: "mail" },
          { label: "Pay", nextNodeId: "lost" },
        ],
      },
      mail: {
        kind: "email",
        app: "gmail",
        email,
        choices: [
          { label: "Reply", nextNodeId: "reply" },
          { label: "Report", nextNodeId: "safe" },
        ],
      },
      reply: {
        kind: "compose",
        app: "gmail",
        to: { id: "reply-to-field", address: "desk@free.example", redFlagId: "reply-to" },
        subject: "Re: Your offer",
        body: "I accept.",
        choices: [{ label: "Send", nextNodeId: "inbox" }],
      },
      inbox: {
        kind: "triage",
        app: "gmail",
        items: [
          {
            id: "t-real",
            email: {
              displayName: "Real Co",
              from: { id: "t-real-from", address: "hr@real.example" },
              to: { id: "t-real-to", address: "me@example.com" },
              date: "2 Jan",
              subject: "Interview",
              preview: "Hello",
              body: [[{ id: "t-real-body", text: "See you Monday." }]],
            },
            correct: "legit",
            explanation: "Official domain.",
          },
        ],
        nextNodeId: "safe",
      },
      safe: { kind: "outcome", result: "safe", title: "Safe", body: "Done." },
      lost: {
        kind: "outcome",
        result: "compromised",
        title: "Hacked",
        body: "They took over.",
        rewindToNodeId: "mail",
      },
    },
    evidence: {
      profile: {
        kind: "profile",
        title: "Recruiter profile",
        sections: [
          { fields: [{ id: "p-joined", label: "Joined", value: "2019", redFlagId: "dates" }] },
        ],
      },
      "offer-pdf": {
        kind: "document",
        title: "Offer.pdf",
        sections: [{ fields: [{ id: "pdf-clause", value: "Pay a deposit.", finePrint: true }] }],
      },
    },
    redFlags: {
      fee: { label: "Fee", tactic: "pay-to-earn", explanation: "x" },
      lookalike: { label: "Lookalike", tactic: "impersonation", explanation: "x" },
      "reply-to": { label: "Reply-To", tactic: "impersonation", explanation: "x" },
      generic: { label: "Generic", tactic: "no-real-process", explanation: "x" },
      apk: { label: "APK", tactic: "malicious-file", explanation: "x" },
      dates: { label: "Dates", tactic: "impersonation", explanation: "x" },
    },
    debrief: { rule: "Check everything.", realWorldAction: "Call 1930." },
  };
}

export function richScenario(): Scenario {
  return ScenarioSchema.parse(richScenarioInput());
}

/**
 * A flag as the player would make it: a highlight of `phrase` inside text target `targetId`,
 * or a whole item when `phrase` is omitted.
 */
export function makeFlag(
  scenario: Scenario,
  targetId: string,
  options: { phrase?: string; tactic?: Tactic; note?: string; judge?: JudgeState } = {},
): FlagRecord {
  let spot: FlagSpot = { targetId };
  if (options.phrase !== undefined) {
    const target = findTarget(scenario, targetId);
    if (target === undefined) throw new Error(`no text target ${targetId}`);
    const start = targetText(target, "en").indexOf(options.phrase);
    if (start === -1) throw new Error(`"${options.phrase}" not in ${targetId}`);
    spot = { targetId, start, end: start + options.phrase.length };
  }
  const resolved = resolveSpot(scenario, spot, "en");
  if (resolved === undefined) throw new Error(`can't flag ${targetId}`);
  return {
    id: `flag-${targetId}-${spot.start ?? "item"}`,
    ...spot,
    ...resolved,
    locale: "en",
    chips: [],
    tactic: options.tactic,
    note: options.note,
    judge: options.judge,
  };
}

export function flagsById(...flags: FlagRecord[]): Record<string, FlagRecord> {
  return Object.fromEntries(flags.map((f) => [f.id, f]));
}
