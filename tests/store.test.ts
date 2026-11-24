import { beforeEach, describe, expect, it } from "vitest";
import { currentNodeId, useRunStore } from "@/engine/store";
import { richScenario, validScenario } from "./fixtures";

const run = () => useRunStore.getState();

describe("run store", () => {
  beforeEach(() => run().start("easy-money/fixture", validScenario()));

  it("starts on the primer when the scenario has one", () => {
    expect(run().phase).toBe("primer");
    expect(currentNodeId(run())).toBe("start");
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

  it("toggles flags", () => {
    run().toggleFlag("m1");
    expect(run().flagged).toEqual(["m1"]);
    run().toggleFlag("m1");
    expect(run().flagged).toEqual([]);
  });

  it("rewinds to the target node and keeps flags and seen messages", () => {
    run().markSeen("m2");
    run().toggleFlag("m2");
    run().choose({ label: { en: "Pay" }, nextNodeId: "follow-up" });
    run().choose({ label: { en: "Pay again" }, nextNodeId: "lost" });
    run().rewind("start");
    expect(run().trail).toEqual([{ nodeId: "start" }]);
    expect(run().flagged).toEqual(["m2"]);
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

  it("starts every run with empty triage labels", () => {
    run().classify("t-real", "legit");
    run().start("easy-money/fixture", validScenario());
    expect(run().classifications).toEqual({});
  });
});
