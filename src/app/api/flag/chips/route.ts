import { getDojo, getScenario } from "@/dojos/registry";
import { resolveText } from "@/i18n/text";
import { ChipCache, handleChips } from "@/server/flag-api";
import { callerKey, getLimiter } from "@/server/ratelimit";
import { getLlm } from "@/server/openai";

export const maxDuration = 10;

const cache = new ChipCache();

/** Reason chips for something the player flagged. */
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const caller = callerKey(request);
  const result = await handleChips(body, {
    llm: getLlm(),
    allow: () => getLimiter("chips").allow(caller),
    getScenario,
    getGoals: (dojoId) => (getDojo(dojoId)?.takeaways ?? []).map((t) => resolveText(t, "en")),
    cache,
  });
  return Response.json(result.body, { status: result.status });
}
