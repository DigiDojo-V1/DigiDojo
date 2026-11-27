import { z } from "zod";
import { messageText } from "@/engine/evidence";
import type { Message, Scenario, VoiceNote } from "@/engine/schema";
import { LOCALES, type Locale } from "@/i18n/locale";
import { resolveText } from "@/i18n/text";

/**
 * Generated audio for voice notes, without Next.js or network clients so tests can use fakes.
 * Only text that is already a voice note in a registered scenario can be spoken: the client
 * names a message, never the words, so the endpoint can't be used as a general speech service.
 */

export interface TtsLike {
  /** MP3 bytes for `text`. */
  speak(request: {
    text: string;
    voice: "male" | "female";
    instructions: string;
  }): Promise<Uint8Array>;
}

export interface VoiceApiDeps {
  tts: TtsLike | null;
  allow: () => Promise<boolean>;
  getScenario: (dojoId: string, scenarioId: string) => Scenario | undefined;
  cache?: Map<string, Uint8Array>;
}

export type VoiceResult =
  { status: 200; audio: Uint8Array } | { status: 400 | 404 | 429 | 502 | 503; error: string };

const id = z.string().min(1).max(128);
export const VoiceRequestSchema = z.strictObject({
  dojoId: id,
  scenarioId: id,
  messageId: id,
  locale: z.enum(LOCALES),
});
export type VoiceRequest = z.infer<typeof VoiceRequestSchema>;

const MOOD: Record<NonNullable<VoiceNote["mood"]>, string> = {
  casual: "Relaxed and friendly.",
  urgent: "Rushed and stressed, a little out of breath, as if something bad just happened.",
  pleading: "Worried and pleading, trying to sound sincere.",
};

/** How the voice should sound. Every note is a young Indian friend on a phone voice message. */
export function voiceInstructions(note: VoiceNote, locale: Locale): string {
  const language =
    locale === "hinglish"
      ? "Speak Hinglish (Hindi and English mixed, written in Latin script) naturally, with an Indian accent."
      : "Speak Indian English with a natural Indian accent.";
  return [
    "You are a college student in India recording a quick WhatsApp-style voice note to a close friend.",
    language,
    MOOD[note.mood ?? "casual"],
    "Sound like a real person on a phone, not an announcer.",
  ].join(" ");
}

function findVoiceMessage(scenario: Scenario, messageId: string): Message | undefined {
  for (const node of Object.values(scenario.nodes)) {
    if (node.kind !== "thread") continue;
    const message = node.messages.find((m) => m.id === messageId);
    if (message?.voiceNote !== undefined) return message;
  }
  return undefined;
}

export async function handleVoice(input: unknown, deps: VoiceApiDeps): Promise<VoiceResult> {
  const parsed = VoiceRequestSchema.safeParse(input);
  if (!parsed.success) return { status: 400, error: "bad request" };
  const { dojoId, scenarioId, messageId, locale } = parsed.data;

  const scenario = deps.getScenario(dojoId, scenarioId);
  const message = scenario === undefined ? undefined : findVoiceMessage(scenario, messageId);
  if (message?.voiceNote === undefined) return { status: 404, error: "no such voice note" };
  if (deps.tts === null) return { status: 503, error: "voice generation is off" };

  const key = `${dojoId}/${scenarioId}/${messageId}/${locale}`;
  const cached = deps.cache?.get(key);
  if (cached !== undefined) return { status: 200, audio: cached };

  if (!(await deps.allow())) return { status: 429, error: "too many requests" };

  try {
    const audio = await deps.tts.speak({
      text: resolveText(messageText(message), locale),
      voice: message.voiceNote.voice ?? "male",
      instructions: voiceInstructions(message.voiceNote, locale),
    });
    deps.cache?.set(key, audio);
    return { status: 200, audio };
  } catch (error) {
    console.error("voice generation failed:", error instanceof Error ? error.message : "unknown");
    return { status: 502, error: "voice generation failed" };
  }
}
