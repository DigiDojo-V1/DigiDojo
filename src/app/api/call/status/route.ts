import { getDailyCap } from "@/server/ratelimit";
import { voiceStatus } from "@/server/voice-config";

export const dynamic = "force-dynamic";

/** Whether live voice calls are available, so the call screen knows what to offer. */
export async function GET() {
  // Once today's voice budget is spent, offer reply options before the player grants the mic.
  const voice = "on" in voiceStatus(process.env) && !(await getDailyCap("callToken").spent());
  return Response.json({ voice });
}
