import { describe, expect, it } from "vitest";
import { dreamJob } from "@/dojos/dream-job";
import { collectFlaggables } from "@/engine/evidence";

/**
 * Display hints (field slots, panel variants, message times, thread layouts) are visual only.
 * This snapshot pins what the debrief scores, so adding hints can never change it.
 */
describe("Dream Job scoring inputs", () => {
  it.each(dreamJob.scenarios.map((s) => [s.id, s] as const))(
    "%s has the same flaggable items",
    (_id, scenario) => {
      const items = collectFlaggables(scenario).map((f) => ({
        id: f.id,
        redFlagId: f.redFlagId ?? null,
        where: f.where,
        panelId: f.panelId ?? null,
        nodeIds: f.nodeIds,
        hidden: f.hidden,
        text: f.text.en,
      }));
      expect(items).toMatchSnapshot();
    },
  );
});
