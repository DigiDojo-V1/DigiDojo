import type { Locale } from "@/i18n/locale";

/** Where a voice note's generated audio is served (`src/app/api/voice/...`). */
export function voiceNoteSrc(
  dojoId: string,
  scenarioId: string,
  messageId: string,
  locale: Locale,
): string {
  const path = [dojoId, scenarioId, messageId].map(encodeURIComponent).join("/");
  return `/api/voice/${path}?locale=${locale}`;
}
