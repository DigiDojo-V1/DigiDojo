import "server-only";
import { createHash } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/** Per-IP limit for one endpoint. */
export interface Limiter {
  /** True if this caller may make another request now. */
  allow(key: string): Promise<boolean>;
}

export const LIMITS = {
  chips: { requests: 30, window: "1 m", prefix: "digidojo:flag:chips" },
  judge: { requests: 10, window: "1 m", prefix: "digidojo:flag:judge" },
  /** One token per live call. */
  callToken: { requests: 8, window: "10 m", prefix: "digidojo:call:token" },
  callReport: { requests: 12, window: "10 m", prefix: "digidojo:call:report" },
} as const;

let redis: Redis | null | undefined;
let warned = false;

function getRedis(): Redis | null {
  if (redis !== undefined) return redis;
  // The Vercel Marketplace integration may set either pair.
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  redis = url !== undefined && token !== undefined ? new Redis({ url, token }) : null;
  return redis;
}

const limiters = new Map<keyof typeof LIMITS, Limiter>();

export function getLimiter(kind: keyof typeof LIMITS): Limiter {
  const existing = limiters.get(kind);
  if (existing !== undefined) return existing;
  const client = getRedis();
  let limiter: Limiter;
  if (client === null) {
    if (!warned && process.env.NODE_ENV !== "production") {
      console.warn("Upstash Redis is not configured: the AI endpoints are not rate limited.");
      warned = true;
    }
    limiter = { allow: async () => true };
  } else {
    const { requests, window, prefix } = LIMITS[kind];
    const rl = new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(requests, window),
      prefix,
    });
    limiter = {
      async allow(key) {
        try {
          return (await rl.limit(key)).success;
        } catch {
          // A limiter outage shouldn't take the game down; the endpoints fall back anyway.
          return true;
        }
      },
    };
  }
  limiters.set(kind, limiter);
  return limiter;
}

/** A hashed caller id, so raw IPs never reach Redis. */
export function callerKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  return createHash("sha256").update(`digidojo:${ip}`).digest("hex").slice(0, 32);
}
