import {
  cleanRating,
  decisiveSignals,
  PART_MAX,
  REPORTED_SIGNAL,
  resolveOutcome,
  spokenDigits,
  type CallReport,
  type CallTurn,
  type LiveCallRecord,
  type MoveKey,
  type ReportMoment,
  type ScoreParts,
} from "./live-call";
import type { LiveCallNode } from "./schema";

/**
 * Scores a live call from the conversation itself: what the player said, what they handed over
 * and how the call ended. It gives the rough report when the judge can't be reached, and its
 * hard facts (a code read out, a detail said aloud, a report filed) also bind the judge's marks.
 */

type CallFacts = Pick<LiveCallRecord, "signals" | "endedBy" | "durationMs" | "flags"> & {
  transcript: readonly CallTurn[];
};

/** Asking who, why or for proof, in English, Hinglish or Hindi. */
const QUESTION_RE =
  /\?|\b(who|which|why|how|what|where|kaun|kaunsa|kyun|kyon|kaise|kahan|proof|verify|identity|employee|badge|id card|branch|official)\b|कौन|क्यों|कैसे|कहाँ|कहां/i;

/** Saying no. */
const REFUSAL_RE =
  /\b(no|nope|not|won't|wont|don't|dont|never|refuse|nahi|nahin|nai|mat|hang up|cut the call|stop calling)\b|नहीं|मत/i;

/** Saying they'll check through a channel they trust. */
const VERIFY_RE =
  /call (you |them )?back|call (the|my) bank|official (number|app|website|site)|number (on|behind) (my |the )?card|branch|1930|cyber ?crime|police station|visit|check (it )?(myself|with)|(ask|tell) my (mom|mum|mother|dad|father|parents|family|brother|sister)|khud check|bank ja|बैंक/i;

/** The made-up details on the player's card that would count as handed over if said aloud. */
function secretKeys(node: LiveCallNode): string[] {
  const keys = new Set<string>();
  for (const detail of node.player.details) {
    const digits = detail.value.replace(/\D/g, "");
    if (digits.length >= 4) keys.add(digits);
  }
  return [...keys];
}

/** Player turns that said one of the card's details aloud, with the detail they gave. */
function leakedTurns(node: LiveCallNode, turns: readonly CallTurn[]): string[] {
  const keys = secretKeys(node);
  const quotes: string[] = [];
  const found = new Set<string>();
  for (const turn of turns) {
    if (turn.who !== "player") continue;
    const digits = spokenDigits(turn.text);
    const hit = keys.find((key) => !found.has(key) && digits.includes(key));
    if (hit === undefined) continue;
    found.add(hit);
    quotes.push(turn.text);
  }
  return quotes;
}

const clipQuote = (text: string) => {
  const words = text.trim().split(/\s+/);
  return words.length <= 20 ? words.join(" ") : `${words.slice(0, 20).join(" ")}…`;
};

const moment = (key: MoveKey, quote = ""): ReportMoment => ({
  key,
  quote: clipQuote(quote),
  why: "",
});

export interface ConversationScore {
  parts: ScoreParts;
  rating: number;
  goodMoves: ReportMoment[];
  mistakes: ReportMoment[];
  /** Facts the judge's marks can't overrule. */
  handedOver: boolean;
  leaks: number;
  reported: boolean;
}

/** Scores a call from its transcript, phone events and ending. */
export function scoreConversation(
  node: LiveCallNode,
  facts: CallFacts,
  legit: boolean,
): ConversationScore {
  const said = facts.transcript.filter((t) => t.who === "player" && t.text.trim() !== "");
  const signals = new Set(facts.signals);
  const decisive = decisiveSignals(node);
  const handedOver = facts.signals.some((s) => decisive.has(s));
  const reported = signals.has(REPORTED_SIGNAL);
  const leaks = leakedTurns(node, facts.transcript);
  const asked = said.filter((t) => QUESTION_RE.test(t.text));
  const refusal = said.find((t) => REFUSAL_RE.test(t.text));
  const verify = said.find((t) => VERIFY_RE.test(t.text));
  const lifeline = facts.signals.some((s) => s.endsWith(".sent"));
  const opened = facts.signals.some((s) => s.endsWith(".opened"));
  const codeRead = facts.signals.some((s) => s.endsWith(".read") && decisive.has(s));
  const paid = facts.signals.some((s) => s.endsWith(".paid"));
  const hungUp = facts.endedBy === "player";

  const good: ReportMoment[] = [];
  const bad: ReportMoment[] = [];
  if (codeRead) bad.push(moment("sharedCode"));
  if (paid) bad.push(moment("paid"));
  for (const quote of leaks) bad.push(moment("sharedDetail", quote));
  if (opened && !legit) bad.push(moment("openedFile"));

  let secrets = handedOver ? 0 : PART_MAX.secrets - leaks.length * (legit ? 1 : 1.5);
  if (opened && !legit) secrets -= 0.5;
  if (!handedOver && leaks.length === 0) good.push(moment("keptSecrets"));

  const questions = Math.min(PART_MAX.questions, asked.length);
  if (asked[0] !== undefined) good.push(moment("askedQuestion", asked[0].text));

  let pressure: number;
  let exit: number;
  if (legit) {
    const brushedOff = hungUp && said.length <= 1 && facts.durationMs < 20_000;
    pressure = reported ? 0.5 : brushedOff ? 1 : PART_MAX.pressure;
    if (!reported && !brushedOff) good.push(moment("stayedCalm"));
    if (reported) {
      exit = 0;
      bad.push(moment("reportedGenuine"));
    } else if (verify !== undefined) {
      exit = 2;
      good.push(moment("verify", verify.text));
    } else if (brushedOff) {
      exit = 0.5;
      bad.push(moment("dismissedGenuine"));
    } else {
      exit = facts.endedBy === "timeout" || facts.endedBy === "error" ? 1 : 1.5;
    }
  } else {
    if (handedOver) pressure = 0;
    else if (leaks.length > 0) pressure = refusal === undefined ? 0.5 : 1;
    else pressure = refusal !== undefined || hungUp ? PART_MAX.pressure : 1;
    if (refusal !== undefined && !handedOver) good.push(moment("refused", refusal.text));

    // Hanging up early, before the caller can build up pressure, is a full-marks exit.
    if (reported || (hungUp && facts.durationMs < 90_000)) exit = 2;
    else if (hungUp) exit = 1.5;
    else if (facts.endedBy === "error") exit = 1;
    else exit = refusal !== undefined ? 1 : 0;
    if (!reported && (verify !== undefined || lifeline)) exit += 0.5;
    if (hungUp) good.push(moment("hungUp"));
    if (reported) good.push(moment("reported"));
    if (verify !== undefined) good.push(moment("verify", verify.text));
    if (!hungUp && !reported && !handedOver && facts.endedBy !== "error")
      bad.push(moment("stayedOn"));
  }
  if (lifeline) good.push(moment("lifeline"));

  const parts = capParts(
    {
      secrets: Math.max(0, secrets),
      questions,
      pressure,
      exit: Math.min(PART_MAX.exit, exit),
    },
    handedOver,
  );
  return {
    parts,
    rating: sumParts(parts),
    goodMoves: good.slice(0, 5),
    mistakes: bad.slice(0, 5),
    handedOver,
    leaks: leaks.length,
    reported,
  };
}

/** Half points, within each part's maximum; handing over a code or money caps the call at 2.5. */
export function capParts(parts: ScoreParts, handedOver: boolean): ScoreParts {
  const half = (n: number, max: number) =>
    Math.round(Math.min(max, Math.max(0, Number.isFinite(n) ? n : 0)) * 2) / 2;
  const out: ScoreParts = {
    secrets: half(parts.secrets, PART_MAX.secrets),
    questions: half(parts.questions, PART_MAX.questions),
    pressure: half(parts.pressure, PART_MAX.pressure),
    exit: half(parts.exit, PART_MAX.exit),
  };
  if (handedOver) {
    out.secrets = 0;
    out.pressure = 0;
    out.questions = Math.min(out.questions, 1.5);
    out.exit = Math.min(out.exit, 2.5 - out.questions);
  }
  return out;
}

export const sumParts = (parts: ScoreParts) =>
  cleanRating(parts.secrets + parts.questions + parts.pressure + parts.exit);

/**
 * The report when the judge can't be reached: scored from the conversation, with moments the
 * UI words. The debrief says the call wasn't reviewed in detail.
 */
export function fallbackReport(node: LiveCallNode, record: CallFacts, legit = false): CallReport {
  const score = scoreConversation(node, record, legit);
  return {
    outcomeId: resolveOutcome(node, record.signals).id,
    rating: score.rating,
    parts: score.parts,
    summary: "",
    goodMoves: score.goodMoves,
    mistakes: score.mistakes,
    doBetter: [],
    heard: [],
    flagMatches: record.flags.map(() => null),
    analysed: false,
  };
}
