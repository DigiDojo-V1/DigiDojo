import type { Locale } from "@/i18n/locale";
import { resolveText } from "@/i18n/text";
import type { Email, LocalizedText, ScenarioData, Segment, Tactic } from "./schema";
import { TACTICS } from "./schema";

/**
 * Free highlighting. The player selects any words in a message or an email paragraph; red flags
 * are hidden spans inside that text, never shown as tappable. A highlight catches a red flag when
 * it covers enough of the span without being far longer than it.
 */

/** A part of a highlightable text. Parts with a `redFlagId` are the hidden answer spans. */
interface TargetPart {
  text: LocalizedText;
  redFlagId?: string;
  /** The flaggable id carrying the red flag (a segment or the message), for `seen` and the debrief. */
  carrierId?: string;
}

/** A block of text the player can highlight words in. */
export interface TextTarget {
  /** A message id, or `${nodeOrItemId}/body/${paragraph}` for an email paragraph. */
  id: string;
  parts: TargetPart[];
}

/** A word or the whitespace between words, with character offsets into the target's text. */
export interface Token {
  text: string;
  start: number;
  end: number;
  word: boolean;
}

export interface AnswerSpan {
  redFlagId: string;
  carrierId?: string;
  start: number;
  end: number;
}

/** A highlight is never longer than this, so selecting a whole paragraph catches nothing. */
export const MAX_HIGHLIGHT_CHARS = 160;
/** A short span may be over-highlighted up to this many characters. */
const MIN_SLACK_CHARS = 40;

export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  const re = /\s+|[^\s]+/g;
  for (let m = re.exec(text); m !== null; m = re.exec(text)) {
    tokens.push({
      text: m[0],
      start: m.index,
      end: m.index + m[0].length,
      word: !/^\s+$/.test(m[0]),
    });
  }
  return tokens;
}

/** The id of the text target for paragraph `p` of an email shown at `ownerId` (node or triage item). */
export function emailBodyTargetId(ownerId: string, paragraph: number): string {
  return `${ownerId}/body/${paragraph}`;
}

function segmentParts(segments: readonly Segment[]): TargetPart[] {
  return segments.map((s) => ({ text: s.text, redFlagId: s.redFlagId, carrierId: s.id }));
}

function emailTargets(email: Email, ownerId: string): TextTarget[] {
  return email.body.map((paragraph, p) => ({
    id: emailBodyTargetId(ownerId, p),
    parts: segmentParts(paragraph),
  }));
}

/** Every highlightable text in a scenario: other people's messages and email paragraphs. */
export function textTargets(scenario: ScenarioData): TextTarget[] {
  const out: TextTarget[] = [];
  for (const [nodeId, node] of Object.entries(scenario.nodes)) {
    switch (node.kind) {
      case "thread":
        for (const message of node.messages) {
          if (message.from === "me") continue;
          out.push({
            id: message.id,
            parts:
              message.segments !== undefined
                ? segmentParts(message.segments)
                : [
                    {
                      text: message.text ?? { en: "" },
                      redFlagId: message.redFlagId,
                      carrierId: message.id,
                    },
                  ],
          });
        }
        break;
      case "email":
        out.push(...emailTargets(node.email, nodeId));
        break;
      case "triage":
        for (const item of node.items) out.push(...emailTargets(item.email, item.id));
        break;
      case "compose":
      case "outcome":
        break;
    }
  }
  return out;
}

export function findTarget(scenario: ScenarioData, targetId: string): TextTarget | undefined {
  return textTargets(scenario).find((t) => t.id === targetId);
}

/** The target's full text in `locale`. Matches what the shells draw. */
export function targetText(target: TextTarget, locale: Locale): string {
  return target.parts.map((p) => resolveText(p.text, locale)).join("");
}

/** Where the red flags sit in the target's text, in `locale`. */
export function answerSpans(target: TextTarget, locale: Locale): AnswerSpan[] {
  const spans: AnswerSpan[] = [];
  let offset = 0;
  for (const part of target.parts) {
    const text = resolveText(part.text, locale);
    // Leading and trailing spaces in a segment are layout, not part of the red flag.
    const lead = text.length - text.trimStart().length;
    const trimmed = text.trim();
    if (part.redFlagId !== undefined && trimmed.length > 0) {
      spans.push({
        redFlagId: part.redFlagId,
        carrierId: part.carrierId,
        start: offset + lead,
        end: offset + lead + trimmed.length,
      });
    }
    offset += text.length;
  }
  return spans;
}

/** True if a highlight [start, end) counts as catching the span. */
export function highlightCatches(span: AnswerSpan, start: number, end: number): boolean {
  const length = end - start;
  if (length <= 0 || length > MAX_HIGHLIGHT_CHARS) return false;
  const spanLength = span.end - span.start;
  const overlap = Math.min(end, span.end) - Math.max(start, span.start);
  if (overlap <= 0) return false;
  if (overlap < 0.5 * Math.min(length, spanLength)) return false;
  return length <= Math.max(3 * spanLength, MIN_SLACK_CHARS);
}

/** The red flags a highlight catches, without duplicates. */
export function matchHighlight(
  target: TextTarget,
  locale: Locale,
  start: number,
  end: number,
): string[] {
  const caught = answerSpans(target, locale)
    .filter((span) => highlightCatches(span, start, end))
    .map((span) => span.redFlagId);
  return [...new Set(caught)];
}

/* ------------------------------------------------------------------ */
/* Reason chips                                                        */
/* ------------------------------------------------------------------ */

/** One answer to "Why is this suspicious?". `label` is a contextual line; without it the UI shows the tactic's name. */
export interface Chip {
  tactic: Tactic;
  label?: string;
}

export const CHIP_COUNT = 4;

/** A small deterministic generator, so the same seed always gives the same chips. */
function rng(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: readonly T[], seed: string): T[] {
  const out = [...items];
  const next = rng(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/**
 * Chips without an LLM: the right tactics (if the highlight caught a red flag), then distractors
 * from the tactics this scenario uses, then from every tactic. Shuffled, so position gives nothing away.
 */
export function fallbackChips(
  scenario: ScenarioData,
  correct: readonly Tactic[],
  seed: string,
): Chip[] {
  const used = [...new Set(Object.values(scenario.redFlags).map((r) => r.tactic))];
  const picked = [...new Set(correct)].slice(0, CHIP_COUNT);
  for (const tactic of [...shuffle(used, `${seed}:used`), ...shuffle(TACTICS, `${seed}:all`)]) {
    if (picked.length >= CHIP_COUNT) break;
    if (!picked.includes(tactic)) picked.push(tactic);
  }
  return shuffle(picked, `${seed}:order`).map((tactic) => ({ tactic }));
}

/**
 * Makes chips from any source safe to show: known tactics only, no duplicates, exactly
 * `CHIP_COUNT`, every correct tactic present, in a shuffled order.
 */
export function finalizeChips(
  proposed: readonly Chip[],
  scenario: ScenarioData,
  correct: readonly Tactic[],
  seed: string,
): Chip[] {
  const known = new Set<string>(TACTICS);
  const unique: Chip[] = [];
  for (const chip of proposed) {
    if (!known.has(chip.tactic) || unique.some((c) => c.tactic === chip.tactic)) continue;
    unique.push(chip);
  }
  const missing = [...new Set(correct)].filter((t) => !unique.some((c) => c.tactic === t));
  // Make room for the right answers by dropping proposed distractors from the end.
  let chips = unique.slice(0, Math.max(0, CHIP_COUNT - missing.length));
  for (const tactic of missing) chips.push({ tactic });
  for (const filler of fallbackChips(scenario, [], seed)) {
    if (chips.length >= CHIP_COUNT) break;
    if (!chips.some((c) => c.tactic === filler.tactic)) chips.push(filler);
  }
  chips = chips.slice(0, CHIP_COUNT);
  return shuffle(chips, `${seed}:order`);
}

/** The tactics of the red flags a highlight caught. */
export function correctTactics(scenario: ScenarioData, redFlagIds: readonly string[]): Tactic[] {
  return [
    ...new Set(
      redFlagIds.flatMap((id) => (scenario.redFlags[id] ? [scenario.redFlags[id].tactic] : [])),
    ),
  ];
}
