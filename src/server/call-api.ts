import { z } from "zod";
import {
  agentInstructions,
  agentTools,
  CALL_LANGUAGES,
  CALL_ENDINGS,
  CallReportSchema,
  CallTurnSchema,
  callRedFlagIds,
  cleanRating,
  DEFAULT_MAX_MINUTES,
  fallbackReport,
  LiveFlagSchema,
  liveCallNode,
  MAX_LIVE_FLAGS,
  MAX_QUOTE_CHARS,
  MAX_TURNS,
  possibleSignals,
  resolveOutcome,
  transcriptionVocabulary,
  type CallReport,
} from "@/engine/live-call";
import type { LiveCallNode, Scenario } from "@/engine/schema";
import { LOCALES, type Locale } from "@/i18n/locale";
import type { ApiResult } from "./flag-api";
import { CALL_JUDGE_SYSTEM, callJudgePrompt, callJudgeSchema } from "./call-prompts";

/**
 * The live-call API without Next.js or network clients, so tests can drive it with fakes.
 * The server builds every prompt from scenario data: the client only names the call.
 */

export interface TokenMinter {
  /** A short-lived, single-use token locked to this model and config. */
  mint(request: { model: string; config: LiveConfig; expireMinutes: number }): Promise<string>;
}

export interface JsonJudge {
  generateJson(request: {
    system: string;
    prompt: string;
    schema: unknown;
    timeoutMs: number;
  }): Promise<unknown>;
}

export interface CallApiDeps {
  allow: () => Promise<boolean>;
  getScenario: (dojoId: string, scenarioId: string) => Scenario | undefined;
}

export const REPORT_TIMEOUT_MS = 25_000;
/** Total characters of transcript the judge reads. */
export const MAX_TRANSCRIPT_CHARS = 40_000;

const id = z.string().min(1).max(128);
const CallRef = { dojoId: id, scenarioId: id, nodeId: id, locale: z.enum(LOCALES) };

export const TokenRequestSchema = z.strictObject(CallRef);

export const ReportRequestSchema = z.strictObject({
  ...CallRef,
  transcript: z.array(CallTurnSchema).max(MAX_TURNS),
  flags: z.array(LiveFlagSchema).max(MAX_LIVE_FLAGS),
  signals: z.array(z.string().max(80)).max(20),
  endedBy: z.enum(CALL_ENDINGS),
  durationMs: z
    .number()
    .int()
    .nonnegative()
    .max(30 * 60 * 1000),
});

/** The Live API session config for a call. Plain JSON, the same on the server and the client. */
export interface LiveConfig {
  responseModalities: ["AUDIO"];
  systemInstruction: { parts: { text: string }[] };
  speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: string } } };
  tools: ReturnType<typeof agentTools>;
  inputAudioTranscription: { languageCodes: string[]; customVocabulary: string[] };
  outputAudioTranscription: { languageCodes: string[] };
}

export function liveConfig(scenario: Scenario, node: LiveCallNode, locale: Locale): LiveConfig {
  return {
    responseModalities: ["AUDIO"],
    systemInstruction: { parts: [{ text: agentInstructions(scenario, node, locale) }] },
    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: node.agent.voice } } },
    tools: agentTools(node),
    // English and Hindi only, plus the call's names and jargon, so the player is heard accurately.
    inputAudioTranscription: {
      languageCodes: [...CALL_LANGUAGES],
      customVocabulary: transcriptionVocabulary(node),
    },
    outputAudioTranscription: { languageCodes: [...CALL_LANGUAGES] },
  };
}

const bad = (status: number, error: string): ApiResult => ({ status, body: { error } });

function findCall(
  deps: CallApiDeps,
  ref: { dojoId: string; scenarioId: string; nodeId: string },
): { scenario: Scenario; node: LiveCallNode } | undefined {
  const scenario = deps.getScenario(ref.dojoId, ref.scenarioId);
  const node = scenario === undefined ? undefined : liveCallNode(scenario, ref.nodeId);
  return scenario === undefined || node === undefined ? undefined : { scenario, node };
}

function logFailure(kind: string, error: unknown) {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  console.warn(`Call API ${kind}: ${message.slice(0, 300)}`);
}

/** A token for one live call. The token carries the whole config, so the client can't change it. */
export async function handleCallToken(
  raw: unknown,
  deps: CallApiDeps & { minter: TokenMinter | null; model: string },
): Promise<ApiResult> {
  const parsed = TokenRequestSchema.safeParse(raw);
  if (!parsed.success) return bad(400, "bad request");
  if (deps.minter === null) return bad(503, "voice is off");
  if (!(await deps.allow())) return bad(429, "too many requests");
  const call = findCall(deps, parsed.data);
  if (call === undefined) return bad(404, "unknown call");

  const config = liveConfig(call.scenario, call.node, parsed.data.locale);
  try {
    const token = await deps.minter.mint({
      model: deps.model,
      config,
      expireMinutes: (call.node.maxMinutes ?? DEFAULT_MAX_MINUTES) + 4,
    });
    return { status: 200, body: { token, model: deps.model, config } };
  } catch (error) {
    logFailure("token", error);
    return bad(502, "could not start the call");
  }
}

const ModelMomentSchema = z.object({ quote: z.string(), why: z.string() });
const ModelReportSchema = z.object({
  outcome_id: z.string(),
  rating: z.number(),
  summary: z.string(),
  good_moves: z.array(ModelMomentSchema),
  mistakes: z.array(ModelMomentSchema),
  do_better: z.array(z.string()),
  heard: z.array(z.object({ red_flag_id: z.string(), quote: z.string() })),
  flag_matches: z.array(z.object({ flag: z.number().int(), red_flag_id: z.string() })),
});

const clip = (text: string, max: number) => text.trim().slice(0, max);

/** Reviews a finished call. Always answers 200 with a report; without the judge it's a rough one. */
export async function handleCallReport(
  raw: unknown,
  deps: CallApiDeps & { judge: JsonJudge | null },
): Promise<ApiResult> {
  const parsed = ReportRequestSchema.safeParse(raw);
  if (!parsed.success) return bad(400, "bad request");
  const call = findCall(deps, parsed.data);
  if (call === undefined) return bad(404, "unknown call");
  const { scenario, node } = call;
  const req = parsed.data;

  const allowed = new Set(possibleSignals(node));
  const signals = [...new Set(req.signals)].filter((s) => allowed.has(s));
  // Keep the end of an over-long call: that's where the money is asked for.
  const transcript = [...req.transcript];
  let chars = transcript.reduce((n, t) => n + t.text.length, 0);
  while (chars > MAX_TRANSCRIPT_CHARS && transcript.length > 1)
    chars -= transcript.shift()!.text.length;

  const record = { signals, endedBy: req.endedBy, durationMs: req.durationMs, flags: req.flags };
  const fallback = () => ({ status: 200, body: { report: fallbackReport(node, record) } });
  if (deps.judge === null) return fallback();
  if (!(await deps.allow())) return fallback();

  try {
    const answer = ModelReportSchema.parse(
      await deps.judge.generateJson({
        system: CALL_JUDGE_SYSTEM,
        prompt: callJudgePrompt({
          scenario,
          node,
          locale: req.locale,
          transcript,
          flags: req.flags,
          signals,
          endedBy: req.endedBy,
          durationMs: req.durationMs,
        }),
        schema: callJudgeSchema(node),
        timeoutMs: REPORT_TIMEOUT_MS,
      }),
    );
    const redFlagIds = new Set(callRedFlagIds(node));
    const outcome = resolveOutcome(node, signals, answer.outcome_id);
    const decisive = new Set(node.outcomes.flatMap((o) => o.events ?? []));
    const handedOver = signals.some((s) => decisive.has(s));
    const rating = cleanRating(handedOver ? Math.min(answer.rating, 2.5) : answer.rating);
    const moments = (list: z.infer<typeof ModelMomentSchema>[]) =>
      list
        .slice(0, 5)
        .map((m) => ({ quote: clip(m.quote, MAX_QUOTE_CHARS), why: clip(m.why, 300) }));
    const heard: CallReport["heard"] = [];
    for (const h of answer.heard) {
      if (!redFlagIds.has(h.red_flag_id) || heard.some((x) => x.redFlagId === h.red_flag_id))
        continue;
      heard.push({ redFlagId: h.red_flag_id, quote: clip(h.quote, MAX_QUOTE_CHARS) });
    }
    const flagMatches = req.flags.map((_, i) => {
      const match = answer.flag_matches.find((m) => m.flag === i)?.red_flag_id;
      return match !== undefined && redFlagIds.has(match) ? match : null;
    });
    // A flag can only catch a red flag the caller actually used.
    const heardIds = new Set(heard.map((h) => h.redFlagId));
    flagMatches.forEach((match, i) => {
      if (match !== null && !heardIds.has(match)) {
        heard.push({ redFlagId: match, quote: clip(req.flags[i]!.quote, MAX_QUOTE_CHARS) });
        heardIds.add(match);
      }
    });

    const report: CallReport = CallReportSchema.parse({
      outcomeId: outcome.id,
      rating,
      summary: clip(answer.summary, 500),
      goodMoves: moments(answer.good_moves),
      mistakes: moments(answer.mistakes),
      doBetter: answer.do_better.slice(0, 4).map((d) => clip(d, 280)),
      heard,
      flagMatches,
      analysed: true,
    });
    return { status: 200, body: { report } };
  } catch (error) {
    logFailure("report", error);
    return fallback();
  }
}
