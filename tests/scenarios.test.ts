import { describe, expect, it } from "vitest";
import { z } from "zod";
import { DOJOS } from "@/dojos/registry";
import {
  answerSpans,
  sentenceCatches,
  splitSentences,
  targetText,
  textTargets,
} from "@/engine/highlight";
import { DOJO_IDS, DojoSchema, ScenarioSchema } from "@/engine/schema";
import { LOCALES } from "@/i18n/locale";

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

  it.each(dojo.scenarios.map((s) => [s.id, s] as const))(
    "scenario %s: every red-flag phrase can be caught by flagging one sentence",
    (_sid, s) => {
      const uncatchable: string[] = [];
      for (const target of textTargets(s)) {
        for (const locale of LOCALES) {
          const sentences = splitSentences(targetText(target, locale));
          for (const span of answerSpans(target, locale)) {
            if (!sentences.some((r) => sentenceCatches(span, r.start, r.end)))
              uncatchable.push(`${target.id} (${locale}): ${span.redFlagId}`);
          }
        }
      }
      expect(uncatchable).toEqual([]);
    },
  );
});
