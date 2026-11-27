import "server-only";
import OpenAI from "openai";
import { voiceStatus, voiceModelFrom } from "./ai-config";
import type { TtsLike } from "./voice-api";

/**
 * OpenAI text-to-speech for voice notes. Off unless `VOICE_AI=on` and `OPENAI_API_KEY` is set;
 * then the player's voice notes play generated audio instead of the browser's own voice.
 */

const VOICES = { male: "ash", female: "coral" } as const;
export const VOICE_TIMEOUT_MS = 15000;

let cached: TtsLike | null | undefined;

export function getTts(): TtsLike | null {
  if (cached !== undefined) return cached;
  const status = voiceStatus(process.env);
  if ("off" in status) {
    if (process.env.VOICE_AI?.trim().toLowerCase() === "on") {
      console.warn(`Voice generation is off: ${status.off}.`);
    }
    cached = null;
    return cached;
  }
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: 0 });
  const model = voiceModelFrom(process.env);
  cached = {
    async speak({ text, voice, instructions }) {
      const response = await client.audio.speech.create(
        { model, voice: VOICES[voice], input: text, instructions, response_format: "mp3" },
        { timeout: VOICE_TIMEOUT_MS },
      );
      return new Uint8Array(await response.arrayBuffer());
    },
  };
  return cached;
}
