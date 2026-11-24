import { describe, expect, it } from "vitest";
import { defineDojo, defineScenario } from "@/engine/define";
import { DojoSchema, ScenarioSchema, type ScenarioInput } from "@/engine/schema";
import { richScenarioInput, validScenarioInput as validScenario } from "./fixtures";

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
    expect(errorsFor(s)).toContainEqual(expect.stringContaining("must point to a thread, email"));
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
    expect(errorsFor(s)).toContainEqual(expect.stringContaining('flaggable id "m1"'));
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

describe("ScenarioSchema with evidence", () => {
  type Rich = ReturnType<typeof richScenarioInput>;
  const node = <K extends string>(s: Rich, id: string, kind: K) => {
    const n = s.nodes[id];
    if (n?.kind !== kind) throw new Error(`fixture node ${id} is not ${kind}`);
    return n as Extract<Rich["nodes"][string], { kind: K }>;
  };

  it("accepts a scenario using segments, panels, email, compose and triage", () => {
    expect(errorsFor(richScenarioInput())).toEqual([]);
  });

  it("needs exactly one of text or segments on a message", () => {
    const both = richScenarioInput();
    node(both, "dm", "thread").messages[0]!.text = "Also text";
    expect(errorsFor(both)).toContainEqual(
      expect.stringContaining("exactly one of text or segments"),
    );

    const neither = richScenarioInput();
    delete node(neither, "dm", "thread").messages[0]!.segments;
    expect(errorsFor(neither)).toContainEqual(
      expect.stringContaining("exactly one of text or segments"),
    );
  });

  it("rejects a redFlagId on a segmented message", () => {
    const s = richScenarioInput();
    node(s, "dm", "thread").messages[0]!.redFlagId = "fee";
    expect(errorsFor(s)).toContainEqual(expect.stringContaining("put redFlagId on a segment"));
  });

  it("rejects a flagged segment without an id", () => {
    const s = richScenarioInput();
    delete node(s, "dm", "thread").messages[0]!.segments![1]!.id;
    expect(errorsFor(s)).toContainEqual(expect.stringContaining("needs an id"));
  });

  it("rejects duplicate ids across kinds of flaggable items", () => {
    const s = richScenarioInput();
    node(s, "mail", "email").email.to.id = "p-joined";
    expect(errorsFor(s)).toContainEqual(expect.stringContaining('flaggable id "p-joined"'));
  });

  it("rejects evidence and document references that aren't panels", () => {
    const s = richScenarioInput();
    node(s, "dm", "thread").evidence = ["nowhere"];
    node(s, "mail", "email").email.attachments![0]!.documentId = "missing-pdf";
    const errors = errorsFor(s);
    expect(errors).toContainEqual(expect.stringContaining('evidence "nowhere"'));
    expect(errors).toContainEqual(expect.stringContaining('documentId "missing-pdf"'));
  });

  it("rejects an undefined red flag on an email field and on a panel field", () => {
    const s = richScenarioInput();
    node(s, "mail", "email").email.from.redFlagId = "made-up";
    s.evidence!.profile!.sections[0]!.fields[0]!.redFlagId = "also-made-up";
    const errors = errorsFor(s);
    expect(errors).toContainEqual(expect.stringContaining('"made-up"'));
    expect(errors).toContainEqual(expect.stringContaining('"also-made-up"'));
  });

  it("rejects a triage nextNodeId that isn't a node", () => {
    const s = richScenarioInput();
    node(s, "inbox", "triage").nextNodeId = "nowhere";
    expect(errorsFor(s)).toContainEqual(expect.stringContaining('nextNodeId "nowhere"'));
  });

  it("follows email, compose and triage edges when checking an outcome is reachable", () => {
    const s = richScenarioInput();
    node(s, "dm", "thread").choices = [{ label: "Email", nextNodeId: "mail" }];
    node(s, "mail", "email").choices = [{ label: "Reply", nextNodeId: "reply" }];
    expect(errorsFor(s)).toEqual([]);
    node(s, "inbox", "triage").nextNodeId = "dm";
    expect(errorsFor(s)).toContainEqual(expect.stringContaining("no outcome node can be reached"));
  });

  it("rejects gmail as a thread app", () => {
    const s = richScenarioInput();
    (node(s, "dm", "thread") as { app: string }).app = "gmail";
    expect(errorsFor(s).length).toBeGreaterThan(0);
  });
});

describe("ScenarioSchema display hints", () => {
  type Rich = ReturnType<typeof richScenarioInput>;
  const dm = (s: Rich) => {
    const n = s.nodes.dm;
    if (n?.kind !== "thread") throw new Error("fixture node dm is not a thread");
    return n;
  };

  it("accepts a message time, a profile slot, a record variant and a split layout", () => {
    const s = richScenarioInput();
    dm(s).messages[0]!.time = "09:14";
    dm(s).layout = "split";
    s.evidence!.profile!.sections[0]!.fields[0]!.slot = "headline";
    s.evidence!.record = {
      kind: "company",
      variant: "official-record",
      title: "Record",
      sections: [{ fields: [{ id: "rec-date", value: "Incorporated 2021" }] }],
    };
    expect(errorsFor(s)).toEqual([]);
  });

  it("rejects unknown slot, variant and layout values", () => {
    const s = richScenarioInput();
    (dm(s) as { layout?: string }).layout = "side-by-side";
    (s.evidence!.profile!.sections[0]!.fields[0]! as { slot?: string }).slot = "photo";
    (s.evidence!.profile! as { variant?: string }).variant = "fancy";
    expect(errorsFor(s).length).toBeGreaterThanOrEqual(3);
  });

  it("rejects a slot outside a profile and a record variant outside a company", () => {
    const s = richScenarioInput();
    s.evidence!["offer-pdf"]!.sections[0]!.fields[0]!.slot = "name";
    s.evidence!["offer-pdf"]!.variant = "official-record";
    const errors = errorsFor(s);
    expect(errors).toContainEqual(expect.stringContaining("slots are for profile panels only"));
    expect(errors).toContainEqual(expect.stringContaining('needs kind "company"'));
  });

  it("rejects a split layout without evidence", () => {
    const s = richScenarioInput();
    dm(s).layout = "split";
    delete dm(s).evidence;
    expect(errorsFor(s)).toContainEqual(expect.stringContaining('layout "split" needs evidence'));
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

  it("accepts takeaways but not an empty list", () => {
    expect(
      DojoSchema.safeParse({ ...dojo(), takeaways: ["Never pay to get a job."] }).success,
    ).toBe(true);
    expect(DojoSchema.safeParse({ ...dojo(), takeaways: [] }).success).toBe(false);
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
