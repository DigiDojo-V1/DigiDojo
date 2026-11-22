import { beforeEach, describe, expect, it } from "vitest";
import { currentNodeId, useRunStore } from "@/engine/store";
import { validScenario } from "./fixtures";

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
    run().choose({ label: "Pay", nextNodeId: "follow-up" });
    expect(run().trail).toEqual([{ nodeId: "start", choiceLabel: "Pay" }, { nodeId: "follow-up" }]);
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
    run().choose({ label: "Pay", nextNodeId: "follow-up" });
    run().choose({ label: "Pay again", nextNodeId: "lost" });
    run().rewind("start");
    expect(run().trail).toEqual([{ nodeId: "start" }]);
    expect(run().flagged).toEqual(["m2"]);
    expect(run().seen).toEqual(["m2"]);
    expect(run().rewinds).toBe(1);
  });
});
