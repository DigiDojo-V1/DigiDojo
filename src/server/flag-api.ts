import { z } from "zod";
import { JudgeResultSchema, MAX_NOTE_CHARS, resolveSpot, type JudgeResult } from "@/engine/flags";
import { TacticSchema, type Scenario } from "@/engine/schema";
import { LOCALES } from "@/i18n/locale";
import { resolveText } from "@/i18n/text";
import { JUDGE_SCHEMA, JUDGE_SYSTEM, judgePrompt } from "./prompts";

/**
 * The flag API without Next.js or network clients, so tests can drive it with fakes.
 * The server never trusts the client about red flags: it rebuilds what was flagged from the
 * scenario data and decides what it catches itself.
 */

export interface LlmLike {
  generateJson(request: {
    model: "judge";
    system: string;
    prompt: string;
    schema: unknown;
    timeoutMs: number;
  }): Promise<unknown>;
}

export interface FlagApiDeps {
  llm: LlmLike | null;
  /** False means the caller is over its rate limit. */
  allow: () => Promise<boolean>;
  getScenario: (dojoId: string, scenarioId: string) => Scenario | undefined;
}

export interface ApiResult {
  status: number;
  body: unknown;
}

export const JUDGE_TIMEOUT_MS = 8000;

const id = z.string().min(1).max(128);
export const JudgeRequestSchema = z.strictObject({
  dojoId: id,
  scenarioId: id,
  targetId: id,
  start: z.number().int().nonnegative().max(20000).optional(),
  end: z.number().int().nonnegative().max(20000).optional(),
  locale: z.enum(LOCALES),
  tactic: TacticSchema.optional(),
  note: z.string().trim().min(1).max(MAX_NOTE_CHARS),
});

const ModelJudgeSchema = z.object({
  verdict: JudgeResultSchema.shape.verdict,
  feedback: z.string(),
});

/** Logs why the model call failed: the error only, never what the player wrote. */
function logFailure(kind: "judge", error: unknown) {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  console.warn(`Flag API ${kind}: model call failed, using the fallback. ${message.slice(0, 300)}`);
}

const bad = (status: number, error: string): ApiResult => ({ status, body: { error } });

export async function handleJudge(raw: unknown, deps: FlagApiDeps): Promise<ApiResult> {
  const parsed = JudgeRequestSchema.safeParse(raw);
  if (!parsed.success) return bad(400, "bad request");
  if (!(await deps.allow())) return bad(429, "too many requests");
  const req = parsed.data;

  const scenario = deps.getScenario(req.dojoId, req.scenarioId);
  if (scenario === undefined) return bad(404, "unknown scenario");
  const resolved = resolveSpot(
    scenario,
    { targetId: req.targetId, start: req.start, end: req.end },
    req.locale,
  );
  if (resolved === undefined) return bad(404, "unknown target");

  // Nothing to grade against: a false alarm earns nothing, so there's no call to make.
  const redFlags = resolved.catches.flatMap((rid) => {
    const rf = scenario.redFlags[rid];
    return rf === undefined ? [] : [rf];
  });
  if (redFlags.length === 0 || deps.llm === null) return { status: 200, body: { result: null } };
  const rubric = redFlags.find((rf) => rf.tactic === req.tactic) ?? redFlags[0]!;

  try {
    const answer = ModelJudgeSchema.parse(
      await deps.llm.generateJson({
        model: "judge",
        system: JUDGE_SYSTEM,
        prompt: judgePrompt({
          highlight: resolved.text,
          rubricLabel: resolveText(rubric.label, "en"),
          rubricExplanation: resolveText(rubric.explanation, "en"),
          tactic: rubric.tactic,
          picked: req.tactic,
          note: req.note,
          locale: req.locale,
        }),
        schema: JUDGE_SCHEMA,
        timeoutMs: JUDGE_TIMEOUT_MS,
      }),
    );
    const result: JudgeResult = JudgeResultSchema.parse({
      verdict: answer.verdict,
      feedback: answer.feedback.trim().slice(0, 300),
    });
    return { status: 200, body: { result } };
  } catch (error) {
    logFailure("judge", error);
    return bad(502, "could not grade");
  }
}
