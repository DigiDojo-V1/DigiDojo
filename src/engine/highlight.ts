import type { Locale } from "@/i18n/locale";
import { resolveText } from "@/i18n/text";
import type { Email, LocalizedText, ScenarioData, Segment, Tactic } from "./schema";
import { TACTICS } from "./schema";

/**
 * Sentence flagging. Every sentence in other people's messages and email paragraphs can be
 * flagged; red flags are hidden spans inside that text. A flagged sentence catches a red flag
 * when it holds at least half of the span.
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

export interface AnswerSpan {
  redFlagId: string;
  carrierId?: string;
  start: number;
  end: number;
}

/** A sentence: character offsets into a target's text, without surrounding spaces. */
export interface SentenceRange {
  start: number;
  end: number;
}

/**
 * Splits a text into the sentences the player can flag. A sentence ends after `.`, `!`, `?` or
 * `…` (with any closing quotes or brackets) followed by whitespace, or at a blank line. A single
 * line break doesn't end one, so a list stays together with the line that introduces it.
 */
export function splitSentences(text: string): SentenceRange[] {
  const out: SentenceRange[] = [];
  const push = (from: number, to: number) => {
    const raw = text.slice(from, to);
    const start = from + (raw.length - raw.trimStart().length);
    const end = to - (raw.length - raw.trimEnd().length);
    if (end > start) out.push({ start, end });
  };
  const re = /[.!?…]+["'”’)\]]*(?=\s)|\n\s*\n/g;
  let from = 0;
  for (let m = re.exec(text); m !== null; m = re.exec(text)) {
    const to = m.index + m[0].length;
    push(from, to);
    from = to;
  }
  push(from, text.length);
  return out;
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
      case "live-call":
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

/** True if the flagged sentence [start, end) holds at least half of the span. */
export function sentenceCatches(span: AnswerSpan, start: number, end: number): boolean {
  if (end <= start) return false;
  const overlap = Math.min(end, span.end) - Math.max(start, span.start);
  return overlap > 0 && overlap >= 0.5 * (span.end - span.start);
}

/** The red flags a flagged sentence catches, without duplicates. */
export function matchHighlight(
  target: TextTarget,
  locale: Locale,
  start: number,
  end: number,
): string[] {
  const caught = answerSpans(target, locale)
    .filter((span) => sentenceCatches(span, start, end))
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
 * Reason chips: the right tactics (if the flag caught a red flag), then distractors
 * from the tactics this scenario uses, then from every tactic. Shuffled, so position gives nothing away.
 */
export function reasonChips(
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

/** The tactics of the red flags a flag caught. */
export function correctTactics(scenario: ScenarioData, redFlagIds: readonly string[]): Tactic[] {
  return [
    ...new Set(
      redFlagIds.flatMap((id) => (scenario.redFlags[id] ? [scenario.redFlags[id].tactic] : [])),
    ),
  ];
}
