import { afterEach, describe, expect, it, vi } from "vitest";
import {
  blockOnRedisErrorFrom,
  capFrom,
  createDailyCap,
  DAILY_CAPS,
  dayKey,
  KEY_TTL_SECONDS,
  type DayCounter,
} from "@/server/daily-cap";

function fakeCounter(): DayCounter & { counts: Map<string, number>; ttls: number[] } {
  const counts = new Map<string, number>();
  const ttls: number[] = [];
  return {
    counts,
    ttls,
    async increment(key, ttlSeconds) {
      const next = (counts.get(key) ?? 0) + 1;
      counts.set(key, next);
      ttls.push(ttlSeconds);
      return next;
    },
    async read(key) {
      return counts.get(key) ?? 0;
    },
  };
}

const broken: DayCounter = {
  increment: async () => Promise.reject(new Error("redis down")),
  read: async () => Promise.reject(new Error("redis down")),
};

afterEach(() => vi.restoreAllMocks());

describe("capFrom", () => {
  it("uses the defaults when the env var is unset or blank", () => {
    expect(capFrom({}, "callToken")).toBe(150);
    expect(capFrom({}, "callReport")).toBe(200);
    expect(capFrom({}, "judge")).toBe(1000);
    expect(capFrom({ AI_DAILY_CAP_JUDGE: "  " }, "judge")).toBe(1000);
  });

  it("reads each endpoint's own env var", () => {
    const env = { AI_DAILY_CAP_CALL_TOKEN: "40", AI_DAILY_CAP_CALL_REPORT: " 60 " };
    expect(capFrom(env, "callToken")).toBe(40);
    expect(capFrom(env, "callReport")).toBe(60);
    expect(capFrom({ AI_DAILY_CAP_JUDGE: "0" }, "judge")).toBe(0);
  });

  it("falls back to the default on a value that isn't a whole number", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    for (const bad of ["-5", "1.5", "ten", "1e3", "Infinity"])
      expect(capFrom({ AI_DAILY_CAP_CALL_TOKEN: bad }, "callToken")).toBe(
        DAILY_CAPS.callToken.default,
      );
    expect(warn).toHaveBeenCalled();
  });
});

describe("blockOnRedisErrorFrom", () => {
  it("is on only for true", () => {
    expect(blockOnRedisErrorFrom({})).toBe(false);
    expect(blockOnRedisErrorFrom({ AI_CAP_BLOCK_ON_REDIS_ERROR: "false" })).toBe(false);
    expect(blockOnRedisErrorFrom({ AI_CAP_BLOCK_ON_REDIS_ERROR: "1" })).toBe(false);
    expect(blockOnRedisErrorFrom({ AI_CAP_BLOCK_ON_REDIS_ERROR: "true" })).toBe(true);
    expect(blockOnRedisErrorFrom({ AI_CAP_BLOCK_ON_REDIS_ERROR: " TRUE " })).toBe(true);
  });
});

describe("dayKey", () => {
  it("is one key per endpoint per UTC day", () => {
    // 23:59 UTC is 05:29 the next morning in India: still the same budget.
    expect(dayKey("callToken", new Date("2026-11-28T23:59:59Z"))).toBe(
      "digidojo:cap:callToken:2026-11-28",
    );
    expect(dayKey("callToken", new Date("2026-11-29T00:00:00Z"))).toBe(
      "digidojo:cap:callToken:2026-11-29",
    );
    expect(dayKey("judge", new Date("2026-11-28T12:00:00Z"))).toBe("digidojo:cap:judge:2026-11-28");
  });
});

describe("createDailyCap", () => {
  it("allows exactly the cap, then blocks for the rest of the day", async () => {
    const counter = fakeCounter();
    const cap = createDailyCap({ kind: "callToken", cap: 3, counter, blockOnRedisError: false });
    const results = [];
    for (let i = 0; i < 5; i++) results.push(await cap.take());
    expect(results).toEqual([true, true, true, false, false]);
    expect(counter.ttls.every((t) => t === KEY_TTL_SECONDS)).toBe(true);
  });

  it("starts a fresh budget the next UTC day", async () => {
    let now = new Date("2026-11-28T23:00:00Z");
    const cap = createDailyCap({
      kind: "judge",
      cap: 1,
      counter: fakeCounter(),
      blockOnRedisError: false,
      now: () => now,
    });
    expect(await cap.take()).toBe(true);
    expect(await cap.take()).toBe(false);
    now = new Date("2026-11-29T00:00:01Z");
    expect(await cap.take()).toBe(true);
  });

  it("keeps each endpoint's budget separate", async () => {
    const counter = fakeCounter();
    const token = createDailyCap({ kind: "callToken", cap: 1, counter, blockOnRedisError: false });
    const report = createDailyCap({
      kind: "callReport",
      cap: 1,
      counter,
      blockOnRedisError: false,
    });
    expect(await token.take()).toBe(true);
    expect(await token.take()).toBe(false);
    expect(await report.take()).toBe(true);
  });

  it("reports a spent budget without using any of it", async () => {
    const counter = fakeCounter();
    const cap = createDailyCap({ kind: "callToken", cap: 2, counter, blockOnRedisError: false });
    expect(await cap.spent()).toBe(false);
    await cap.take();
    expect(await cap.spent()).toBe(false);
    await cap.take();
    expect(await cap.spent()).toBe(true);
    expect([...counter.counts.values()]).toEqual([2]);
  });

  it("switches the AI off at cap 0, with or without Redis", async () => {
    for (const counter of [fakeCounter(), null]) {
      const cap = createDailyCap({ kind: "judge", cap: 0, counter, blockOnRedisError: false });
      expect(await cap.take()).toBe(false);
      expect(await cap.spent()).toBe(true);
    }
  });

  it("caps nothing when Redis isn't configured", async () => {
    const cap = createDailyCap({
      kind: "callToken",
      cap: 1,
      counter: null,
      blockOnRedisError: true,
    });
    expect(await cap.take()).toBe(true);
    expect(await cap.take()).toBe(true);
    expect(await cap.spent()).toBe(false);
  });

  it("allows calls when Redis fails, unless told to block", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const open = createDailyCap({
      kind: "judge",
      cap: 5,
      counter: broken,
      blockOnRedisError: false,
    });
    expect(await open.take()).toBe(true);
    expect(await open.spent()).toBe(false);
    const closed = createDailyCap({
      kind: "judge",
      cap: 5,
      counter: broken,
      blockOnRedisError: true,
    });
    expect(await closed.take()).toBe(false);
    expect(await closed.spent()).toBe(true);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("redis down"));
  });
});
