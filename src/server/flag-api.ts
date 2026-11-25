import { z } from "zod";
import { JudgeResultSchema, MAX_NOTE_CHARS, resolveSpot, type JudgeResult } from "@/engine/flags";
import { correctTactics, fallbackChips, finalizeChips, type Chip } from "@/engine/highlight";
import { TACTICS, TacticSchema, type Scenario, type Tactic } from "@/engine/schema";
import { LOCALES } from "@/i18n/locale";
import { resolveText } from "@/i18n/text";
import {
  CHIPS_SCHEMA,
  CHIPS_SYSTEM,
  chipsPrompt,
  JUDGE_SCHEMA,
  JUDGE_SYSTEM,
  judgePrompt,
} from "./prompts";

/**
 * The flag API without Next.js or network clients, so tests can drive it with fakes.
 * The server never trusts the client about red flags: it rebuilds what was flagged from the
 * scenario data and decides what it catches itself.
 */

export interface LlmLike {
  generateJson(request: {
    model: "chips" | "judge";
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
  /** The dojo's learning goals, given to the model so its options fit what the level teaches. */
  getGoals?: (dojoId: string) => readonly string[];
  cache?: ChipCache;
}

export interface ApiResult {
  status: number;
  body: unknown;
}

export const CHIPS_TIMEOUT_MS = 5000;
export const JUDGE_TIMEOUT_MS = 8000;
const MAX_LABEL_CHARS = 70;

const id = z.string().min(1).max(128);
const SpotFields = {
  dojoId: id,
  scenarioId: id,
  targetId: id,
  start: z.number().int().nonnegative().max(20000).optional(),
  end: z.number().int().nonnegative().max(20000).optional(),
  locale: z.enum(LOCALES),
};

export const ChipsRequestSchema = z.strictObject(SpotFields);
export const JudgeRequestSchema = z.strictObject({
  ...SpotFields,
  tactic: TacticSchema.optional(),
  note: z.string().trim().min(1).max(MAX_NOTE_CHARS),
});

const ModelChipsSchema = z.object({
  trivial: z.boolean().default(false),
  chips: z.array(z.object({ tactic: z.string(), label: z.string() })).max(8),
});

/** A highlight with almost no letters or digits ("a", "!!") gets no options: explain it instead. */
export function isTrivialHighlight(text: string): boolean {
  return (text.match(/[\p{L}\p{N}]/gu) ?? []).length < 3;
}

const ModelJudgeSchema = z.object({
  verdict: JudgeResultSchema.shape.verdict,
  feedback: z.string(),
});

/** A small LRU for chips, per server instance. */
export class ChipCache {
  private map = new Map<string, Chip[]>();
  constructor(private readonly size = 500) {}
  get(key: string): Chip[] | undefined {
    const value = this.map.get(key);
    if (value !== undefined) {
      this.map.delete(key);
      this.map.set(key, value);
    }
    return value;
  }
  set(key: string, value: Chip[]): void {
    this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.size) this.map.delete(this.map.keys().next().value!);
  }
}

/** Logs why the model call failed: the error only, never what the player wrote. */
function logFailure(kind: "chips" | "judge", error: unknown) {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  console.warn(`Flag API ${kind}: model call failed, using the fallback. ${message.slice(0, 300)}`);
}

const bad = (status: number, error: string): ApiResult => ({ status, body: { error } });

const isTactic = (t: string): t is Tactic => (TACTICS as readonly string[]).includes(t);

export async function handleChips(raw: unknown, deps: FlagApiDeps): Promise<ApiResult> {
  const parsed = ChipsRequestSchema.safeParse(raw);
  if (!parsed.success) return bad(400, "bad request");
  if (!(await deps.allow())) return bad(429, "too many requests");
  const req = parsed.data;

  const scenario = deps.getScenario(req.dojoId, req.scenarioId);
  if (scenario === undefined) return bad(404, "unknown scenario");
  const spot = { targetId: req.targetId, start: req.start, end: req.end };
  const resolved = resolveSpot(scenario, spot, req.locale);
  if (resolved === undefined) return bad(404, "unknown target");

  const correct = correctTactics(scenario, resolved.catches);
  const seed = `${req.targetId}:${req.start ?? ""}:${req.end ?? ""}`;
  // `graded` tells the client whether a written explanation will be marked.
  const graded = deps.llm !== null;
  const fallback = () => ({
    status: 200,
    body: { chips: fallbackChips(scenario, correct, seed), graded },
  });
  if (deps.llm === null) return fallback();

  const key = `${req.dojoId}/${req.scenarioId}|${seed}|${req.locale}`;
  const hit = deps.cache?.get(key);
  if (hit !== undefined) return { status: 200, body: { chips: hit, graded } };
  // No options: the player has to say what they mean in their own words.
  if (isTrivialHighlight(resolved.text)) return { status: 200, body: { chips: [], graded } };

  try {
    const answer = ModelChipsSchema.parse(
      await deps.llm.generateJson({
        model: "chips",
        system: CHIPS_SYSTEM,
        prompt: chipsPrompt({
          highlight: resolved.text,
          locale: req.locale,
          mustInclude: correct,
          goals: deps.getGoals?.(req.dojoId) ?? [],
        }),
        schema: CHIPS_SCHEMA,
        timeoutMs: CHIPS_TIMEOUT_MS,
      }),
    );
    const proposed: Chip[] = answer.chips.flatMap((c) => {
      const label = c.label.trim().slice(0, MAX_LABEL_CHARS);
      return isTactic(c.tactic) ? [{ tactic: c.tactic, label: label || undefined }] : [];
    });
    const chips = answer.trivial
      ? []
      : finalizeChips(proposed, scenario, correct, seed, proposed.length);
    deps.cache?.set(key, chips);
    return { status: 200, body: { chips, graded } };
  } catch (error) {
    logFailure("chips", error);
    return fallback();
  }
}

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
