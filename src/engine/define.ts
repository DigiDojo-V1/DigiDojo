import { z } from "zod";
import {
  DojoSchema,
  ScenarioSchema,
  type Dojo,
  type DojoInput,
  type Scenario,
  type ScenarioInput,
} from "./schema";

function parseOrThrow<S extends z.ZodType>(
  schema: S,
  value: z.input<S>,
  label: string,
): z.output<S> {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid ${label}:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

/**
 * Declare a scenario. Validates it against every rule in CONTEXT.md §5 and throws a readable
 * error if anything is wrong. Returns the parsed scenario: plain-string text fields become
 * `{ en }`, so the rest of the app always sees `{ en, hinglish? }`.
 */
export function defineScenario(scenario: ScenarioInput): Scenario {
  return parseOrThrow(ScenarioSchema, scenario, `scenario "${scenario.dojoId}/${scenario.id}"`);
}

/** Declare a dojo. Validated and normalised the same way as `defineScenario`. */
export function defineDojo(dojo: DojoInput): Dojo {
  return parseOrThrow(DojoSchema, dojo, `dojo "${dojo.id}"`);
}
