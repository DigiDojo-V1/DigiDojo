import { messageText } from "./evidence";
import type { Message } from "./schema";
import type { Locale } from "@/i18n/locale";

/**
 * Pre-generated recordings for voice notes live in `public/voices/<dojo>/<scenario>/`, one
 * MP3 per message and language. `npm run voices` makes them; see scripts/generate-voices.py.
 */

/** The file name for one recording, relative to the scenario's voices folder. */
export function voiceFileName(messageId: string, locale: Locale): string {
  return locale === "en" ? `${messageId}.mp3` : `${messageId}.${locale}.mp3`;
}

/**
 * Where a voice note's recording is served. A Hinglish player hears the Hinglish recording only
 * once the transcript has Hinglish; until then the English one, matching the text on screen.
 */
export function voiceNoteSrc(
  dojoId: string,
  scenarioId: string,
  message: Message,
  locale: Locale,
): string {
  const spoken: Locale =
    locale !== "en" && messageText(message).hinglish !== undefined ? locale : "en";
  const dir = [dojoId, scenarioId].map(encodeURIComponent).join("/");
  return `/voices/${dir}/${voiceFileName(message.id, spoken)}`;
}
