import { getScenario } from "@/dojos/registry";
import { handleCallToken } from "@/server/call-api";
import { getVoice } from "@/server/gemini";
import { callerKey, getDailyCap, getLimiter } from "@/server/ratelimit";

export const maxDuration = 10;

/** A single-use Live API token for one call, with the caller's whole config locked in. */
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const caller = callerKey(request);
  const voice = getVoice();
  const result = await handleCallToken(body, {
    minter: voice?.minter ?? null,
    model: voice?.models.live ?? "",
    allow: () => getLimiter("callToken").allow(caller),
    withinDailyCap: () => getDailyCap("callToken").take(),
    getScenario,
  });
  return Response.json(result.body, { status: result.status });
}
