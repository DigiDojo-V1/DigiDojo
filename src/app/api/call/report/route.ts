import { getScenario } from "@/dojos/registry";
import { handleCallReport } from "@/server/call-api";
import { getVoice } from "@/server/gemini";
import { callerKey, getLimiter } from "@/server/ratelimit";

export const maxDuration = 30;

/** Reviews a finished live call. The transcript is never stored or logged. */
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const caller = callerKey(request);
  const result = await handleCallReport(body, {
    judge: getVoice()?.judge ?? null,
    allow: () => getLimiter("callReport").allow(caller),
    getScenario,
  });
  return Response.json(result.body, { status: result.status });
}
