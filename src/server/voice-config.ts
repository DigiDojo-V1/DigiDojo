/** Whether live voice calls (Gemini) are on, and which models. Free of server-only imports so tests can use it. */

export const DEFAULT_VOICE_MODELS = {
  /** Real-time voice for the caller. */
  live: "gemini-3.8-live",
  /** Reviews the call transcript afterwards. Flash-Lite answers in 2 to 3 s; 3.8 Flash often missed the 25 s timeout. */
  judge: "gemini-3.5-flash-lite",
} as const;

export function voiceStatus(
  env: Record<string, string | undefined>,
): { on: true } | { off: string } {
  if ((env.VOICE_AI ?? "on").trim().toLowerCase() === "off") return { off: "VOICE_AI is off" };
  if (!env.GEMINI_API_KEY) return { off: "GEMINI_API_KEY is not set" };
  return { on: true };
}

export function voiceModelsFrom(env: Record<string, string | undefined>) {
  return {
    live: env.GEMINI_LIVE_MODEL || DEFAULT_VOICE_MODELS.live,
    judge: env.GEMINI_JUDGE_MODEL || DEFAULT_VOICE_MODELS.judge,
  };
}
