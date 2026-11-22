import { describe, expect, it } from "vitest";
import { defineDojo, defineScenario } from "@/engine/define";
import { DojoSchema, ScenarioSchema, type ScenarioInput } from "@/engine/schema";
import { validScenarioInput as validScenario } from "./fixtures";

function thread(s: ScenarioInput, id: string) {
  const node = s.nodes[id];
  if (node?.kind !== "thread") throw new Error(`fixture node ${id} is not a thread`);
  return node;
}

function errorsFor(s: unknown): string[] {
  const result = ScenarioSchema.safeParse(s);
  return result.success ? [] : result.error.issues.map((i) => i.message);
}

describe("ScenarioSchema", () => {
  it("accepts a valid scenario", () => {
    expect(errorsFor(validScenario())).toEqual([]);
  });

  it("rejects a startNodeId that isn't a node", () => {
    const s = validScenario();
    s.startNodeId = "nowhere";
    expect(errorsFor(s)).toContainEqual(expect.stringContaining('startNodeId "nowhere"'));
  });

  it("rejects a nextNodeId that isn't a node", () => {
    const s = validScenario();
    thread(s, "start").choices[0]!.nextNodeId = "nowhere";
    expect(errorsFor(s)).toContainEqual(expect.stringContaining('nextNodeId "nowhere"'));
  });

  it("rejects a rewindToNodeId that isn't a node", () => {
    const s = validScenario();
    const lost = s.nodes.lost;
    if (lost?.kind !== "outcome") throw new Error("fixture");
    lost.rewindToNodeId = "nowhere";
    expect(errorsFor(s)).toContainEqual(expect.stringContaining('rewindToNodeId "nowhere"'));
  });

  it("rejects a rewindToNodeId that points at an outcome", () => {
    const s = validScenario();
    const lost = s.nodes.lost;
    if (lost?.kind !== "outcome") throw new Error("fixture");
    lost.rewindToNodeId = "safe";
    expect(errorsFor(s)).toContainEqual(expect.stringContaining("must point to a thread node"));
  });

  it("rejects a redFlagId that isn't defined", () => {
    const s = validScenario();
    thread(s, "start").messages[0]!.redFlagId = "made-up";
    expect(errorsFor(s)).toContainEqual(expect.stringContaining('redFlagId "made-up"'));
  });

  it("rejects a red flag no message uses", () => {
    const s = validScenario();
    s.redFlags.unused = { label: "Unused", tactic: "flattery", explanation: "x" };
    expect(errorsFor(s)).toContainEqual(expect.stringContaining('red flag "unused"'));
  });

  it("rejects duplicate message ids across nodes", () => {
    const s = validScenario();
    thread(s, "follow-up").messages[0]!.id = "m1";
    expect(errorsFor(s)).toContainEqual(expect.stringContaining('message id "m1"'));
  });

  it("rejects a scenario where no outcome is reachable", () => {
    const s = validScenario();
    thread(s, "start").choices = [{ label: "Loop", nextNodeId: "follow-up" }];
    thread(s, "follow-up").choices = [{ label: "Loop", nextNodeId: "start" }];
    expect(errorsFor(s)).toContainEqual(expect.stringContaining("no outcome node can be reached"));
  });

  it("rejects a thread with no choices", () => {
    const s = validScenario();
    thread(s, "start").choices = [];
    expect(errorsFor(s).length).toBeGreaterThan(0);
  });

  it("rejects an unknown tactic", () => {
    const s = validScenario() as unknown as {
      redFlags: Record<string, { tactic: string }>;
    };
    s.redFlags.hurry!.tactic = "made-up-tactic";
    expect(errorsFor(s).length).toBeGreaterThan(0);
  });

  it("rejects unknown keys so typos don't slip through", () => {
    const s = { ...validScenario(), startNode: "start" };
    expect(errorsFor(s).length).toBeGreaterThan(0);
  });

  it("rejects ids that aren't kebab-case", () => {
    const s = validScenario();
    s.id = "Not Kebab";
    expect(errorsFor(s).length).toBeGreaterThan(0);
  });
});

describe("DojoSchema", () => {
  const dojo = () => ({
    id: "easy-money" as const,
    order: 1,
    name: "Easy Money",
    tagline: "x",
    scenarios: [validScenario()],
  });

  it("accepts a valid dojo", () => {
    expect(DojoSchema.safeParse(dojo()).success).toBe(true);
  });

  it("rejects a scenario whose dojoId doesn't match", () => {
    const d = dojo();
    d.scenarios[0]!.dojoId = "authority";
    expect(DojoSchema.safeParse(d).success).toBe(false);
  });

  it("rejects duplicate scenario ids", () => {
    const d = dojo();
    d.scenarios.push(validScenario());
    expect(DojoSchema.safeParse(d).success).toBe(false);
  });
});

describe("defineScenario / defineDojo", () => {
  it("returns the scenario with plain strings normalised to { en }", () => {
    const s = validScenario();
    const defined = defineScenario(s);
    expect(defined.title).toEqual({ en: "Fixture" });
    expect(defined.startNodeId).toBe(s.startNodeId);
    expect(Object.keys(defined.nodes)).toEqual(Object.keys(s.nodes));
  });

  it("keeps Hinglish when the author provides it", () => {
    const s = { ...validScenario(), title: { en: "Fixture", hinglish: "Fixture wala" } };
    expect(defineScenario(s).title).toEqual({ en: "Fixture", hinglish: "Fixture wala" });
  });

  it("parses already-normalised text the same way (idempotent)", () => {
    const once = defineScenario(validScenario());
    expect(defineScenario(once)).toEqual(once);
  });

  it("rejects empty text and unknown text keys", () => {
    expect(errorsFor({ ...validScenario(), title: "" }).length).toBeGreaterThan(0);
    expect(
      errorsFor({ ...validScenario(), title: { hinglish: "Sirf hinglish" } }).length,
    ).toBeGreaterThan(0);
    expect(
      errorsFor({ ...validScenario(), title: { en: "x", hindi: "y" } }).length,
    ).toBeGreaterThan(0);
  });

  it("throws a readable error for an invalid scenario", () => {
    const s = validScenario();
    s.startNodeId = "nowhere";
    expect(() => defineScenario(s)).toThrow(/Invalid scenario "easy-money\/fixture"[\s\S]*nowhere/);
  });

  it("throws for an invalid dojo", () => {
    expect(() =>
      defineDojo({ id: "easy-money", order: 0, name: "x", tagline: "x", scenarios: [] }),
    ).toThrow(/Invalid dojo "easy-money"/);
  });
});
