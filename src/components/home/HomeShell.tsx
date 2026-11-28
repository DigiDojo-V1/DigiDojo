"use client";

import { PhoneCall } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { DISPLAY, MONO } from "@/components/landing/styles";
import { playableScenarioKeys, useDojoSummaries } from "@/components/layout/chrome-data";
import { useHydrated, useProgressStore } from "@/engine/store";
import { useT } from "@/i18n/hooks";
import { LanguageToggle } from "@/i18n/LanguageToggle";

/** Same horizontal padding for everything inside the big card, so content lines up. */
export const CARD_PAD = "px-5 md:px-8 lg:px-10";

/** The big rounded card the home and dojo pages sit in. */
export const BIG_CARD = "rounded-[28px] bg-[#f3f1ec] ring-1 ring-black/10";

/**
 * The frame for DigiDojo's own full-screen pages (home, dojo): beige backdrop, wordmark header,
 * the page in a centred column, and the helpline underneath. Needs `landingFontVars` above it.
 */
export function HomeShell({ children }: { children: ReactNode }) {
  const t = useT();
  return (
    <div className="flex min-h-dvh flex-col bg-[rgb(232,228,222)] text-[#121212] antialiased">
      <HomeHeader />

      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col px-4 md:px-6 lg:px-8">
        {children}
      </main>

      <footer
        data-enter-late
        className="flex items-center justify-center gap-2 px-4 py-4 text-center text-xs text-black/60"
      >
        <PhoneCall aria-hidden className="size-3.5 shrink-0 text-red-600" />
        <span>{t("chrome.helpBody")}</span>
      </footer>
    </div>
  );
}

/** Wordmark and overall progress on the left, language on the right. */
function HomeHeader() {
  const t = useT();
  const dojos = useDojoSummaries();
  const hydrated = useHydrated();
  const completed = useProgressStore((s) => s.completed);
  const keys = playableScenarioKeys(dojos);
  const done = hydrated ? keys.filter((k) => completed[k]).length : 0;

  return (
    <header className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 px-4 py-4 md:px-6 lg:px-8">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-5">
        <h1 className={`${DISPLAY} text-xl leading-none tracking-[0.06em]`}>
          <Link href="/" data-entrance-wordmark>
            {t("home.title")}
          </Link>
        </h1>
        <p data-enter-late className={`${MONO} text-black/55`}>
          {t("chrome.progressBody")(done, keys.length)}
        </p>
      </div>
      <div data-enter-late>
        <LanguageToggle />
      </div>
    </header>
  );
}
