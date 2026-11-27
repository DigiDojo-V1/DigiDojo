import { DOJOS } from "@/dojos/registry";
import { scenarioKey } from "@/engine/keys";
import type { DojoSummary } from "./chrome-data";

/**
 * The little the app chrome needs about each dojo (names and scenario keys). Built on the
 * server, so client screens get the nav and progress card without bundling every scenario.
 */
export function dojoSummaries(): DojoSummary[] {
  return DOJOS.map((dojo) => ({
    id: dojo.id,
    order: dojo.order,
    name: dojo.name,
    tagline: dojo.tagline,
    scenarioKeys: dojo.scenarios.map((s) => scenarioKey(dojo.id, s.id)),
  }));
}
