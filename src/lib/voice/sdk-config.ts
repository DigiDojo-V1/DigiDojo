import { Behavior, Modality, type LiveConnectConfig } from "@google/genai";
import type { LiveConfig } from "@/server/call-api";

/** Our plain-JSON call config as the Gemini SDK types it (its enums are string enums). */
export function toSdkConfig(config: LiveConfig): LiveConnectConfig {
  return {
    ...config,
    responseModalities: [Modality.AUDIO],
    tools: config.tools.map((tool) => ({
      functionDeclarations: tool.functionDeclarations.map((f) => ({
        ...f,
        behavior: Behavior.NON_BLOCKING,
      })),
    })),
  };
}
