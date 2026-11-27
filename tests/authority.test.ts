import { describe, expect, it } from "vitest";
import { authority } from "@/dojos/authority";
import { nextNodeIds } from "@/engine/evidence";
import { callRedFlagIds } from "@/engine/live-call";
import type { Scenario } from "@/engine/schema";

/** Every node reachable from `from`. */
function reachable(scenario: Scenario, from: string): Set<string> {
  const seen = new Set<string>();
  const queue = [from];
  while (queue.length > 0) {
    const id = queue.shift()!;
    if (seen.has(id)) continue;
    seen.add(id);
    const node = scenario.nodes[id];
    if (node !== undefined) queue.push(...nextNodeIds(node));
  }
  return seen;
}

describe("authority dojo", () => {
  it("has a legit scenario, so rejecting every call doesn't win", () => {
    expect(authority.scenarios.some((s) => s.legit)).toBe(true);
  });

  it.each(authority.scenarios.map((s) => [s.id, s] as const))(
    "%s starts with a live call that can also be played without a mic",
    (_id, scenario) => {
      const start = scenario.nodes[scenario.startNodeId];
      expect(start?.kind).toBe("live-call");
      if (start?.kind !== "live-call") return;
      // The scripted version reaches an outcome on its own.
      const scripted = reachable(scenario, start.scriptedNodeId);
      expect([...scripted].some((id) => scenario.nodes[id]?.kind === "outcome")).toBe(true);
      // Every red flag the caller can use is also in the scripted call, so it can be flagged there.
      for (const id of callRedFlagIds(start)) {
        expect(JSON.stringify([...scripted].map((n) => scenario.nodes[n]))).toContain(
          `"redFlagId":"${id}"`,
        );
      }
    },
  );

  it.each(authority.scenarios.map((s) => [s.id, s] as const))(
    "%s offers a hang-up button on every scripted call screen",
    (_id, scenario) => {
      for (const node of Object.values(scenario.nodes)) {
        if (node.kind !== "thread" || node.app !== "call") continue;
        expect(node.choices.filter((c) => c.hangUp === true)).toHaveLength(1);
      }
    },
  );

  it("uses only made-up banks, agencies and people", () => {
    const text = JSON.stringify(authority);
    for (const real of [
      "Unity National",
      "RBI",
      "Reserve Bank",
      "Narcotics Control Bureau",
      "NCB",
      "Rohit Sharma",
      "Vikram Rathore",
      "WhatsApp",
    ]) {
      expect(text).not.toContain(real);
    }
  });
});
