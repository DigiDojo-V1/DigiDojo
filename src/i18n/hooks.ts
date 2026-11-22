import { useCallback } from "react";
import { useHydrated, useProgressStore } from "@/engine/store";
import { DEFAULT_LOCALE, type Locale } from "./locale";
import { translate, type UiDict, type UiKey } from "./ui";

/**
 * The player's language. During server render and hydration it is always the default, so the
 * server HTML and the first client render match; the saved choice applies right after.
 */
export function useLocale(): Locale {
  const hydrated = useHydrated();
  const saved = useProgressStore((s) => s.locale);
  return hydrated ? saved : DEFAULT_LOCALE;
}

/** `t("key")` for UI strings, in the player's language with English fallback. */
export function useT(): <K extends UiKey>(key: K) => UiDict[K] {
  const locale = useLocale();
  return useCallback(<K extends UiKey>(key: K) => translate(locale, key), [locale]);
}
