import { describe, expect, it, vi } from "vitest";
import { trustMeBro } from "@/dojos/trust-me-bro";
import type { Scenario } from "@/engine/schema";
import { voiceNoteSrc } from "@/engine/voice";
import { DEFAULT_VOICE_MODEL, voiceModelFrom, voiceStatus } from "@/server/ai-config";
import {
  handleVoice,
  voiceInstructions,
  type TtsLike,
  type VoiceApiDeps,
} from "@/server/voice-api";

const getScenario = (d: string, s: string): Scenario | undefined =>
  d === "trust-me-bro" ? trustMeBro.scenarios.find((x) => x.id === s) : undefined;

const audio = new Uint8Array([1, 2, 3]);
function deps(overrides: Partial<VoiceApiDeps> = {}): VoiceApiDeps {
  const tts: TtsLike = { speak: vi.fn(async () => audio) };
  return { tts, allow: async () => true, getScenario, ...overrides };
}
const ask = {
  dojoId: "trust-me-bro",
  scenarioId: "bhai-urgent",
  messageId: "ask-voice",
  locale: "en",
};

describe("handleVoice", () => {
  it("speaks the voice note's transcript with its voice and mood", async () => {
    const d = deps();
    const result = await handleVoice(ask, d);
    expect(result).toEqual({ status: 200, audio });
    const call = vi.mocked(d.tts!.speak).mock.calls[0]![0];
    expect(call.text).toContain("₹5,000 deposit");
    expect(call.voice).toBe("male");
    expect(call.instructions).toMatch(/stressed/);
  });

  it("refuses messages that aren't voice notes, and unknown scenarios", async () => {
    expect((await handleVoice({ ...ask, messageId: "ask-fast" }, deps())).status).toBe(404);
    expect((await handleVoice({ ...ask, scenarioId: "nope" }, deps())).status).toBe(404);
  });

  it("rejects malformed requests", async () => {
    expect((await handleVoice({ ...ask, locale: "fr" }, deps())).status).toBe(400);
    expect((await handleVoice({ ...ask, text: "say anything" }, deps())).status).toBe(400);
  });

  it("answers 503 when voice generation is off, so the browser voice takes over", async () => {
    expect((await handleVoice(ask, deps({ tts: null }))).status).toBe(503);
  });

  it("rate limits, but serves cached audio without counting", async () => {
    const cache = new Map<string, Uint8Array>();
    const allow = vi.fn(async () => true);
    const d = deps({ cache, allow });
    await handleVoice(ask, d);
    await handleVoice(ask, d);
    expect(allow).toHaveBeenCalledTimes(1);
    expect(d.tts!.speak).toHaveBeenCalledTimes(1);
    expect(
      (await handleVoice({ ...ask, locale: "hinglish" }, deps({ allow: async () => false })))
        .status,
    ).toBe(429);
  });

  it("answers 502 when generation fails", async () => {
    const tts: TtsLike = { speak: async () => Promise.reject(new Error("boom")) };
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await handleVoice(ask, deps({ tts }))).status).toBe(502);
    spy.mockRestore();
  });
});

describe("voice config", () => {
  it("is off unless VOICE_AI=on and a key is set", () => {
    expect(voiceStatus({})).toHaveProperty("off");
    expect(voiceStatus({ VOICE_AI: "on" })).toHaveProperty("off");
    expect(voiceStatus({ VOICE_AI: "on", OPENAI_API_KEY: "k" })).toEqual({ on: true });
    expect(voiceModelFrom({})).toBe(DEFAULT_VOICE_MODEL);
  });

  it("asks for Hinglish when the player reads Hinglish", () => {
    expect(voiceInstructions({ durationSec: 3 }, "hinglish")).toMatch(/Hinglish/);
  });

  it("builds the audio URL", () => {
    expect(voiceNoteSrc("trust-me-bro", "bhai-urgent", "ask-voice", "en")).toBe(
      "/api/voice/trust-me-bro/bhai-urgent/ask-voice?locale=en",
    );
  });
});
