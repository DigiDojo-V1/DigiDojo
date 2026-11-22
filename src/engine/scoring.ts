import type { Message, RedFlag, Scenario, Tactic } from "./schema";

export interface DebriefFlag {
  redFlagId: string;
  label: string;
  tactic: Tactic;
  explanation: string;
  /** Text of the first message carrying this red flag. */
  messageText: string;
}

export interface DebriefResult {
  /** Red flags the player saw and flagged. */
  caught: DebriefFlag[];
  /** Red flags the player saw but didn't flag. */
  missed: DebriefFlag[];
  /** Red flags on messages the player never reached on this path. */
  notReached: DebriefFlag[];
  /** Flagged messages that carry no red flag. */
  falseAlarms: { messageId: string; text: string }[];
}

/** Every message in the scenario, keyed by id. */
export function messagesById(scenario: Scenario): Map<string, Message> {
  const map = new Map<string, Message>();
  for (const node of Object.values(scenario.nodes)) {
    if (node.kind === "thread") {
      for (const message of node.messages) map.set(message.id, message);
    }
  }
  return map;
}

/**
 * Seen = a message carrying the flag was shown. Caught = one of those messages was flagged.
 * A red flag can sit on several messages; seeing or flagging any one of them counts.
 */
export function computeDebrief(
  scenario: Scenario,
  seenIds: readonly string[],
  flaggedIds: readonly string[],
): DebriefResult {
  const seen = new Set(seenIds);
  const flagged = new Set(flaggedIds);
  const messages = messagesById(scenario);
  const result: DebriefResult = { caught: [], missed: [], notReached: [], falseAlarms: [] };

  for (const [redFlagId, redFlag] of Object.entries(scenario.redFlags) as [string, RedFlag][]) {
    const carriers = [...messages.values()].filter((m) => m.redFlagId === redFlagId);
    const entry: DebriefFlag = {
      redFlagId,
      label: redFlag.label,
      tactic: redFlag.tactic,
      explanation: redFlag.explanation,
      messageText: carriers[0]?.text ?? "",
    };
    if (carriers.some((m) => flagged.has(m.id))) result.caught.push(entry);
    else if (carriers.some((m) => seen.has(m.id))) result.missed.push(entry);
    else result.notReached.push(entry);
  }

  for (const id of flagged) {
    const message = messages.get(id);
    if (message !== undefined && message.redFlagId === undefined) {
      result.falseAlarms.push({ messageId: id, text: message.text });
    }
  }

  return result;
}
