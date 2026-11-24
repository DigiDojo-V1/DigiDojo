import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CompletedTick } from "@/components/progress/CompletedTick";
import { TopBar } from "@/components/TopBar";
import { Badge } from "@/components/ui/badge";
import { DOJOS, getDojo } from "@/dojos/registry";
import { scenarioKey } from "@/engine/keys";
import { DEFAULT_LOCALE } from "@/i18n/locale";
import { L, T } from "@/i18n/T";
import { resolveText } from "@/i18n/text";

/** Only ids in the registry exist. Anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return DOJOS.map((dojo) => ({ dojoId: dojo.id }));
}

export async function generateMetadata({ params }: PageProps<"/dojo/[dojoId]">): Promise<Metadata> {
  const { dojoId } = await params;
  const dojo = getDojo(dojoId);
  const name = dojo === undefined ? "Dojo" : resolveText(dojo.name, DEFAULT_LOCALE);
  return { title: `${name} · DigiDojo` };
}

export default async function DojoPage({ params }: PageProps<"/dojo/[dojoId]">) {
  const { dojoId } = await params;
  const dojo = getDojo(dojoId);
  if (dojo === undefined) notFound();

  return (
    <main className="flex flex-1 flex-col gap-5 p-5 pb-10">
      <TopBar back={{ href: "/", label: "nav.backToHome" }} />

      <header>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          <T k="dojo.eyebrow" args={[dojo.order]} />
        </p>
        <h1 className="text-2xl font-bold tracking-tight">
          <L text={dojo.name} />
        </h1>
        <p className="mt-1 text-muted-foreground">
          <L text={dojo.tagline} />
        </p>
      </header>

      {dojo.scenarios.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          <T k="dojo.empty" />
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
                  <h2 className="font-medium">
                    <L text={scenario.title} />
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    <L text={scenario.summary} />
                  </p>
                  {(scenario.legit || scenario.coldRun === true) && (
                    <div className="mt-2 flex gap-1.5">
                      {scenario.legit && (
                        <Badge variant="secondary">
                          <T k="dojo.legit" />
                        </Badge>
                      )}
                      {scenario.coldRun === true && (
                        <Badge variant="outline">
                          <T k="dojo.coldRun" />
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {dojo.takeaways !== undefined && (
        <section className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <h2 className="mb-2 font-semibold">
            <T k="dojo.takeaways" />
          </h2>
          <ul className="list-disc space-y-1.5 pl-5 text-sm">
            {dojo.takeaways.map((takeaway, i) => (
              <li key={i}>
                <L text={takeaway} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
