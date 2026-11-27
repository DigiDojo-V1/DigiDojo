import { describe, expect, it } from "vitest";
import { resolveSpot } from "@/engine/flags";
import {
  answerSpans,
  CHIP_COUNT,
  findTarget,
  matchHighlight,
  reasonChips,
  sentenceCatches,
  splitSentences,
  targetText,
  textTargets,
  type TextTarget,
} from "@/engine/highlight";
import { richScenario, validScenario } from "./fixtures";

const range = (target: TextTarget, phrase: string, locale: "en" | "hinglish" = "en") => {
  const start = targetText(target, locale).indexOf(phrase);
  if (start === -1) throw new Error(`"${phrase}" not found`);
  return [start, start + phrase.length] as const;
};
const spot = (target: TextTarget, phrase: string) => {
  const [start, end] = range(target, phrase);
  return { start, end };
};

const sentences = (text: string) => splitSentences(text).map((r) => text.slice(r.start, r.end));

describe("splitSentences", () => {
  it("splits after . ! ? and … followed by a space", () => {
    expect(sentences("Hi Ananya! I'm Karan. Want a job? Great… Pay now.")).toEqual([
      "Hi Ananya!",
      "I'm Karan.",
      "Want a job?",
      "Great…",
      "Pay now.",
    ]);
  });

  it("keeps repeated marks and closing quotes with their sentence", () => {
    expect(sentences('Congrats!! 🎉 You won. Reply "YES." Then pay.')).toEqual([
      "Congrats!!",
      "🎉 You won.",
      'Reply "YES."',
      "Then pay.",
    ]);
  });

  it("doesn't split inside amounts, times or addresses", () => {
    expect(sentences("Pay ₹1,499 by 8:00 PM to karan.sethi@okaxis today")).toEqual([
      "Pay ₹1,499 by 8:00 PM to karan.sethi@okaxis today",
    ]);
  });

  it("splits at blank lines, but keeps a list together with its lead-in", () => {
    expect(sentences("First line\n\nSecond. Third")).toEqual(["First line", "Second.", "Third"]);
    expect(sentences("Upload these:\n• Aadhaar\n• PAN\n\nThanks")).toEqual([
      "Upload these:\n• Aadhaar\n• PAN",
      "Thanks",
    ]);
  });

  it("gives ranges without surrounding spaces", () => {
    const text = "  One.  Two.  ";
    for (const r of splitSentences(text)) {
      expect(text.slice(r.start, r.end)).toBe(text.slice(r.start, r.end).trim());
    }
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

  it("catches a red flag with the sentence that holds it", () => {
    expect(matchHighlight(dm, "en", ...range(dm, "Pay ₹999 to register."))).toEqual(["fee"]);
  });

  it("misses with a harmless sentence", () => {
    expect(matchHighlight(dm, "en", ...range(dm, "Hi!"))).toEqual([]);
    expect(matchHighlight(dm, "en", ...range(dm, "The role is in Bengaluru."))).toEqual([]);
  });

  it("needs at least half of a span that runs across sentences", () => {
    const span = { redFlagId: "x", start: 10, end: 30 };
    expect(sentenceCatches(span, 0, 20)).toBe(true);
    expect(sentenceCatches(span, 21, 40)).toBe(false);
    expect(sentenceCatches(span, 30, 40)).toBe(false);
  });

  it("treats a whole message with a red flag as one span", () => {
    const m2 = findTarget(validScenario(), "m2")!;
    expect(matchHighlight(m2, "en", ...range(m2, "Send ₹500 to earn ₹5,000"))).toEqual([
      "pay-first",
    ]);
  });
});

describe("resolveSpot", () => {
  it("resolves sentences and whole items, and rejects bad spots", () => {
    const s = richScenario();
    const dm = findTarget(s, "dm-1")!;
    const [start, end] = range(dm, "Pay ₹999 to register.");
    expect(resolveSpot(s, { targetId: "dm-1", start, end }, "en")).toEqual({
      text: "Pay ₹999 to register.",
      catches: ["fee"],
    });
    // Only whole sentences: part of one, or two at once, is rejected.
    expect(resolveSpot(s, { targetId: "dm-1", ...spot(dm, "Pay ₹999") }, "en")).toBeUndefined();
    expect(
      resolveSpot(s, { targetId: "dm-1", ...spot(dm, "Hi! Pay ₹999 to register.") }, "en"),
    ).toBeUndefined();
    expect(resolveSpot(s, { targetId: "e-reply-to" }, "en")).toEqual({
      text: "desk@free.example",
      catches: ["reply-to"],
    });
    expect(resolveSpot(s, { targetId: "dm-1", start: 5, end: 999 }, "en")).toBeUndefined();
    expect(resolveSpot(s, { targetId: "nope" }, "en")).toBeUndefined();
    // Text targets can only be flagged sentence by sentence.
    expect(resolveSpot(s, { targetId: "dm-pay" }, "en")).toBeUndefined();
  });
});

describe("chips", () => {
  const s = richScenario();

  it("gives the same chips for the same seed, always including the right tactic", () => {
    const a = reasonChips(s, ["pay-to-earn"], "seed");
    expect(a).toEqual(reasonChips(s, ["pay-to-earn"], "seed"));
    expect(a).toHaveLength(CHIP_COUNT);
    expect(a.map((c) => c.tactic)).toContain("pay-to-earn");
    expect(new Set(a.map((c) => c.tactic)).size).toBe(CHIP_COUNT);
  });
});
