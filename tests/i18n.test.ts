import { describe, expect, it } from "vitest";
import { defineScenario } from "@/engine/define";
import type { Scenario } from "@/engine/schema";
import { computeDebrief } from "@/engine/scoring";
import { priorTranscript, toBubble } from "@/engine/transcript";
import { collectTexts, hinglishCoverage } from "@/i18n/coverage";
import { LOCALES } from "@/i18n/locale";
import { resolveText } from "@/i18n/text";
import { translate, UI_STRINGS } from "@/i18n/ui";
import { flagsById, makeFlag, validScenarioInput } from "./fixtures";

describe("translate", () => {
  it("returns the Hinglish string when there is one", () => {
    expect(translate("hinglish", "notFound.body")).toBe(UI_STRINGS.hinglish["notFound.body"]);
    expect(translate("hinglish", "notFound.body")).not.toBe(UI_STRINGS.en["notFound.body"]);
  });

  it("falls back to English when Hinglish is missing", () => {
    expect(UI_STRINGS.hinglish["primer.start"]).toBeUndefined();
    expect(translate("hinglish", "primer.start")).toBe("Start simulation");
  });

  it("returns English for en", () => {
    expect(translate("en", "notFound.body")).toBe(UI_STRINGS.en["notFound.body"]);
  });

  it("supports strings that take arguments", () => {
    expect(translate("en", "home.scenarioCount")(1)).toBe("1 scenario");
    expect(translate("hinglish", "home.scenarioCount")(3)).toBe("3 scenarios");
  });

  it("has no empty English strings", () => {
    for (const [key, value] of Object.entries(UI_STRINGS.en)) {
      if (typeof value === "string") expect(value.trim(), key).not.toBe("");
    }
  });
});

describe("resolveText", () => {
  it("uses Hinglish when there is one and English otherwise", () => {
    expect(resolveText({ en: "Hi", hinglish: "Namaste" }, "hinglish")).toBe("Namaste");
    expect(resolveText({ en: "Hi", hinglish: "Namaste" }, "en")).toBe("Hi");
    expect(resolveText({ en: "Hi" }, "hinglish")).toBe("Hi");
  });
});

describe("a scenario written in plain English strings", () => {
  // validScenarioInput() is written the way /new-scenario writes one: plain strings, no Hinglish.
  const scenario: Scenario = defineScenario(validScenarioInput());

  it("validates", () => {
    expect(scenario.title).toEqual({ en: "Fixture" });
  });

  it.each(LOCALES)("shows every text field in English in the %s locale", (locale) => {
    for (const { path, text } of collectTexts(scenario)) {
      expect(resolveText(text, locale), path).toBe(text.en);
      expect(resolveText(text, locale).length, path).toBeGreaterThan(0);
    }
  });

  it.each(LOCALES)("renders the player's screens in the %s locale", (locale) => {
    // The same view data ScenarioPlayer and Debrief build, end to end along one path.
    const start = scenario.nodes.start;
    const followUp = scenario.nodes["follow-up"];
    const lost = scenario.nodes.lost;
    if (start?.kind !== "thread" || followUp?.kind !== "thread" || lost?.kind !== "outcome") {
      throw new Error("fixture shape changed");
    }

    expect(start.messages.map((m) => toBubble(m, locale).text)).toEqual([
      "Hello",
      "Send ₹500 to earn ₹5,000",
    ]);
    expect(start.choices.map((c) => resolveText(c.label, locale))).toEqual(["Pay", "Block"]);
    expect(resolveText(start.contact.name, locale)).toBe("Stranger");

    const trail = [
      { nodeId: "start", choiceLabel: start.choices[0]!.label },
      { nodeId: "follow-up" },
    ];
    expect(priorTranscript(scenario, trail, locale).map((b) => b.text)).toEqual([
      "Hello",
      "Send ₹500 to earn ₹5,000",
      "Pay",
    ]);

    expect(resolveText(lost.title, locale)).toBe("Lost");
    expect(resolveText(lost.body, locale)).toBe("You lost ₹1,000.");

    const debrief = computeDebrief(scenario, {
      seen: ["m1", "m2", "m3"],
      flags: flagsById(
        makeFlag(scenario, "m2", { phrase: "Send ₹500", tactic: "pay-to-earn" }),
        makeFlag(scenario, "m1", { phrase: "Hello" }),
      ),
      visited: ["start", "follow-up", "lost"],
      classifications: {},
    });
    expect(debrief.caught.map((f) => resolveText(f.label, locale))).toEqual(["Pay first"]);
    expect(debrief.missed.map((f) => resolveText(f.evidenceText, locale))).toEqual([
      "Only 2 minutes left!",
    ]);
    expect(debrief.falseAlarms.map((a) => a.text)).toEqual(["Hello"]);
    expect(translate(locale, `tactic.${debrief.caught[0]!.tactic}.label`)).toBe("Pay to earn");
    expect(resolveText(scenario.debrief.rule, locale)).toBe("Never pay to earn.");
  });
});

describe("hinglishCoverage", () => {
  it("counts fields with no Hinglish, and never treats that as an error", () => {
    const scenario = defineScenario(validScenarioInput());
    const fields = collectTexts(scenario);
    // title, summary, primer x2, 2 contacts, 3 messages, 3 choices, 2 outcomes x2, 2 flags x2, debrief x2
    expect(fields).toHaveLength(22);
    expect(hinglishCoverage(fields).missing).toHaveLength(22);

    const translated = defineScenario({
      ...validScenarioInput(),
      title: { en: "Fixture", hinglish: "Fixture wala" },
    });
    expect(hinglishCoverage(collectTexts(translated)).missing).toHaveLength(21);
  });
});
