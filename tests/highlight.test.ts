import { describe, expect, it } from "vitest";
import { resolveSpot } from "@/engine/flags";
import {
  answerSpans,
  CHIP_COUNT,
  fallbackChips,
  finalizeChips,
  findTarget,
  highlightCatches,
  MAX_HIGHLIGHT_CHARS,
  matchHighlight,
  targetText,
  textTargets,
  tokenize,
  type TextTarget,
} from "@/engine/highlight";
import { richScenario, validScenario } from "./fixtures";

const range = (target: TextTarget, phrase: string, locale: "en" | "hinglish" = "en") => {
  const start = targetText(target, locale).indexOf(phrase);
  if (start === -1) throw new Error(`"${phrase}" not found`);
  return [start, start + phrase.length] as const;
};

describe("tokenize", () => {
  it("splits words and spaces with offsets that rebuild the text", () => {
    const text = "Pay ₹999  now.\nOK";
    const tokens = tokenize(text);
    expect(tokens.map((t) => t.text).join("")).toBe(text);
    expect(tokens.filter((t) => t.word).map((t) => t.text)).toEqual(["Pay", "₹999", "now.", "OK"]);
    for (const t of tokens) expect(text.slice(t.start, t.end)).toBe(t.text);
  });
});

describe("text targets", () => {
  it("lists other people's messages and email paragraphs, not the player's", () => {
    const ids = textTargets(richScenario()).map((t) => t.id);
    expect(ids).toEqual(["dm-1", "mail/body/0", "t-real/body/0"]);
  });

  it("places spans per locale and trims the spaces around a segment", () => {
    const target: TextTarget = {
      id: "x",
      parts: [
        { text: { en: "Hi! ", hinglish: "Namaste! " } },
        {
          text: { en: " Pay now ", hinglish: " Abhi pay karo " },
          redFlagId: "fee",
          carrierId: "s",
        },
      ],
    };
    const [en] = answerSpans(target, "en");
    expect(targetText(target, "en").slice(en!.start, en!.end)).toBe("Pay now");
    const [hi] = answerSpans(target, "hinglish");
    expect(targetText(target, "hinglish").slice(hi!.start, hi!.end)).toBe("Abhi pay karo");
  });
});

describe("matchHighlight", () => {
  const dm = findTarget(richScenario(), "dm-1")!;

  it("catches a highlight inside the span", () => {
    expect(matchHighlight(dm, "en", ...range(dm, "₹999"))).toEqual(["fee"]);
  });

  it("catches a highlight that covers the span with a little extra", () => {
    expect(matchHighlight(dm, "en", ...range(dm, "Hi! Pay ₹999 to register."))).toEqual(["fee"]);
  });

  it("misses a highlight that only grazes the span", () => {
    expect(matchHighlight(dm, "en", ...range(dm, "register. The role is in Bengaluru."))).toEqual(
      [],
    );
  });

  it("misses a highlight of harmless words", () => {
    expect(matchHighlight(dm, "en", ...range(dm, "Bengaluru"))).toEqual([]);
  });

  it("never catches anything with a whole-paragraph highlight", () => {
    const span = { redFlagId: "x", start: 0, end: 20 };
    expect(highlightCatches(span, 0, MAX_HIGHLIGHT_CHARS + 1)).toBe(false);
    // Too long relative to a short span.
    expect(highlightCatches({ redFlagId: "x", start: 50, end: 60 }, 0, 120)).toBe(false);
  });

  it("treats a whole message with a red flag as one span", () => {
    const m2 = findTarget(validScenario(), "m2")!;
    expect(matchHighlight(m2, "en", ...range(m2, "₹5,000"))).toEqual(["pay-first"]);
  });
});

describe("resolveSpot", () => {
  it("resolves highlights and whole items, and rejects bad spots", () => {
    const s = richScenario();
    const [start, end] = range(findTarget(s, "dm-1")!, "Pay ₹999");
    expect(resolveSpot(s, { targetId: "dm-1", start, end }, "en")).toEqual({
      text: "Pay ₹999",
      catches: ["fee"],
    });
    expect(resolveSpot(s, { targetId: "e-reply-to" }, "en")).toEqual({
      text: "desk@free.example",
      catches: ["reply-to"],
    });
    expect(resolveSpot(s, { targetId: "dm-1", start: 5, end: 999 }, "en")).toBeUndefined();
    expect(resolveSpot(s, { targetId: "nope" }, "en")).toBeUndefined();
    // Text targets can only be flagged by highlighting words.
    expect(resolveSpot(s, { targetId: "dm-pay" }, "en")).toBeUndefined();
  });
});

describe("chips", () => {
  const s = richScenario();

  it("gives the same chips for the same seed, always including the right tactic", () => {
    const a = fallbackChips(s, ["pay-to-earn"], "seed");
    expect(a).toEqual(fallbackChips(s, ["pay-to-earn"], "seed"));
    expect(a).toHaveLength(CHIP_COUNT);
    expect(a.map((c) => c.tactic)).toContain("pay-to-earn");
    expect(new Set(a.map((c) => c.tactic)).size).toBe(CHIP_COUNT);
  });

  it("cleans up model chips: known tactics, no duplicates, right answer added", () => {
    const chips = finalizeChips(
      [
        { tactic: "urgency", label: "Rushes you" },
        { tactic: "urgency", label: "Again" },
        { tactic: "flattery", label: "Praise" },
        { tactic: "authority", label: "Boss" },
        { tactic: "social-proof", label: "Others" },
      ],
      s,
      ["pay-to-earn"],
      "seed",
    );
    const tactics = chips.map((c) => c.tactic);
    expect(tactics).toHaveLength(CHIP_COUNT);
    expect(tactics).toContain("pay-to-earn");
    expect(new Set(tactics).size).toBe(CHIP_COUNT);
    expect(chips.find((c) => c.tactic === "urgency")?.label).toBe("Rushes you");
  });
});
