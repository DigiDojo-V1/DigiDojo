import { describe, expect, it } from "vitest";
import { translate, UI_STRINGS } from "@/i18n/ui";

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
