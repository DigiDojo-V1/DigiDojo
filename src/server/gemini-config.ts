/** Which Gemini setup the env asks for. Kept free of server-only imports so tests can use it. */

export const DEFAULT_MODELS = {
  chips: "gemini-flash-lite-latest",
  judge: "gemini-flash-latest",
} as const;

export type AuthMethod = "api-key" | "service-account" | "oauth-user";

/** Which auth method the env configures, or why the LLM is off. */
export function describeAuth(
  env: Record<string, string | undefined>,
): { method: AuthMethod } | { off: string } {
  if ((env.FLAG_AI ?? "off").toLowerCase() !== "on") return { off: "FLAG_AI is not on" };
  if (env.GEMINI_API_KEY) return { method: "api-key" };
  if (env.GCP_SERVICE_ACCOUNT_JSON && env.GCP_PROJECT_ID) return { method: "service-account" };
  if (
    env.GOOGLE_CLIENT_ID &&
    env.GOOGLE_CLIENT_SECRET &&
    env.GOOGLE_REFRESH_TOKEN &&
    env.GCP_PROJECT_ID
  ) {
    return { method: "oauth-user" };
  }
  return { off: "FLAG_AI is on but no complete Google credentials are set" };
}
