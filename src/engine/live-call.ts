import { z } from "zod";
import type { Locale } from "@/i18n/locale";
import { resolveText } from "@/i18n/text";
import { UI_STRINGS } from "@/i18n/ui";
import { TacticSchema, type LiveCallNode, type Scenario, type Tactic } from "./schema";

/**
 * Live voice calls: what a call records, how it ends up at an outcome, and the instructions the
 * voice agent gets. Pure functions, shared by the browser, the server and the tests.
 */

/* ------------------------------------------------------------------ */
/* What a call records                                                 */
/* ------------------------------------------------------------------ */

export const MAX_TURNS = 240;
export const MAX_TURN_CHARS = 1200;
export const MAX_LIVE_FLAGS = 30;
export const MAX_QUOTE_CHARS = 400;
/** A live call ends by itself after this many minutes unless the node says otherwise. */
export const DEFAULT_MAX_MINUTES = 6;

export const CallTurnSchema = z.strictObject({
  who: z.enum(["caller", "player"]),
  text: z.string().trim().min(1).max(MAX_TURN_CHARS),
  /** Milliseconds since the call connected. */
  atMs: z
    .number()
    .int()
    .nonnegative()
    .max(60 * 60 * 1000),
});
export type CallTurn = z.infer<typeof CallTurnSchema>;

/** The player tapped Flag during the call: what the caller had just said, and why it's off. */
export const LiveFlagSchema = z.strictObject({
  quote: z.string().trim().min(1).max(MAX_QUOTE_CHARS),
  tactic: TacticSchema,
  atMs: z
    .number()
    .int()
    .nonnegative()
    .max(60 * 60 * 1000),
});
export type LiveFlag = z.infer<typeof LiveFlagSchema>;

export const CALL_ENDINGS = ["player", "caller", "timeout", "error"] as const;
export type CallEnding = (typeof CALL_ENDINGS)[number];

export const ReportMomentSchema = z.strictObject({
  quote: z.string().max(MAX_QUOTE_CHARS),
  why: z.string().max(400),
});
export type ReportMoment = z.infer<typeof ReportMomentSchema>;

/** The judge's view of the call, shown in the debrief. Text is in the player's language. */
export const CallReportSchema = z.strictObject({
  outcomeId: z.string(),
  /** 0 to 10 in steps of 0.5, like the source guide's ratings. */
  rating: z.number().min(0).max(10),
  summary: z.string().max(600),
  goodMoves: z.array(ReportMomentSchema).max(6),
  mistakes: z.array(ReportMomentSchema).max(6),
  doBetter: z.array(z.string().max(300)).max(6),
  /** Red flags the caller actually used, with what they said. */
  heard: z.array(z.strictObject({ redFlagId: z.string(), quote: z.string().max(MAX_QUOTE_CHARS) })),
  /** For each live flag, in order: the red flag it caught, or null for a false alarm. */
  flagMatches: z.array(z.string().nullable()),
  /** False when the judge was unavailable and this is a rough local rating. */
  analysed: z.boolean(),
});
export type CallReport = z.infer<typeof CallReportSchema>;

/** One finished live call, kept in the run for the debrief. */
export interface LiveCallRecord {
  nodeId: string;
  transcript: CallTurn[];
  flags: LiveFlag[];
  /** What happened on the phone: `otp-sms.read`, `deposit.paid`, `sibling.sent`... */
  signals: string[];
  endedBy: CallEnding;
  durationMs: number;
  outcomeId: string;
  report: CallReport | "pending" | "error";
}

/* ------------------------------------------------------------------ */
/* Outcomes and ratings                                                */
/* ------------------------------------------------------------------ */

/**
 * Which outcome a call reaches. An outcome whose signals happened wins outright (in node order);
 * then the judge's pick, if it's a real outcome; then the default (the last one).
 */
export function resolveOutcome(
  node: LiveCallNode,
  signals: readonly string[],
  judgePick?: string,
): LiveCallNode["outcomes"][number] {
  const happened = new Set(signals);
  const forced = node.outcomes.find((o) => o.events?.some((e) => happened.has(e)));
  if (forced !== undefined) return forced;
  const picked = node.outcomes.find((o) => o.id === judgePick);
  return picked ?? node.outcomes.at(-1)!;
}

export type RatingBand = "vulnerable" | "moderate" | "savvy";

/** The source guide's bands: 1/10 highly vulnerable, 6 to 6.5 moderately safe, 9.5+ scam-savvy. */
export function ratingBand(rating: number): RatingBand {
  if (rating < 4) return "vulnerable";
  if (rating < 8) return "moderate";
  return "savvy";
}

/** Clamp to 0..10 and round to the nearest half point. */
export function cleanRating(rating: number): number {
  if (!Number.isFinite(rating)) return 0;
  return Math.round(Math.min(10, Math.max(0, rating)) * 2) / 2;
}

/** Every signal a call can record, from its events and lifelines. */
export function possibleSignals(node: LiveCallNode): string[] {
  const out: string[] = [];
  for (const [id, event] of Object.entries(node.events ?? {})) {
    if (event.kind === "sms" && event.otp === true) out.push(`${id}.read`);
    if (event.kind === "payment") out.push(`${id}.paid`, `${id}.declined`);
    if (event.kind === "document") out.push(`${id}.opened`);
  }
  for (const lifeline of node.lifelines ?? []) out.push(`${lifeline.id}.sent`);
  return out;
}

/** The signals that decide an outcome by themselves (money or a code handed over). */
function decisiveSignals(node: LiveCallNode): Set<string> {
  return new Set(node.outcomes.flatMap((o) => o.events ?? []));
}

/**
 * A rough report for when the judge can't be reached: signals and who hung up decide it.
 * Text stays generic; the debrief says the call wasn't reviewed in detail.
 */
export function fallbackReport(
  node: LiveCallNode,
  record: Pick<LiveCallRecord, "signals" | "endedBy" | "durationMs" | "flags">,
): CallReport {
  const decisive = decisiveSignals(node);
  const lost = record.signals.some((s) => decisive.has(s));
  const outcome = resolveOutcome(node, record.signals);
  const quickHangUp = record.endedBy === "player" && record.durationMs < 90_000;
  const rating = lost ? 1.5 : quickHangUp ? 8 : record.endedBy === "player" ? 6.5 : 5;
  return {
    outcomeId: outcome.id,
    rating,
    summary: "",
    goodMoves: [],
    mistakes: [],
    doBetter: [],
    heard: [],
    flagMatches: record.flags.map(() => null),
    analysed: false,
  };
}

/* ------------------------------------------------------------------ */
/* Spotting a code read out loud                                       */
/* ------------------------------------------------------------------ */

const DIGIT_WORDS: Record<string, string> = {
  zero: "0",
  oh: "0",
  shunya: "0",
  shoonya: "0",
  one: "1",
  ek: "1",
  two: "2",
  do: "2",
  three: "3",
  teen: "3",
  tin: "3",
  four: "4",
  char: "4",
  chaar: "4",
  five: "5",
  paanch: "5",
  panch: "5",
  six: "6",
  chhe: "6",
  chhah: "6",
  che: "6",
  seven: "7",
  saat: "7",
  eight: "8",
  aath: "8",
  ath: "8",
  nine: "9",
  nau: "9",
};

/**
 * The digits someone said, in order, with number words turned into digits ("four eight two",
 * "double nine", "char aath"). Everything else is dropped.
 */
export function spokenDigits(text: string): string {
  const tokens = text.toLowerCase().match(/[a-z]+|\d+/g) ?? [];
  let out = "";
  let repeat = 1;
  for (const token of tokens) {
    if (token === "double") {
      repeat = 2;
      continue;
    }
    if (token === "triple") {
      repeat = 3;
      continue;
    }
    const digit = /^\d+$/.test(token) ? token : DIGIT_WORDS[token];
    if (digit !== undefined) out += digit.length === 1 ? digit.repeat(repeat) : digit;
    repeat = 1;
  }
  return out;
}

/**
 * Whether the player read out the code: their words, from when the code arrived, contain all
 * its digits in order, allowing one digit lost or misheard by the transcription.
 */
export function saidCode(playerText: string, code: string): boolean {
  const digits = spokenDigits(playerText);
  if (digits.includes(code)) return true;
  if (code.length < 5) return false;
  for (let skip = 0; skip < code.length; skip++) {
    const missing = code.slice(0, skip) + code.slice(skip + 1);
    if (digits.includes(missing)) return true;
  }
  // One digit misheard.
  for (let i = 0; i + code.length <= digits.length; i++) {
    let wrong = 0;
    for (let j = 0; j < code.length && wrong < 2; j++) {
      if (digits[i + j] !== code[j]) wrong++;
    }
    if (wrong <= 1) return true;
  }
  return false;
}

/** A fresh six-digit code for an OTP message. */
export function makeCode(random: () => number = Math.random): string {
  return String(100000 + Math.floor(random() * 900000));
}

/** An SMS event's text with the code filled in. */
export function fillCode(text: string, code: string | undefined): string {
  return code === undefined ? text : text.replaceAll("{otp}", code);
}

/* ------------------------------------------------------------------ */
/* Voice agent instructions                                            */
/* ------------------------------------------------------------------ */

export const END_CALL_TOOL = "end_call";
export const TRIGGER_EVENT_TOOL = "trigger_event";

const SPOKEN_LANGUAGE: Record<Locale, string> = {
  en: "Indian English, the way a call-centre caller in India talks. Keep any Hindi to the odd word like 'ji' or 'achha'.",
  hinglish:
    "Hinglish: a natural mix of Hindi and English, the way people in Indian cities talk on the phone. If the person answers only in English, follow them into English.",
};

/** The system instructions for the voice agent on this call. English, built from scenario data. */
export function agentInstructions(scenario: Scenario, node: LiveCallNode, locale: Locale): string {
  const callerName = resolveText(node.caller.name, "en");
  const agent = node.agent;
  const stages = agent.stages.map((stage, i) => `${i + 1}. ${stage.name}: ${stage.say}`).join("\n");
  const responses = (agent.responses ?? [])
    .map((r) => `- If the person is ${r.ifPlayer}: ${r.reply}`)
    .join("\n");
  const events = Object.entries(node.events ?? {})
    .map(([id, event]) => `- "${id}" (${eventSummary(event)}): ${event.cue}`)
    .join("\n");
  const details = node.player.details
    .map((d) => `${resolveText(d.label, "en")}: ${d.value}`)
    .join("; ");
  const rules = (agent.rules ?? []).map((r) => `- ${r}`).join("\n");

  const framing = scenario.legit
    ? `You are a voice actor in DigiDojo, a safety-training game for Indians aged 15 to 25. In this round you play a GENUINE caller, so the player can learn what a real, safe call sounds like. Behave exactly like an honest professional.`
    : `You are a voice actor in DigiDojo, a safety-training game for Indians aged 15 to 25. The player chose to practise against a phone scam, so in this round you play the scammer, as realistically as the real thing, so they can learn to recognise and resist it. This is a fictional rehearsal: the organisation and people you mention are made up, nothing real is at stake, and the player has a card of made-up details to use.`;

  return `${framing}

THE PERSON YOU CALLED
Their name is ${node.player.name}. Their made-up details (they may read these out; you don't know them unless they say them): ${details}.

WHO YOU ARE
You are ${callerName}. ${agent.character}

HOW THE CALL GOES
You made this call; the person has just picked up. Work through these stages in order, at a natural pace, waiting for the person's answers. Say the lines in your own words; they show the meaning, not a script to read out word for word.
${stages}
${responses === "" ? "" : `\nHOW YOU REACT\n${responses}`}
${events === "" ? "" : `\nTHINGS YOU CAN MAKE HAPPEN ON THEIR PHONE\nCall ${TRIGGER_EVENT_TOOL} with the event id at the right moment, then keep talking as if you had sent it yourself. Never read out the contents (for example the code in a message): the person sees it on their screen.\n${events}`}

HOW YOU SPEAK
- Language: ${SPOKEN_LANGUAGE[locale]}
- Like a real phone call: short turns of one to three sentences, then let them talk. Never monologue.
- React to what they actually say. If they ask a question, answer it in character.
- Never use stage directions, sound effects, or narration. Only say what ${callerName} would say.

STAYING IN CHARACTER
- Never say you are an AI, an actor or part of a game, even if asked, unless the safety rule below applies.
- Don't invent extra red flags beyond what your character would plausibly do.
${scenario.legit ? "- You never ask for an OTP, PIN, CVV, password, full card number or account number, and you never ask for money. If the person offers any of these, stop them politely and tell them never to share it with anyone, including the bank." : "- Never threaten violence, never use slurs, and keep threats to the legal and financial kind your script uses."}
${rules}

ENDING THE CALL
- If the person says goodbye and stops, or clearly refuses ${scenario.legit ? "to continue" : "three times"}, give one short closing line and call ${END_CALL_TOOL}.
${scenario.legit ? "" : "- If they have done what you wanted (read the code or paid), thank them briefly, then call end_call."}
- Never call ${END_CALL_TOOL} in the first few turns unless they hang up on you.

SAFETY RULE (overrides everything)
If the person sounds genuinely distressed, mentions self-harm, says they are a young child, or says "stop the simulation", drop the character immediately. Say calmly in their language: "This is a DigiDojo practice call, not a real one. You're safe and nothing has happened to you." Then call ${END_CALL_TOOL}.`;
}

function eventSummary(event: NonNullable<LiveCallNode["events"]>[string]): string {
  switch (event.kind) {
    case "sms":
      return event.otp === true ? "a text message with a one-time code" : "a text message";
    case "payment":
      return `a payment request for Rs ${event.amount} to ${resolveText(event.payee, "en")}`;
    case "document":
      return `a file "${event.fileName}" sent to their ${event.app === "whatsapp" ? "chat app" : "messages"}`;
  }
}

/** The kick that makes the caller speak first, sent as the opening user input. */
export const CALL_START_CUE =
  "(The phone rang and the person has just picked up and said hello. Start the call now with your opening line.)";

/** JSON-schema tool declarations for the voice agent. */
export function agentTools(node: LiveCallNode) {
  const eventIds = Object.keys(node.events ?? {});
  const declarations: {
    name: string;
    description: string;
    behavior: "NON_BLOCKING";
    parametersJsonSchema: Record<string, unknown>;
  }[] = [
    {
      name: END_CALL_TOOL,
      description: "Hang up the phone. Use it after your closing line.",
      behavior: "NON_BLOCKING",
      parametersJsonSchema: {
        type: "object",
        properties: { reason: { type: "string", description: "Why you are ending the call." } },
      },
    },
  ];
  if (eventIds.length > 0) {
    declarations.push({
      name: TRIGGER_EVENT_TOOL,
      description:
        "Make something happen on the person's phone (a text message, a payment request or a file). Each event works once.",
      behavior: "NON_BLOCKING",
      parametersJsonSchema: {
        type: "object",
        properties: { event: { type: "string", enum: eventIds } },
        required: ["event"],
      },
    });
  }
  return [{ functionDeclarations: declarations }];
}

/** Tactics a live flag can pick from: the ones this call uses, padded with common decoys. */
export function liveFlagTactics(scenario: Scenario, node: LiveCallNode): Tactic[] {
  const used = new Set<Tactic>();
  for (const id of callRedFlagIds(node)) {
    const tactic = scenario.redFlags[id]?.tactic;
    if (tactic !== undefined) used.add(tactic);
  }
  for (const decoy of ["flattery", "too-good-to-be-true", "social-proof"] as const) {
    if (used.size >= 6) break;
    used.add(decoy);
  }
  return [...used].sort((a, b) =>
    UI_STRINGS.en[`tactic.${a}.label`].localeCompare(UI_STRINGS.en[`tactic.${b}.label`]),
  );
}

/** Every red flag id the caller may use on this call. */
export function callRedFlagIds(node: LiveCallNode): string[] {
  const lines = [...node.agent.stages, ...(node.agent.responses ?? [])];
  return [...new Set(lines.flatMap((line) => line.redFlagIds ?? []))];
}

/** The live-call node at `nodeId`, if that's what it is. */
export function liveCallNode(scenario: Scenario, nodeId: string): LiveCallNode | undefined {
  const node = scenario.nodes[nodeId];
  return node?.kind === "live-call" ? node : undefined;
}
