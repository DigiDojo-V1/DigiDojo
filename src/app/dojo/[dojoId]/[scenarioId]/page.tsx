import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DOJOS, getScenario } from "@/dojos/registry";
import { ScenarioPlayer } from "@/engine/ScenarioPlayer";

/** Only ids in the registry exist. Anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return DOJOS.flatMap((dojo) =>
    dojo.scenarios.map((scenario) => ({ dojoId: dojo.id, scenarioId: scenario.id })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/dojo/[dojoId]/[scenarioId]">): Promise<Metadata> {
  const { dojoId, scenarioId } = await params;
  return { title: `${getScenario(dojoId, scenarioId)?.title ?? "Scenario"} · DigiDojo` };
}

export default async function ScenarioPage({ params }: PageProps<"/dojo/[dojoId]/[scenarioId]">) {
  const { dojoId, scenarioId } = await params;
  const scenario = getScenario(dojoId, scenarioId);
  if (scenario === undefined) notFound();

  return <ScenarioPlayer scenario={scenario} backHref={`/dojo/${dojoId}`} />;
}
