import { describe, expect, it } from "vitest";
import { trustMeBro } from "@/dojos/trust-me-bro";
import { ScenarioSchema, type Scenario } from "@/engine/schema";
import { toBubble } from "@/engine/transcript";
import { formatVoiceLength, waveform } from "@/shells/VoiceNote";
import { validScenarioInput } from "./fixtures";

const scenario = (id: string): Scenario => {
  const s = trustMeBro.scenarios.find((x) => x.id === id);
  if (s === undefined) throw new Error(`missing scenario ${id}`);
  return s;
};

function allStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => allStrings(v, out));
  else if (value !== null && typeof value === "object")
    Object.values(value).forEach((v) => allStrings(v, out));
  return out;
}

describe("Trust Me Bro dojo", () => {
  it("has the two planned scams and one legit scenario, and no placeholder", () => {
    expect(trustMeBro.scenarios.map((s) => [s.id, s.legit])).toEqual([
      ["bhai-urgent", false],
      ["free-gems", false],
      ["real-friend", true],
    ]);
  });

  it("gives every scam at least 3 red flags and 3 decision points on some path", () => {
    for (const s of trustMeBro.scenarios.filter((x) => !x.legit)) {
      expect(Object.keys(s.redFlags).length, s.id).toBeGreaterThanOrEqual(3);
      const decisions = Object.values(s.nodes).filter((n) => n.kind !== "outcome");
      expect(decisions.length, s.id).toBeGreaterThanOrEqual(3);
    }
  });

  it("keeps the legit scenario free of red flags", () => {
    expect(scenario("real-friend").redFlags).toEqual({});
  });

  it("gives every loss a rewind point", () => {
    for (const s of trustMeBro.scenarios) {
      for (const node of Object.values(s.nodes)) {
        if (node.kind === "outcome" && node.result !== "safe") {
          expect(node.rewindToNodeId, `${s.id}: ${node.title.en}`).toBeDefined();
        }
      }
    }
  });

  it("uses only fictional .example domains, plus cybercrime.gov.in", () => {
    const hosts = allStrings(trustMeBro).flatMap((s) => s.match(/[\w-]+\.example\b/g) ?? []);
    expect(hosts.length).toBeGreaterThan(0);
    const urls = allStrings(trustMeBro).flatMap(
      (s) => s.match(/\b[\w-]+\.(com|in|net|org)\b/g) ?? [],
    );
    // The only real site named is the national cybercrime portal.
    expect(urls.filter((u) => u !== "gov.in")).toEqual([]);
  });

  it("draws the cloned voice as a voice note with its transcript", () => {
    const ask = scenario("bhai-urgent").nodes["the-ask"];
    if (ask?.kind !== "thread") throw new Error("the-ask is not a thread");
    const bubble = toBubble(ask.messages[0]!, "en");
    expect(bubble.voiceNote).toEqual({ durationSec: 14 });
    expect(bubble.text).toContain("₹5,000 deposit");
    expect(bubble.flaggable).toBe(true);
  });
});

describe("voice notes", () => {
  it("leaves plain messages without a voice note", () => {
    const bubble = toBubble({ id: "m", from: "them", text: { en: "hi" } }, "en");
    expect(bubble).not.toHaveProperty("voiceNote");
  });

  it("rejects a system message drawn as a voice note", () => {
    const input = validScenarioInput();
    const start = input.nodes.start;
    if (start?.kind !== "thread") throw new Error("fixture");
    start.messages.push({
      id: "sys",
      from: "system",
      text: "Joined",
      voiceNote: { durationSec: 3 },
    });
    expect(ScenarioSchema.safeParse(input).success).toBe(false);
  });

  it("formats the length as m:ss", () => {
    expect(formatVoiceLength(7)).toBe("0:07");
    expect(formatVoiceLength(65)).toBe("1:05");
  });

  it("draws the same waveform for the same note", () => {
    expect(waveform("ask-voice")).toEqual(waveform("ask-voice"));
    expect(waveform("ask-voice")).not.toEqual(waveform("ct-voice"));
    for (const h of waveform("ask-voice")) {
      expect(h).toBeGreaterThanOrEqual(0.25);
      expect(h).toBeLessThanOrEqual(1);
    }
  });
});
