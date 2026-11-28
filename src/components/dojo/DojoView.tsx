"use client";

import { Check, ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BIG_CARD, CARD_PAD } from "@/components/home/HomeShell";
import { DISPLAY, MONO } from "@/components/landing/styles";
import { DojoProgress } from "@/components/progress/DojoProgress";
import type { LocalizedText } from "@/engine/schema";
import { useHydrated, useProgressStore } from "@/engine/store";
import { useT, useText } from "@/i18n/hooks";
import { APP_HOME } from "@/lib/routes";
import { cn } from "@/lib/utils";

export interface DojoViewScenario {
  /** Progress key, `scenarioKey(dojoId, scenarioId)`. */
  key: string;
  href: string;
  title: LocalizedText;
  summary: LocalizedText;
  /** Illustration path under /public. Without it the card's art area stays empty. */
  image?: string;
}

export interface DojoViewProps {
  order: number;
  name: LocalizedText;
  tagline: LocalizedText;
  takeaways?: readonly LocalizedText[];
  scenarios: readonly DojoViewScenario[];
}

/**
 * One dojo's page, inside `HomeShell`: back link and progress, the dojo's name, a row of tall
 * scenario cards (one, two or three to a row by width; extra cards wrap), and the takeaways.
 */
export function DojoView({ order, name, tagline, takeaways, scenarios }: DojoViewProps) {
  const t = useT();
  const text = useText();

  return (
    <section className={cn(BIG_CARD, "flex flex-1 flex-col overflow-hidden")}>
      <div className={cn(CARD_PAD, "pt-6 md:pt-8 lg:pt-10")}>
        {/* Back + eyebrow on the left, this dojo's progress on the right. */}
        <div className="flex h-10 items-center justify-between gap-4">
          <p className={`${MONO} flex items-center text-black/55`}>
            <Link
              href={APP_HOME}
              aria-label={t("nav.backToHome")}
              className="mr-1 -ml-2 flex size-8 items-center justify-center rounded-full transition hover:bg-black/5"
            >
              <ChevronLeft aria-hidden className="size-4" />
            </Link>
            {t("dojo.eyebrow")(order)}
          </p>
          {scenarios.length > 0 && (
            <div className="w-28 sm:w-40">
              <DojoProgress
                scenarioKeys={scenarios.map((s) => s.key)}
                className="[&_[data-slot=progress-track]]:bg-black/10"
              />
            </div>
          )}
        </div>

        <h2
          className={`${DISPLAY} mt-4 text-[clamp(48px,min(8vw,12dvh),112px)] leading-[0.85] md:mt-6`}
        >
          {text(name)}
        </h2>
        <p className="mt-3 max-w-md text-base text-black/70 md:text-lg">{text(tagline)}</p>
      </div>

      {scenarios.length === 0 ? (
        <div className={cn(CARD_PAD, "py-8 md:py-10")}>
          <p className="rounded-2xl border border-dashed border-black/20 py-10 text-center text-sm text-black/55">
            {t("dojo.empty")}
          </p>
        </div>
      ) : (
        <ol
          aria-label={t("dojo.scenarios")}
          className={cn(
            CARD_PAD,
            "grid grid-cols-1 gap-3 py-8 sm:grid-cols-2 md:gap-4 md:py-10 lg:grid-cols-3",
          )}
        >
          {scenarios.map((scenario, i) => (
            <li key={scenario.key} className="flex">
              <ScenarioCard scenario={scenario} index={i} />
            </li>
          ))}
        </ol>
      )}

      {takeaways !== undefined && (
        <div className={cn(CARD_PAD, "border-t border-black/10 py-6 md:py-8")}>
          <h3 className={`${MONO} text-black/55`}>{t("dojo.takeaways")}</h3>
          <ol className="mt-4 grid gap-3 lg:grid-cols-3 lg:gap-8">
            {takeaways.map((takeaway, i) => (
              <li key={i} className="flex gap-3 text-sm leading-snug text-black/70">
                <span className={`${MONO} w-4 shrink-0 leading-5 text-black/45`}>{i + 1}</span>
                {text(takeaway)}
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}

/** A tall card: number and done check on top, room for an illustration, title and summary below. */
function ScenarioCard({ scenario, index }: { scenario: DojoViewScenario; index: number }) {
  const t = useT();
  const text = useText();
  const hydrated = useHydrated();
  const done = useProgressStore((s) => s.completed[scenario.key] === true) && hydrated;

  return (
    <Link
      href={scenario.href}
      className="group flex min-h-[320px] w-full flex-col rounded-[22px] bg-white/60 p-5 ring-1 ring-black/10 transition hover:bg-white/80 hover:ring-black/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/40 active:scale-[0.99] sm:min-h-[clamp(380px,55dvh,520px)]"
    >
      <div className="flex items-center justify-between">
        <span className={`${MONO} text-black/55 tabular-nums`}>
          {String(index + 1).padStart(2, "0")}
        </span>
        {done && (
          <span className="flex size-6 items-center justify-center rounded-full bg-[#121212] text-[#f3f1ec]">
            <Check aria-hidden className="size-3.5" strokeWidth={3} />
          </span>
        )}
        <span className="sr-only">{t(done ? "progress.completed" : "progress.notCompleted")}</span>
      </div>

      {/* The scenario's square illustration; the space below it pushes the title to the bottom. */}
      <div data-slot="art" aria-hidden className="flex-1">
        {scenario.image !== undefined && (
          <div className="relative my-4 aspect-square w-full">
            <Image
              src={scenario.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
              className="rounded-2xl object-cover ring-1 ring-black/5"
            />
          </div>
        )}
      </div>

      <h3 className="text-lg leading-snug font-semibold">{text(scenario.title)}</h3>
      <p className="mt-1.5 line-clamp-3 text-sm leading-snug text-black/60">
        {text(scenario.summary)}
      </p>
    </Link>
  );
}
