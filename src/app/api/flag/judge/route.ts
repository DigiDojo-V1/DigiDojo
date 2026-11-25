import { getScenario } from "@/dojos/registry";
import { handleJudge } from "@/server/flag-api";
import { callerKey, getLimiter } from "@/server/ratelimit";
import { getLlm } from "@/server/openai";

export const maxDuration = 15;

/** Grades the player's own explanation of a flag. The note is never stored or logged. */
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const caller = callerKey(request);
  const result = await handleJudge(body, {
    llm: getLlm(),
    allow: () => getLimiter("judge").allow(caller),
    getScenario,
  });
  return Response.json(result.body, { status: result.status });
}
