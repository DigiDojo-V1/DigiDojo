import { describe, expect, it } from "vitest";
import { z } from "zod";
import { DOJOS } from "@/dojos/registry";
import { DOJO_IDS, DojoSchema, ScenarioSchema } from "@/engine/schema";

describe("registry", () => {
  it("has every dojo exactly once, with unique orders", () => {
    expect(DOJOS.map((d) => d.id).toSorted()).toEqual([...DOJO_IDS].toSorted());
    expect(new Set(DOJOS.map((d) => d.order)).size).toBe(DOJOS.length);
  });

  it("lists dojos in order", () => {
    const orders = DOJOS.map((d) => d.order);
    expect(orders).toEqual(orders.toSorted((a, b) => a - b));
  });
});

describe.each(DOJOS.map((d) => [d.id, d] as const))("dojo %s", (_id, dojo) => {
  it("is valid", () => {
    const result = DojoSchema.safeParse(dojo);
    expect(result.success ? "" : z.prettifyError(result.error)).toBe("");
  });

  it.each(dojo.scenarios.map((s) => [s.id, s] as const))("scenario %s is valid", (_sid, s) => {
    const result = ScenarioSchema.safeParse(s);
    expect(result.success ? "" : z.prettifyError(result.error)).toBe("");
  });
});
