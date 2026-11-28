import { voiceStatus } from "@/server/voice-config";

export const dynamic = "force-dynamic";

/** Whether live voice calls are available, so the call screen knows what to offer. */
export function GET() {
  return Response.json({ voice: "on" in voiceStatus(process.env) });
}
