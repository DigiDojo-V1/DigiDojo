import { getScenario } from "@/dojos/registry";
import { callerKey, getLimiter } from "@/server/ratelimit";
import { getTts } from "@/server/tts";
import { handleVoice } from "@/server/voice-api";

export const maxDuration = 20;

/** Generated audio stays the same until the scenario text changes, so keep it per server. */
const cache = new Map<string, Uint8Array>();

/** MP3 for one voice note: GET /api/voice/<dojo>/<scenario>/<message>?locale=en */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ dojoId: string; scenarioId: string; messageId: string }> },
) {
  const { dojoId, scenarioId, messageId } = await params;
  const locale = new URL(request.url).searchParams.get("locale") ?? "en";
  const caller = callerKey(request);
  const result = await handleVoice(
    { dojoId, scenarioId, messageId, locale },
    { tts: getTts(), allow: () => getLimiter("voice").allow(caller), getScenario, cache },
  );
  if (result.status !== 200) {
    return Response.json({ error: result.error }, { status: result.status });
  }
  return new Response(new Blob([result.audio as BlobPart], { type: "audio/mpeg" }), {
    headers: {
      "Content-Type": "audio/mpeg",
      // The CDN keeps it, so each note is generated about once per deploy.
      "Cache-Control": "public, max-age=86400, s-maxage=2592000",
    },
  });
}
