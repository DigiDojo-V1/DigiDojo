import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { CompletedTick } from "@/components/progress/CompletedTick";
import { Badge } from "@/components/ui/badge";
import { DOJOS, getDojo } from "@/dojos/registry";
import { scenarioKey } from "@/engine/keys";

/** Only ids in the registry exist. Anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return DOJOS.map((dojo) => ({ dojoId: dojo.id }));
}

export async function generateMetadata({ params }: PageProps<"/dojo/[dojoId]">): Promise<Metadata> {
  const { dojoId } = await params;
  return { title: `${getDojo(dojoId)?.name ?? "Dojo"} · DigiDojo` };
}

export default async function DojoPage({ params }: PageProps<"/dojo/[dojoId]">) {
  const { dojoId } = await params;
  const dojo = getDojo(dojoId);
  if (dojo === undefined) notFound();

  return (
    <main className="flex flex-1 flex-col gap-5 p-5 pb-10">
      <Link
        href="/"
        aria-label="Back to home"
        className="-ml-1.5 self-start rounded-full p-1.5 hover:bg-muted"
      >
        <ChevronLeft className="size-5" />
      </Link>

      <header>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Dojo {dojo.order}
        </p>
        <h1 className="text-2xl font-bold tracking-tight">{dojo.name}</h1>
        <p className="mt-1 text-muted-foreground">{dojo.tagline}</p>
      </header>

      {dojo.scenarios.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          No scenarios yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {dojo.scenarios.map((scenario) => (
            <li key={scenario.id}>
              <Link
                href={`/dojo/${dojo.id}/${scenario.id}`}
                className="flex items-start gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition hover:ring-foreground/25 active:scale-[0.99]"
              >
                <CompletedTick scenarioKey={scenarioKey(dojo.id, scenario.id)} />
                <div className="min-w-0 flex-1">
                  <h2 className="font-medium">{scenario.title}</h2>
                  <p className="text-sm text-muted-foreground">{scenario.summary}</p>
                  {(scenario.legit || scenario.coldRun === true) && (
                    <div className="mt-2 flex gap-1.5">
                      {scenario.legit && <Badge variant="secondary">Legit</Badge>}
                      {scenario.coldRun === true && <Badge variant="outline">Cold run</Badge>}
                    </div>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
