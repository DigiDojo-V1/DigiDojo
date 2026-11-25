import "server-only";
import { GoogleGenAI, type GoogleGenAIOptions } from "@google/genai";
import type { LlmLike } from "./flag-api";
import { DEFAULT_MODELS, describeAuth, type AuthMethod } from "./gemini-config";

/**
 * Gemini for the flag API. Off unless `FLAG_AI=on`; then the first auth method that is fully
 * configured wins:
 *
 * 1. `GEMINI_API_KEY`: a Gemini API key (simplest).
 * 2. `GCP_SERVICE_ACCOUNT_JSON` + `GCP_PROJECT_ID`: Vertex AI as a service account.
 * 3. `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` + `GOOGLE_REFRESH_TOKEN` + `GCP_PROJECT_ID`:
 *    Vertex AI as the Google account that ran `npm run google:auth`.
 *
 * Models default to Google's auto-updated aliases, so they never point at a retired version.
 */

export type LlmClient = LlmLike;

function options(env: Record<string, string | undefined>, method: AuthMethod): GoogleGenAIOptions {
  const vertex = {
    vertexai: true,
    project: env.GCP_PROJECT_ID,
    location: env.GCP_LOCATION || "global",
  };
  const scopes = ["https://www.googleapis.com/auth/cloud-platform"];
  switch (method) {
    case "api-key":
      return { apiKey: env.GEMINI_API_KEY };
    case "service-account": {
      const key = JSON.parse(env.GCP_SERVICE_ACCOUNT_JSON ?? "") as {
        client_email?: string;
        private_key?: string;
      };
      if (!key.client_email || !key.private_key) throw new Error("not a service-account key");
      return {
        ...vertex,
        googleAuthOptions: {
          credentials: { client_email: key.client_email, private_key: key.private_key },
          scopes,
        },
      };
    }
    case "oauth-user":
      return {
        ...vertex,
        googleAuthOptions: {
          credentials: {
            type: "authorized_user",
            client_id: env.GOOGLE_CLIENT_ID,
            client_secret: env.GOOGLE_CLIENT_SECRET,
            refresh_token: env.GOOGLE_REFRESH_TOKEN,
          },
          scopes,
        },
      };
  }
}

let cached: LlmClient | null | undefined;

/** Gemini, or null when the flag API should use its built-in chips and skip grading. */
export function getLlm(): LlmClient | null {
  if (cached !== undefined) return cached;
  const env = process.env;
  const auth = describeAuth(env);
  if ("off" in auth) {
    if (env.FLAG_AI?.toLowerCase() === "on") console.warn(`Gemini is off: ${auth.off}.`);
    cached = null;
    return cached;
  }

  let ai: GoogleGenAI;
  try {
    ai = new GoogleGenAI(options(env, auth.method));
  } catch {
    console.error(`Gemini is off: the ${auth.method} credentials could not be read.`);
    cached = null;
    return cached;
  }
  const models = {
    chips: env.GEMINI_CHIPS_MODEL || DEFAULT_MODELS.chips,
    judge: env.GEMINI_JUDGE_MODEL || DEFAULT_MODELS.judge,
  };

  cached = {
    async generateJson({ model, system, prompt, schema, timeoutMs }) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await ai.models.generateContent({
          model: models[model],
          contents: prompt,
          config: {
            systemInstruction: system,
            responseMimeType: "application/json",
            responseJsonSchema: schema,
            temperature: model === "chips" ? 0.7 : 0.2,
            maxOutputTokens: 1024,
            abortSignal: controller.signal,
          },
        });
        const text = response.text;
        if (text === undefined) throw new Error("empty response");
        return JSON.parse(text) as unknown;
      } finally {
        clearTimeout(timer);
      }
    },
  };
  return cached;
}
