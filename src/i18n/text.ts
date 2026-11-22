import type { LocalizedText } from "@/engine/schema";
import type { Locale } from "./locale";

/** The text in `locale`, falling back to English when there's no translation yet. */
export function resolveText(text: LocalizedText, locale: Locale): string {
  return locale === "hinglish" ? (text.hinglish ?? text.en) : text.en;
}
