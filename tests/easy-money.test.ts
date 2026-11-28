import { describe, expect, it } from "vitest";
import { easyMoney } from "@/dojos/easy-money";
import { collectFlaggables, nextNodeIds } from "@/engine/evidence";
import type { Scenario } from "@/engine/schema";
import { computeDebrief } from "@/engine/scoring";

const scenario = (id: string): Scenario => {
  const s = easyMoney.scenarios.find((x) => x.id === id);
  if (s === undefined) throw new Error(`missing scenario ${id}`);
  return s;
};

/** Every string anywhere in the dojo, for blanket safety checks. */
function allStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => allStrings(v, out));
  else if (value !== null && typeof value === "object")
    Object.values(value).forEach((v) => allStrings(v, out));
  return out;
}

/** Node ids reachable from the start. */
function reachable(s: Scenario): Set<string> {
  const seen = new Set<string>();
  const queue = [s.startNodeId];
  while (queue.length > 0) {
    const id = queue.shift()!;
    if (seen.has(id)) continue;
    seen.add(id);
    const node = s.nodes[id];
    if (node !== undefined && node.kind !== "outcome") queue.push(...nextNodeIds(node));
  }
  return seen;
}

describe("Easy Money dojo", () => {
  it("has the three scripted scenarios in order, and takeaways", () => {
    expect(easyMoney.scenarios.map((s) => s.id)).toEqual([
      "task-scam",
      "mule-recruitment",
      "paid-user-study",
    ]);
    expect(easyMoney.takeaways?.length).toBeGreaterThanOrEqual(6);
  });

  it("uses only fictional .example domains, example.com and the fictional paynest UPI handle", () => {
    const urls = allStrings(easyMoney).flatMap((s) => s.match(/https?:\/\/[^\s)]+/g) ?? []);
    for (const url of urls) expect(new URL(url).hostname).toMatch(/\.example$/);
    const addresses = allStrings(easyMoney).flatMap((s) => s.match(/[\w.-]+@[\w.-]+/g) ?? []);
    for (const address of addresses) {
      expect(address).toMatch(/(\.example|@example\.com|@paynest)$/);
    }
  });

  it.each(["task-scam", "mule-recruitment", "paid-user-study"])(
    "reaches every node in %s",
    (id) => {
      const s = scenario(id);
      expect([...reachable(s)].toSorted()).toEqual(Object.keys(s.nodes).toSorted());
    },
  );

  it.each(["task-scam", "mule-recruitment"])(
    "puts every %s red flag on a reachable screen",
    (id) => {
      const s = scenario(id);
      const nodes = reachable(s);
      const carried = new Set(
        collectFlaggables(s)
          .filter((f) => f.redFlagId !== undefined && f.nodeIds.some((n) => nodes.has(n)))
          .map((f) => f.redFlagId),
      );
      expect([...carried].toSorted()).toEqual(Object.keys(s.redFlags).toSorted());
    },
  );

  it("hides the group's admins-only clue in the group info panel", () => {
    const carriers = collectFlaggables(scenario("task-scam")).filter(
      (f) => f.redFlagId === "admins-only-group",
    );
    expect(carriers.map((c) => c.panelId)).toEqual(["taskearn-group", "taskearn-group"]);
  });

  it("makes the mule endings compromised, with no money gained", () => {
    const mule = scenario("mule-recruitment");
    for (const id of ["mule-caught", "reported"]) {
      expect(mule.nodes[id]).toMatchObject({ kind: "outcome", result: "compromised" });
      expect(mule.nodes[id]).not.toHaveProperty("moneyDelta");
    }
  });

  it("makes the paid study red-flag free and ignoring it a missed opportunity", () => {
    const study = scenario("paid-user-study");
    expect(study.legit).toBe(true);
    expect(study.redFlags).toEqual({});
    expect(study.nodes.missed).toMatchObject({ kind: "outcome", result: "missed-opportunity" });

    const result = computeDebrief(study, {
      seen: [],
      flags: {},
      visited: ["study-invite", "booked"],
      classifications: {},
    });
    expect(result.missed).toEqual([]);
    expect(result.falseAlarms).toEqual([]);
  });
});
