import { z } from "zod";

/**
 * A global daily budget for each AI endpoint, shared by every player. Per-IP limits don't stop
 * abuse from many IPs; this does. Once today's budget is spent the endpoint takes its no-AI path.
 * Free of server-only imports so tests can drive it with a fake counter.
 */

export const DAILY_CAPS = {
  /** OpenAI marks a written explanation. One per flag with a note. */
  judge: { env: "AI_DAILY_CAP_JUDGE", default: 1000 },
  /** Gemini Live voice: one token per call. The most expensive. */
  callToken: { env: "AI_DAILY_CAP_CALL_TOKEN", default: 150 },
  /** Gemini reviews a finished call. */
  callReport: { env: "AI_DAILY_CAP_CALL_REPORT", default: 200 },
} as const;

export type CapKind = keyof typeof DAILY_CAPS;

/** "true" turns the AI off while Redis can't be reached. Unset or anything else allows calls. */
export const BLOCK_ON_REDIS_ERROR_ENV = "AI_CAP_BLOCK_ON_REDIS_ERROR";

const KEY_PREFIX = "digidojo:cap";
/** Each day's counter outlives its day, then Redis deletes it. */
export const KEY_TTL_SECONDS = 2 * 24 * 60 * 60;

export interface DayCounter {
  /** Adds one to the counter and returns the new value. */
  increment(key: string, ttlSeconds: number): Promise<number>;
  /** The counter's value, 0 if it doesn't exist yet. */
  read(key: string): Promise<number>;
}

export interface DailyCap {
  /** Takes one call from today's budget. False once it's spent. */
  take(): Promise<boolean>;
  /** True if today's budget is spent. Uses none of it. */
  spent(): Promise<boolean>;
}

type Env = Record<string, string | undefined>;

const WholeNumber = z
  .string()
  .trim()
  .regex(/^\d+$/)
  .transform(Number)
  .pipe(z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER));

/** Today's cap for one endpoint. 0 switches its AI off. A bad value falls back to the default. */
export function capFrom(env: Env, kind: CapKind): number {
  const { env: name, default: fallback } = DAILY_CAPS[kind];
  const raw = env[name];
  if (raw === undefined || raw.trim() === "") return fallback;
  const parsed = WholeNumber.safeParse(raw);
  if (parsed.success) return parsed.data;
  console.warn(`${name} must be a whole number of calls per day. Using ${fallback}.`);
  return fallback;
}

export function blockOnRedisErrorFrom(env: Env): boolean {
  return env[BLOCK_ON_REDIS_ERROR_ENV]?.trim().toLowerCase() === "true";
}

/** The counter key for one endpoint on one UTC day, so budgets reset at 05:30 in India. */
export function dayKey(kind: CapKind, now: Date): string {
  return `${KEY_PREFIX}:${kind}:${now.toISOString().slice(0, 10)}`;
}

export function createDailyCap(options: {
  kind: CapKind;
  cap: number;
  /** Null when Redis isn't configured: nothing is capped. */
  counter: DayCounter | null;
  blockOnRedisError: boolean;
  now?: () => Date;
}): DailyCap {
  const { kind, cap, counter, blockOnRedisError } = options;
  const now = options.now ?? (() => new Date());
  if (cap === 0) return { take: async () => false, spent: async () => true };
  if (counter === null) return { take: async () => true, spent: async () => false };

  const onError = (error: unknown) => {
    const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    console.warn(
      `Daily cap ${kind}: Redis failed, ${blockOnRedisError ? "blocking" : "allowing"} AI calls. ${message.slice(0, 200)}`,
    );
  };

  return {
    async take() {
      try {
        return (await counter.increment(dayKey(kind, now()), KEY_TTL_SECONDS)) <= cap;
      } catch (error) {
        onError(error);
        return !blockOnRedisError;
      }
    },
    async spent() {
      try {
        return (await counter.read(dayKey(kind, now()))) >= cap;
      } catch (error) {
        onError(error);
        return blockOnRedisError;
      }
    },
  };
}
