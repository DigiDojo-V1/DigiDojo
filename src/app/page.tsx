import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { DojoProgress } from "@/components/progress/DojoProgress";
import { DOJOS } from "@/dojos/registry";
import { scenarioKey } from "@/engine/keys";
import { L, T } from "@/i18n/T";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col gap-6 p-5 pb-10">
      <header className="pt-6">
        <h1 className="text-3xl font-bold tracking-tight">
          <T k="home.title" />
        </h1>
        <p className="mt-1 text-muted-foreground">
          <T k="home.tagline" />
        </p>
      </header>

      <ol className="relative flex flex-col gap-4">
        {/* The path line behind the order numbers. */}
        <div aria-hidden className="absolute top-6 bottom-6 left-5 w-0.5 bg-border" />
        {DOJOS.map((dojo) => (
          <li key={dojo.id} className="relative flex items-stretch gap-3">
            <span className="z-10 mt-4 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {dojo.order}
            </span>
            <Link
              href={`/dojo/${dojo.id}`}
              className="group flex-1 rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition hover:ring-foreground/25 active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold">
                    <L text={dojo.name} />
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    <L text={dojo.tagline} />
                  </p>
                </div>
                <ChevronRight className="mt-0.5 size-5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" />
              </div>
              <p className="mt-3 mb-1.5 text-xs text-muted-foreground">
                <T k="home.scenarioCount" args={[dojo.scenarios.length]} />
              </p>
              <DojoProgress scenarioKeys={dojo.scenarios.map((s) => scenarioKey(dojo.id, s.id))} />
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
