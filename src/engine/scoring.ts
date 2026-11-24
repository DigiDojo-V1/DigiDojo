import { collectFlaggables, type EvidenceWhere, type Flaggable } from "./evidence";
import type { LocalizedText, RedFlag, Scenario, Tactic, TriageLabel } from "./schema";

export interface DebriefFlag {
  redFlagId: string;
  label: LocalizedText;
  tactic: Tactic;
  explanation: LocalizedText;
  /** Text of the item carrying this red flag: the one flagged or seen if any, else the first. */
  evidenceText: LocalizedText;
  where: EvidenceWhere;
}

export interface DebriefTriageRow {
  itemId: string;
  subject: LocalizedText;
  chosen: TriageLabel | undefined;
  correct: TriageLabel;
  isCorrect: boolean;
  explanation: LocalizedText;
}

export interface DebriefResult {
  /** Red flags the player flagged. */
  caught: DebriefFlag[];
  /** Red flags the player saw but didn't flag. */
  missed: DebriefFlag[];
  /** Red flags on a screen the player reached, hidden behind an inspection they never did. */
  notInspected: DebriefFlag[];
  /** Red flags on screens the player never reached on this path. */
  notReached: DebriefFlag[];
  /** Flagged items that carry no red flag. */
  falseAlarms: { id: string; text: LocalizedText; where: EvidenceWhere }[];
  /** One row per inbox email, if the scenario had a triage. */
  triage: DebriefTriageRow[];
}

export interface RunRecord {
  seen: readonly string[];
  flagged: readonly string[];
  /** Nodes entered during the run. */
  visited: readonly string[];
  classifications: Readonly<Record<string, TriageLabel>>;
}

/**
 * Builds the debrief. A red flag can sit on several items; flagging any one of them catches it,
 * seeing any one of them without flagging misses it.
 */
export function computeDebrief(scenario: Scenario, run: RunRecord): DebriefResult {
  const seen = new Set(run.seen);
  const flagged = new Set(run.flagged);
  const visited = new Set(run.visited);
  const items = collectFlaggables(scenario);
  const result: DebriefResult = {
    caught: [],
    missed: [],
    notInspected: [],
    notReached: [],
    falseAlarms: [],
    triage: [],
  };

  for (const [redFlagId, redFlag] of Object.entries(scenario.redFlags) as [string, RedFlag][]) {
    const carriers = items.filter((item) => item.redFlagId === redFlagId);
    const entry = (carrier: Flaggable | undefined): DebriefFlag => ({
      redFlagId,
      label: redFlag.label,
      tactic: redFlag.tactic,
      explanation: redFlag.explanation,
      evidenceText: carrier?.text ?? { en: "" },
      where: carrier?.where ?? "message",
    });

    const flaggedCarrier = carriers.find((c) => flagged.has(c.id));
    const seenCarrier = carriers.find((c) => seen.has(c.id));
    const reachable = carriers.find((c) => c.hidden && c.nodeIds.some((id) => visited.has(id)));
    if (flaggedCarrier !== undefined) result.caught.push(entry(flaggedCarrier));
    else if (seenCarrier !== undefined) result.missed.push(entry(seenCarrier));
    else if (reachable !== undefined) result.notInspected.push(entry(reachable));
    else result.notReached.push(entry(carriers[0]));
  }

  for (const item of items) {
    if (flagged.has(item.id) && item.redFlagId === undefined) {
      result.falseAlarms.push({ id: item.id, text: item.text, where: item.where });
    }
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

  return result;
}
