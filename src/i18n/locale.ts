/** The languages the player can pick. "en" is the source language; everything falls back to it. */
export const LOCALES = ["en", "hinglish"] as const;
export type Locale = (typeof LOCALES)[number];

/** What a new player sees, and what the server renders before the saved choice is read. */
export const DEFAULT_LOCALE: Locale = "hinglish";

/** Value for `<html lang>`. Hinglish is Hindi written in Latin script. */
export const HTML_LANG: Record<Locale, string> = {
  en: "en",
  hinglish: "hi-Latn",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
