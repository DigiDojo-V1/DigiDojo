import { z } from "zod";
import { DojoSchema, ScenarioSchema, type Dojo, type Scenario } from "./schema";

function assertValid<T>(schema: z.ZodType<T>, value: T, label: string): void {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid ${label}:\n${z.prettifyError(result.error)}`);
  }
}

/**
 * Declare a scenario. Returns it unchanged. Outside production it is validated against
 * every rule in CONTEXT.md §5 and throws a readable error if anything is wrong.
 */
export function defineScenario(scenario: Scenario): Scenario {
  if (process.env.NODE_ENV !== "production") {
    assertValid(ScenarioSchema, scenario, `scenario "${scenario.dojoId}/${scenario.id}"`);
  }
  return scenario;
}

/** Declare a dojo. Returns it unchanged, validated outside production. */
export function defineDojo(dojo: Dojo): Dojo {
  if (process.env.NODE_ENV !== "production") {
    assertValid(DojoSchema, dojo, `dojo "${dojo.id}"`);
  }
  return dojo;
}
