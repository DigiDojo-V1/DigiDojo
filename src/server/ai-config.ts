/** Whether the flag API uses OpenAI, and which models. Free of server-only imports so tests can use it. */

export const DEFAULT_MODELS = {
  /** Writes the reason chips: small, fast and cheap. */
  chips: "gpt-5.4-nano",
  /** Marks the player's explanation. */
  judge: "gpt-5.4-mini",
} as const;

export function aiStatus(env: Record<string, string | undefined>): { on: true } | { off: string } {
  if ((env.FLAG_AI ?? "off").trim().toLowerCase() !== "on") return { off: "FLAG_AI is not on" };
  if (!env.OPENAI_API_KEY) return { off: "FLAG_AI is on but OPENAI_API_KEY is not set" };
  return { on: true };
}

export function modelsFrom(env: Record<string, string | undefined>) {
  return {
    chips: env.OPENAI_CHIPS_MODEL || DEFAULT_MODELS.chips,
    judge: env.OPENAI_JUDGE_MODEL || DEFAULT_MODELS.judge,
  };
}

/** Default model for voice notes: it follows tone instructions (accent, mood). */
export const DEFAULT_VOICE_MODEL = "gpt-4o-mini-tts";

/** Whether voice notes play generated audio. Separate from FLAG_AI so each can be switched alone. */
export function voiceStatus(
  env: Record<string, string | undefined>,
): { on: true } | { off: string } {
  if ((env.VOICE_AI ?? "off").trim().toLowerCase() !== "on") return { off: "VOICE_AI is not on" };
  if (!env.OPENAI_API_KEY) return { off: "VOICE_AI is on but OPENAI_API_KEY is not set" };
  return { on: true };
}

export function voiceModelFrom(env: Record<string, string | undefined>): string {
  return env.OPENAI_VOICE_MODEL || DEFAULT_VOICE_MODEL;
}
