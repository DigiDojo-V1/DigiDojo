import "server-only";
import OpenAI from "openai";
import { aiStatus, modelsFrom } from "./ai-config";
import type { LlmLike } from "./flag-api";

/**
 * OpenAI for the flag API. Off unless `FLAG_AI=on` and `OPENAI_API_KEY` is set; then it marks the
 * player's written explanations, with JSON answers forced by a strict schema.
 */

let cached: LlmLike | null | undefined;

export function getLlm(): LlmLike | null {
  if (cached !== undefined) return cached;
  const status = aiStatus(process.env);
  if ("off" in status) {
    if (process.env.FLAG_AI?.trim().toLowerCase() === "on") {
      console.warn(`AI is off: ${status.off}.`);
    }
    cached = null;
    return cached;
  }

  // No retries: marking is a bonus, so a failed call is shown as "couldn't mark" instead.
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: 0 });
  const models = modelsFrom(process.env);

  cached = {
    async generateJson({ model, system, prompt, schema, timeoutMs }) {
      const response = await client.responses.create(
        {
          model: models[model],
          instructions: system,
          input: prompt,
          reasoning: { effort: "none" },
          text: {
            format: {
              type: "json_schema",
              name: "explanation_mark",
              schema: schema as Record<string, unknown>,
              strict: true,
            },
          },
          // Player text is never kept on OpenAI's side for later retrieval.
          store: false,
        },
        { timeout: timeoutMs },
      );
      if (!response.output_text) throw new Error("empty response");
      return JSON.parse(response.output_text) as unknown;
    },
  };
  return cached;
}
