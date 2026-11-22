"use client";

import { useProgressStore } from "@/engine/store";
import { cn } from "@/lib/utils";
import { useLocale, useT } from "./hooks";
import { HTML_LANG, type Locale } from "./locale";

const OPTIONS: { locale: Locale; label: string }[] = [
  { locale: "en", label: "EN" },
  { locale: "hinglish", label: "Hinglish" },
];

/** Small "EN | Hinglish" segmented control. The choice is saved with the player's progress. */
export function LanguageToggle({ className }: { className?: string }) {
  const t = useT();
  const locale = useLocale();
  const setLocale = useProgressStore((s) => s.setLocale);

  return (
    <div
      role="group"
      aria-label={t("language.label")}
      className={cn(
        "inline-flex shrink-0 rounded-full bg-neutral-200/80 p-0.5 text-[11px] font-semibold",
        className,
      )}
    >
      {OPTIONS.map((option) => {
        const active = option.locale === locale;
        return (
          <button
            key={option.locale}
            type="button"
            lang={HTML_LANG[option.locale]}
            aria-pressed={active}
            onClick={() => setLocale(option.locale)}
            className={cn(
              "rounded-full px-2.5 py-1 leading-none transition-colors",
              active
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-800",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
