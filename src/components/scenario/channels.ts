import type { AppTheme, Scenario } from "@/engine/schema";

/** Where a step of a scenario happens. "inbox" is the triage screen. */
export type Channel = AppTheme | "inbox";

/**
 * The apps a scenario moves through, in the order the player first meets them
 * (breadth-first from the start node). Example: linkedin → whatsapp → gmail.
 */
export function scenarioChannels(scenario: Scenario): Channel[] {
  const channels: Channel[] = [];
  const seen = new Set<string>();
  const queue = [scenario.startNodeId];

  while (queue.length > 0) {
    const id = queue.shift();
    if (id === undefined || seen.has(id)) continue;
    seen.add(id);
    const node = scenario.nodes[id];
    if (node === undefined || node.kind === "outcome") continue;

    const channel: Channel = node.kind === "triage" ? "inbox" : node.app;
    if (!channels.includes(channel)) channels.push(channel);

    if (node.kind === "triage") queue.push(node.nextNodeId);
    else queue.push(...node.choices.map((choice) => choice.nextNodeId));
  }
  return channels;
}
