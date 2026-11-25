import { beforeEach, describe, expect, it } from "vitest";
import { currentNodeId, useProgressStore, useRunStore } from "@/engine/store";
import { makeFlag, richScenario, validScenario } from "./fixtures";

const run = () => useRunStore.getState();

describe("run store", () => {
  beforeEach(() => run().start("easy-money/fixture", validScenario()));

  it("starts on the primer when the scenario has one", () => {
    expect(run().phase).toBe("primer");
    expect(currentNodeId(run())).toBe("start");
  });

  it("opens on how to play when asked, then goes to the primer", () => {
    run().start("k", validScenario(), { tutorial: true });
    expect(run().phase).toBe("tutorial");
    run().finishTutorial();
    expect(run().phase).toBe("primer");
  });

  it("goes from how to play straight into play on a cold run", () => {
    run().start("k", { ...validScenario(), coldRun: true }, { tutorial: true });
    expect(run().phase).toBe("tutorial");
    run().finishTutorial();
    expect(run().phase).toBe("playing");
  });

  it("reopens how to play from the primer and returns to it", () => {
    run().openTutorial();
    expect(run().phase).toBe("tutorial");
    run().finishTutorial();
    expect(run().phase).toBe("primer");
  });

  it("only reopens how to play from the primer", () => {
    run().beginSimulation();
    run().openTutorial();
    expect(run().phase).toBe("playing");
  });

  it("skips the primer on a cold run", () => {
    run().start("k", { ...validScenario(), coldRun: true });
    expect(run().phase).toBe("playing");
  });

  it("records the choice and moves to the next node", () => {
    run().choose({ label: { en: "Pay" }, nextNodeId: "follow-up" });
    expect(run().trail).toEqual([
      { nodeId: "start", choiceLabel: { en: "Pay" } },
      { nodeId: "follow-up" },
    ]);
  });

  it("saves, edits and removes flags", () => {
    const flag = makeFlag(validScenario(), "m2", { phrase: "Send ₹500" });
    run().saveFlag(flag);
    expect(Object.keys(run().flags)).toEqual([flag.id]);
    run().setFlagReason(flag.id, "pay-to-earn", "pay first");
    expect(run().flags[flag.id]).toMatchObject({ tactic: "pay-to-earn", note: "pay first" });
    run().setJudge(flag.id, { verdict: "good", feedback: "Yes." });
    expect(run().flags[flag.id]?.judge).toEqual({ verdict: "good", feedback: "Yes." });
    // A new reason clears the old grade.
    run().setFlagReason(flag.id, "urgency", "hurry");
    expect(run().flags[flag.id]?.judge).toBeUndefined();
    run().removeFlag(flag.id);
    expect(run().flags).toEqual({});
  });

  it("ignores grades for a removed flag", () => {
    run().setJudge("nope", "error");
    expect(run().flags).toEqual({});
  });

  it("rewinds to the target node and keeps flags and seen messages", () => {
    const flag = makeFlag(validScenario(), "m2", { phrase: "Send ₹500" });
    run().markSeen("m2");
    run().saveFlag(flag);
    run().choose({ label: { en: "Pay" }, nextNodeId: "follow-up" });
    run().choose({ label: { en: "Pay again" }, nextNodeId: "lost" });
    run().rewind("start");
    expect(run().trail).toEqual([{ nodeId: "start" }]);
    expect(Object.keys(run().flags)).toEqual([flag.id]);
    expect(run().seen).toEqual(["m2"]);
    expect(run().rewinds).toBe(1);
  });

  it("reveals many ids at once without duplicates", () => {
    run().reveal(["a", "b", "a"]);
    run().reveal(["b", "c"]);
    expect(run().seen).toEqual(["a", "b", "c"]);
  });

  it("records every node visited, across rewinds", () => {
    expect(run().visited).toEqual(["start"]);
    run().choose({ label: { en: "Pay" }, nextNodeId: "follow-up" });
    run().choose({ label: { en: "Pay again" }, nextNodeId: "lost" });
    run().rewind("start");
    run().choose({ label: { en: "Block" }, nextNodeId: "safe" });
    expect(run().visited).toEqual(["start", "follow-up", "lost", "safe"]);
  });

  it("classifies triage items and moves on when submitted", () => {
    run().start("dream-job/rich", richScenario());
    run().classify("t-real", "scam");
    run().classify("t-real", "legit");
    expect(run().classifications).toEqual({ "t-real": "legit" });
    run().submitTriage("safe");
    expect(currentNodeId(run())).toBe("safe");
    expect(run().visited).toContain("safe");
  });

  it("starts every run with empty triage labels and no flags", () => {
    run().classify("t-real", "legit");
    run().saveFlag(makeFlag(validScenario(), "m1", { phrase: "Hello" }));
    run().start("easy-money/fixture", validScenario());
    expect(run().classifications).toEqual({});
    expect(run().flags).toEqual({});
  });
});

describe("progress store", () => {
  it("remembers that how to play was seen, and keeps it across a progress reset", () => {
    useProgressStore.setState({ tutorialSeen: false });
    useProgressStore.getState().markTutorialSeen();
    useProgressStore.getState().resetProgress();
    expect(useProgressStore.getState().tutorialSeen).toBe(true);
  });
});
