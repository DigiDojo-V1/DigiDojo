import { collectFlaggables, type EvidenceWhere, type Flaggable } from "./evidence";
import type { FlagRecord, JudgeState } from "./flags";
import type { LocalizedText, RedFlag, Scenario, Tactic, TriageLabel } from "./schema";

export interface DebriefFlag {
  redFlagId: string;
  label: LocalizedText;
  tactic: Tactic;
  explanation: LocalizedText;
  /** Text of the item carrying this red flag: the one seen if any, else the first. */
  evidenceText: LocalizedText;
  where: EvidenceWhere;
  /** For spotted red flags: what the player flagged, the reason they picked and how their note was judged. */
  player?: {
    text: string;
    tactic?: Tactic;
    note?: string;
    judge?: JudgeState;
  };
}

export interface DebriefTriageRow {
  itemId: string;
  subject: LocalizedText;
  chosen: TriageLabel | undefined;
  correct: TriageLabel;
  isCorrect: boolean;
  explanation: LocalizedText;
}

export const RANKS = ["rookie", "sharp", "scam-proof"] as const;
export type Rank = (typeof RANKS)[number];

export interface DebriefScore {
  points: number;
  /** Points for catching every red flag on screens the player reached, with the right reason. */
  max: number;
  rank: Rank;
}

/** Points per result. Flagging everything costs more than it earns. */
export const POINTS = {
  rightReason: 3,
  wrongReason: 1,
  falseAlarm: -1,
  goodNote: 1,
} as const;

export interface DebriefResult {
  /** Red flags the player flagged with the right reason. */
  caught: DebriefFlag[];
  /** Red flags the player flagged, with a wrong reason or none. */
  spotted: DebriefFlag[];
  /** Red flags the player saw but didn't flag. */
  missed: DebriefFlag[];
  /** Red flags on a screen the player reached, hidden behind an inspection they never did. */
  notInspected: DebriefFlag[];
  /** Red flags on screens the player never reached on this path. */
  notReached: DebriefFlag[];
  /** Flags that caught no red flag. */
  falseAlarms: { id: string; text: string; tactic?: Tactic }[];
  /** One row per inbox email, if the scenario had a triage. */
  triage: DebriefTriageRow[];
  score: DebriefScore;
}

export interface RunRecord {
  seen: readonly string[];
  flags: Readonly<Record<string, FlagRecord>>;
  /** Nodes entered during the run. */
  visited: readonly string[];
  classifications: Readonly<Record<string, TriageLabel>>;
}

export function rankFor(points: number, max: number, falseAlarms: number): Rank {
  // With nothing to catch (a legit scenario), restraint is the whole score.
  const share = max === 0 ? (falseAlarms === 0 ? 1 : falseAlarms === 1 ? 0.5 : 0) : points / max;
  if (share >= 0.75) return "scam-proof";
  if (share >= 0.4) return "sharp";
  return "rookie";
}

const goodNote = (f: Pick<FlagRecord, "judge">) =>
  typeof f.judge === "object" && f.judge.verdict === "good";

/**
 * Whether a flag named the right trick: the right reason chip, or no chip and an explanation
 * the marker judged "good".
 */
export function reasonIsRight(flag: Pick<FlagRecord, "tactic" | "judge">, tactic: Tactic): boolean {
  return flag.tactic === tactic || (flag.tactic === undefined && goodNote(flag));
}

/** The best flag for a red flag: right reason with a good note, then right reason, then a good note, then any. */
function bestFlag(flags: FlagRecord[], tactic: Tactic): FlagRecord | undefined {
  return (
    flags.find((f) => reasonIsRight(f, tactic) && goodNote(f)) ??
    flags.find((f) => reasonIsRight(f, tactic)) ??
    flags.find(goodNote) ??
    flags[0]
  );
}

/**
 * Builds the debrief. A red flag can sit on several items; flagging any one of them catches it,
 * seeing any one of them without flagging misses it.
 */
export function computeDebrief(scenario: Scenario, run: RunRecord): DebriefResult {
  const seen = new Set(run.seen);
  const visited = new Set(run.visited);
  const flags = Object.values(run.flags);
  const items = collectFlaggables(scenario);
  const result: DebriefResult = {
    caught: [],
    spotted: [],
    missed: [],
    notInspected: [],
    notReached: [],
    falseAlarms: [],
    triage: [],
    score: { points: 0, max: 0, rank: "rookie" },
  };
  let points = 0;

  for (const [redFlagId, redFlag] of Object.entries(scenario.redFlags) as [string, RedFlag][]) {
    const carriers = items.filter((item) => item.redFlagId === redFlagId);
    const entry = (carrier: Flaggable | undefined, flag?: FlagRecord): DebriefFlag => ({
      redFlagId,
      label: redFlag.label,
      tactic: redFlag.tactic,
      explanation: redFlag.explanation,
      evidenceText: carrier?.text ?? { en: "" },
      where: carrier?.where ?? "message",
      player:
        flag === undefined
          ? undefined
          : { text: flag.text, tactic: flag.tactic, note: flag.note, judge: flag.judge },
    });

    const catching = flags.filter((f) => f.catches.includes(redFlagId));
    const seenCarrier = carriers.find((c) => seen.has(c.id));
    const reachable = carriers.find((c) => c.hidden && c.nodeIds.some((id) => visited.has(id)));
    const shown = seenCarrier ?? carriers[0];

    if (catching.length > 0) {
      const flag = bestFlag(catching, redFlag.tactic)!;
      const right = reasonIsRight(flag, redFlag.tactic);
      (right ? result.caught : result.spotted).push(entry(shown, flag));
      points += right ? POINTS.rightReason : POINTS.wrongReason;
      if (goodNote(flag)) points += POINTS.goodNote;
      result.score.max += POINTS.rightReason;
    } else if (seenCarrier !== undefined) {
      result.missed.push(entry(seenCarrier));
      result.score.max += POINTS.rightReason;
    } else if (reachable !== undefined) {
      result.notInspected.push(entry(reachable));
      result.score.max += POINTS.rightReason;
    } else {
      result.notReached.push(entry(carriers[0]));
    }
  }

  for (const flag of flags) {
    if (flag.catches.length > 0) continue;
    result.falseAlarms.push({ id: flag.id, text: flag.text, tactic: flag.tactic });
    points += POINTS.falseAlarm;
  }

  for (const node of Object.values(scenario.nodes)) {
    if (node.kind !== "triage") continue;
    for (const item of node.items) {
      const chosen = run.classifications[item.id];
      result.triage.push({
        itemId: item.id,
        subject: item.email.subject,
        chosen,
        correct: item.correct,
        isCorrect: chosen === item.correct,
        explanation: item.explanation,
      });
    }
  }

  result.score.points = Math.max(0, points);
  result.score.rank = rankFor(result.score.points, result.score.max, result.falseAlarms.length);
  return result;
}
