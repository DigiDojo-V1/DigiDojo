import "server-only";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import type { LlmLike } from "./flag-api";

/** Production `LlmLike`: Gemini on Vertex AI. */
export type LlmClient = LlmLike;

const EnvSchema = z.object({
  GCP_SERVICE_ACCOUNT_JSON: z.string().min(1),
  GCP_PROJECT_ID: z.string().min(1),
  GCP_LOCATION: z.string().min(1).default("global"),
  GEMINI_CHIPS_MODEL: z.string().min(1),
  GEMINI_JUDGE_MODEL: z.string().min(1),
});

const ServiceAccountSchema = z.object({
  client_email: z.string().min(1),
  private_key: z.string().min(1),
});

let cached: LlmClient | null | undefined;

/** Gemini on Vertex, or null when the env isn't set up (LLM features are then off). */
export function getLlm(): LlmClient | null {
  if (cached !== undefined) return cached;
  const env = EnvSchema.safeParse(process.env);
  if (!env.success) {
    cached = null;
    return cached;
  }
  let credentials: z.infer<typeof ServiceAccountSchema>;
  try {
    credentials = ServiceAccountSchema.parse(JSON.parse(env.data.GCP_SERVICE_ACCOUNT_JSON));
  } catch {
    console.error("GCP_SERVICE_ACCOUNT_JSON is not a valid service-account key; LLM is off.");
    cached = null;
    return cached;
  }

  const ai = new GoogleGenAI({
    vertexai: true,
    project: env.data.GCP_PROJECT_ID,
    location: env.data.GCP_LOCATION,
    googleAuthOptions: {
      credentials,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    },
  });
  const models = { chips: env.data.GEMINI_CHIPS_MODEL, judge: env.data.GEMINI_JUDGE_MODEL };

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
            maxOutputTokens: 512,
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
