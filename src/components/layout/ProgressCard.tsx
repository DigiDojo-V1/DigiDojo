"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { DojoProgress } from "@/components/progress/DojoProgress";
import { useHydrated, useProgressStore } from "@/engine/store";
import { useT, useText } from "@/i18n/hooks";
import { useDojoSummaries } from "./chrome-data";

/** Left column on desktop: the player's card, like a profile card, with progress per dojo. */
export function ProgressCard() {
  const t = useT();
  const text = useText();
  const dojos = useDojoSummaries();
  const hydrated = useHydrated();
  const completed = useProgressStore((s) => s.completed);
  const keys = dojos.flatMap((d) => d.scenarioKeys);
  const done = hydrated ? keys.filter((k) => completed[k]).length : 0;

  return (
    <section className="overflow-hidden rounded-lg bg-white ring-1 ring-black/10">
      <div aria-hidden className="h-14 bg-gradient-to-r from-slate-700 to-slate-500" />
      <div className="-mt-9 px-4 pb-4">
        <span
          aria-hidden
          className="flex size-[72px] items-center justify-center rounded-full border-2 border-white bg-slate-200 text-slate-600"
        >
          <UserRound className="size-9" />
        </span>
        <h2 className="mt-2 text-lg leading-tight font-semibold">{t("chrome.progressTitle")}</h2>
        <p className="mt-0.5 text-xs text-black/60">{t("chrome.progressBody")(done, keys.length)}</p>
      </div>
      <ul className="divide-y divide-black/5 border-t border-black/10">
        {dojos.map((dojo) => (
          <li key={dojo.id}>
            <Link href={`/dojo/${dojo.id}`} className="block px-4 py-2.5 hover:bg-black/[0.03]">
              <span className="mb-1 block truncate text-xs font-semibold text-black/75">
                {text(dojo.name)}
              </span>
              <DojoProgress scenarioKeys={dojo.scenarioKeys} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
