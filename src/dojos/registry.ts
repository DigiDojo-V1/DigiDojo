import type { Dojo, Scenario } from "@/engine/schema";
import { authority } from "./authority";
import { dreamJob } from "./dream-job";
import { easyMoney } from "./easy-money";
import { trustMeBro } from "./trust-me-bro";

/** Every dojo on the home path, in order. Lead edits only. */
export const DOJOS: readonly Dojo[] = [easyMoney, dreamJob, trustMeBro, authority].toSorted(
  (a, b) => a.order - b.order,
);

export function getDojo(dojoId: string): Dojo | undefined {
  return DOJOS.find((dojo) => dojo.id === dojoId);
}

export function getScenario(dojoId: string, scenarioId: string): Scenario | undefined {
  return getDojo(dojoId)?.scenarios.find((scenario) => scenario.id === scenarioId);
}
