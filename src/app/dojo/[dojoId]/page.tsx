import { ArrowUpRight, ChevronDown, EyeOff, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DojoProgress } from "@/components/progress/DojoProgress";
import { ChannelIcon } from "@/components/scenario/ChannelIcon";
import { scenarioChannels } from "@/components/scenario/channels";
import { ScenarioTile } from "@/components/scenario/ScenarioTile";
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
    <main className="flex flex-1 flex-col gap-6 p-5 pb-10">
      <TopBar back={{ href: "/", label: "nav.backToHome" }} />

      <header className="relative overflow-hidden rounded-3xl bg-primary p-5 text-primary-foreground">
        {/* Faint dot grid, top right. Decoration only. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-4 -right-4 size-40 bg-[radial-gradient(currentColor_1px,transparent_1px)] [mask-image:radial-gradient(circle_at_top_right,black,transparent_70%)] [background-size:12px_12px] opacity-15"
        />
        <p className="text-xs font-medium tracking-widest text-primary-foreground/60 uppercase">
          <T k="dojo.eyebrow" args={[dojo.order]} />
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          <L text={dojo.name} />
        </h1>
        <p className="mt-1 text-primary-foreground/70">
          <L text={dojo.tagline} />
        </p>
        {dojo.scenarios.length > 0 && (
          <div className="mt-5">
            <p className="mb-1.5 text-xs text-primary-foreground/60">
              <T k="home.scenarioCount" args={[dojo.scenarios.length]} />
            </p>
            <DojoProgress
              inverted
              scenarioKeys={dojo.scenarios.map((s) => scenarioKey(dojo.id, s.id))}
            />
          </div>
        )}
      </header>

      {dojo.scenarios.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          <T k="dojo.empty" />
        </p>
      ) : (
        <ol className="relative flex flex-col gap-3">
          {/* The path line behind the icon tiles. */}
          <div aria-hidden className="absolute top-8 bottom-8 left-[22px] w-px bg-foreground/10" />
          {dojo.scenarios.map((scenario, index) => {
            const channels = scenarioChannels(scenario);
            return (
              <li key={scenario.id}>
                <Link
                  href={`/dojo/${dojo.id}/${scenario.id}`}
                  className="group flex items-start gap-3"
                >
                  <span className="pt-3">
                    <ScenarioTile
                      channel={channels[0] ?? "gmail"}
                      scenarioKey={scenarioKey(dojo.id, scenario.id)}
                    />
                  </span>
                  <div className="min-w-0 flex-1 rounded-2xl bg-card p-4 ring-1 ring-foreground/10 transition group-hover:ring-foreground/30 group-active:scale-[0.99]">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[11px] font-medium tracking-widest text-muted-foreground tabular-nums">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <ArrowUpRight
                        aria-hidden
                        className="size-4 shrink-0 self-start text-muted-foreground transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
                      />
                    </div>
                    <h2 className="mt-0.5 leading-snug font-semibold">
                      <L text={scenario.title} />
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      <L text={scenario.summary} />
                    </p>
                    {(channels.length > 1 || scenario.legit || scenario.coldRun === true) && (
                      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                        {channels.length > 1 && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <span className="sr-only">
                              <T k="dojo.route" />
                            </span>
                            {channels.map((channel, i) => (
                              <span key={channel} className="flex items-center gap-1">
                                {i > 0 && (
                                  <span aria-hidden className="h-px w-2 bg-foreground/20" />
                                )}
                                <ChannelIcon channel={channel} aria-hidden className="size-3.5" />
                                <span className="sr-only">
                                  <T k={`channel.${channel}`} />
                                </span>
                              </span>
                            ))}
                          </span>
                        )}
                        {scenario.legit && (
                          <Badge variant="secondary" className="gap-1">
                            <ShieldCheck aria-hidden className="size-3" />
                            <T k="dojo.legit" />
                          </Badge>
                        )}
                        {scenario.coldRun === true && (
                          <Badge variant="outline" className="gap-1">
                            <EyeOff aria-hidden className="size-3" />
                            <T k="dojo.coldRun" />
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      )}

      {dojo.takeaways !== undefined && (
        <details className="group border-t border-foreground/10 pt-1">
          <summary className="flex cursor-pointer list-none items-center gap-2 py-3 text-sm font-medium select-none [&::-webkit-details-marker]:hidden">
            <span className="flex-1">
              <T k="dojo.takeaways" />
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {dojo.takeaways.length}
            </span>
            <ChevronDown
              aria-hidden
              className="size-4 text-muted-foreground transition-transform group-open:rotate-180"
            />
          </summary>
          <ol className="divide-y divide-foreground/5 pb-2">
            {dojo.takeaways.map((takeaway, i) => (
              <li key={i} className="flex gap-3 py-2.5 text-sm leading-relaxed">
                <span className="w-4 shrink-0 text-xs leading-6 text-muted-foreground tabular-nums">
                  {i + 1}
                </span>
                <span className="text-foreground/85">
                  <L text={takeaway} />
                </span>
              </li>
            ))}
          </ol>
        </details>
      )}
    </main>
  );
}
