import "server-only";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { toSdkConfig } from "@/lib/voice/sdk-config";
import type { JsonJudge, TokenMinter } from "./call-api";
import { voiceModelsFrom, voiceStatus } from "./voice-config";

/**
 * Gemini for live voice calls. Off unless `GEMINI_API_KEY` is set (and `VOICE_AI` isn't "off").
 * The API key stays on the server: browsers get a short-lived, single-use token locked to one
 * call's config, and talk to the Live API directly with it.
 */

interface Voice {
  minter: TokenMinter;
  judge: JsonJudge;
  models: { live: string; judge: string };
}

let cached: Voice | null | undefined;

export function getVoice(): Voice | null {
  if (cached !== undefined) return cached;
  const status = voiceStatus(process.env);
  if ("off" in status) {
    cached = null;
    return cached;
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { apiVersion: "v1beta" },
  });
  const models = voiceModelsFrom(process.env);

  cached = {
    models,
    minter: {
      async mint({ model, config, expireMinutes }) {
        const now = Date.now();
        const token = await ai.authTokens.create({
          config: {
            uses: 1,
            expireTime: new Date(now + expireMinutes * 60_000).toISOString(),
            newSessionExpireTime: new Date(now + 2 * 60_000).toISOString(),
            liveConnectConstraints: { model, config: toSdkConfig(config) },
            // Lock every field set above, so the token can't run any other prompt.
            lockAdditionalFields: [],
            httpOptions: { apiVersion: "v1beta" },
          },
        });
        if (token.name === undefined) throw new Error("no token returned");
        return token.name;
      },
    },
    judge: {
      async generateJson({ system, prompt, schema, timeoutMs }) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        const ask = (thinking: boolean) =>
          ai.models.generateContent({
            model: models.judge,
            contents: prompt,
            config: {
              systemInstruction: system,
              responseMimeType: "application/json",
              responseJsonSchema: schema,
              ...(thinking ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } } : {}),
              abortSignal: controller.signal,
            },
          });
        try {
          // Some judge models reject a thinking level: ask once more without one.
          const response = await ask(true).catch((error: unknown) => {
            if (error instanceof Error && /thinking/i.test(error.message)) return ask(false);
            throw error;
          });
          const text = response.text;
          if (!text) throw new Error("empty response");
          return JSON.parse(text) as unknown;
        } finally {
          clearTimeout(timer);
        }
      },
    },
  };
  return cached;
}
