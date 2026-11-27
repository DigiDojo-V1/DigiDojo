import { z } from "zod";
import type { Locale } from "@/i18n/locale";
import { resolveText } from "@/i18n/text";
import { collectFlaggables } from "./evidence";
import { findTarget, matchHighlight, splitSentences, targetText, type Chip } from "./highlight";
import { TacticSchema, type ScenarioData, type Tactic } from "./schema";

/** How the AI rated the player's own explanation. */
export const JUDGE_VERDICTS = ["good", "partial", "off"] as const;
export type JudgeVerdict = (typeof JUDGE_VERDICTS)[number];

export const JudgeResultSchema = z.object({
  verdict: z.enum(JUDGE_VERDICTS),
  /** One sentence for the debrief, in the player's language. */
  feedback: z.string().max(400),
});
export type JudgeResult = z.infer<typeof JudgeResultSchema>;

/** `skipped`: nothing to grade (no note, or the flag caught no red flag) or grading is off. */
export type JudgeState = JudgeResult | "pending" | "error" | "skipped";

export const ChipSchema = z.object({ tactic: TacticSchema, label: z.string().max(80).optional() });

/** The longest note a player can write. */
export const MAX_NOTE_CHARS = 200;
/** Shortest explanation that can stand in for a reason chip. */
export const MIN_NOTE_CHARS = 10;

/** One thing the player flagged: a sentence, or a whole item such as a Reply-To line. */
export interface FlagRecord {
  id: string;
  /** A text target id (message or email paragraph) or a flaggable item id. */
  targetId: string;
  /** Character range of the flagged sentence in the target's text. Absent for whole items. */
  start?: number;
  end?: number;
  /** What the player flagged, as they saw it. */
  text: string;
  locale: Locale;
  /** Red flags this flag catches. Empty means a false alarm. */
  catches: string[];
  chips: Chip[];
  /** The reason the player picked. */
  tactic?: Tactic;
  /** The player's own explanation. */
  note?: string;
  judge?: JudgeState;
}

/** Where a flag is made: a sentence in a text, or a whole item. */
export interface FlagSpot {
  targetId: string;
  start?: number;
  end?: number;
}

/**
 * What a flag at `spot` shows and catches. Undefined if the spot doesn't exist.
 * The client uses it to record a flag; the server uses it to trust nothing the client says.
 */
export function resolveSpot(
  scenario: ScenarioData,
  spot: FlagSpot,
  locale: Locale,
): { text: string; catches: string[] } | undefined {
  if (spot.start !== undefined || spot.end !== undefined) {
    const target = findTarget(scenario, spot.targetId);
    if (target === undefined || spot.start === undefined || spot.end === undefined)
      return undefined;
    const full = targetText(target, locale);
    // Only whole sentences can be flagged.
    const { start, end } = spot;
    if (!splitSentences(full).some((s) => s.start === start && s.end === end)) return undefined;
    return {
      text: full.slice(spot.start, spot.end),
      catches: matchHighlight(target, locale, spot.start, spot.end),
    };
  }
  const item = collectFlaggables(scenario).find(
    (f) => f.id === spot.targetId && f.where !== "message" && f.where !== "email-body",
  );
  if (item === undefined) return undefined;
  return {
    text: resolveText(item.text, locale),
    catches: item.redFlagId === undefined ? [] : [item.redFlagId],
  };
}

/** Ids of whole items the player has flagged, for shells that mark flagged rows. */
export function flaggedItemIds(flags: Readonly<Record<string, FlagRecord>>): string[] {
  return Object.values(flags)
    .filter((f) => f.start === undefined)
    .map((f) => f.targetId);
}
