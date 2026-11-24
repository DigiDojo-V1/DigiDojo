import { describe, expect, it } from "vitest";
import { dreamJob } from "@/dojos/dream-job";
import { collectFlaggables } from "@/engine/evidence";
import type { Scenario } from "@/engine/schema";
import { computeDebrief } from "@/engine/scoring";

const scenario = (id: string): Scenario => {
  const s = dreamJob.scenarios.find((x) => x.id === id);
  if (s === undefined) throw new Error(`missing scenario ${id}`);
  return s;
};

/** Every string anywhere in the dojo, for blanket safety checks. */
function allStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => allStrings(v, out));
  else if (value !== null && typeof value === "object")
    Object.values(value).forEach((v) => allStrings(v, out));
  return out;
}

describe("Dream Job dojo", () => {
  it("has the six blueprint scenarios in order and the nine takeaways", () => {
    expect(dreamJob.scenarios.map((s) => s.id)).toEqual([
      "easy-too-good",
      "medium-whatsapp",
      "hard-dates",
      "legit-offer",
      "inbox-triage",
      "login-bonus",
    ]);
    expect(dreamJob.takeaways).toHaveLength(9);
  });

  it("uses only fictional .example domains, plus example.com and the blueprint's free-mail and UPI handles", () => {
    const urls = allStrings(dreamJob).flatMap((s) => s.match(/https?:\/\/[^\s)]+/g) ?? []);
    for (const url of urls) expect(new URL(url).hostname).toMatch(/\.example$/);
    const addresses = allStrings(dreamJob).flatMap((s) => s.match(/[\w.-]+@[\w.-]+/g) ?? []);
    for (const address of addresses) {
      expect(address).toMatch(/(\.example|@example\.com|@gmail\.com|@okaxis)$/);
    }
  });

  it("labels the inbox exactly as the blueprint's §5 table", () => {
    const inbox = scenario("inbox-triage").nodes.inbox;
    if (inbox?.kind !== "triage") throw new Error("inbox is not a triage node");
    expect(inbox.items.map((i) => [i.id, i.correct])).toEqual([
      ["gmail-easy-01", "scam"],
      ["gmail-medium-02", "scam"],
      ["gmail-legit-03", "legit"],
      ["gmail-check-04", "needs-checking"],
      ["gmail-hard-05", "scam"],
    ]);
  });

  it("keeps the Medium opening message free of red flags", () => {
    const item = collectFlaggables(scenario("medium-whatsapp")).find((f) => f.id === "li-med-m1");
    expect(item?.redFlagId).toBeUndefined();
  });

  it("hides the Medium deposit only in the PDF fine print", () => {
    const carriers = collectFlaggables(scenario("medium-whatsapp")).filter(
      (f) => f.redFlagId === "pdf-deposit",
    );
    expect(carriers.map((c) => c.where)).toEqual(["fine-print"]);
  });

  it("puts the Hard timeline clue in the profile and the company record, not the message", () => {
    const carriers = collectFlaggables(scenario("hard-dates")).filter(
      (f) => f.redFlagId === "li-timeline-conflict",
    );
    expect(carriers.map((c) => c.panelId).toSorted()).toEqual([
      "nexora-record",
      "nisha-profile",
      "nisha-profile",
    ]);
  });

  it("reports the Hard clue as unchecked if the player never opens a panel", () => {
    const result = computeDebrief(scenario("hard-dates"), {
      seen: ["li-hard-date", "li-hard-m1"],
      flagged: [],
      visited: ["li-nisha", "safe-early"],
      classifications: {},
    });
    expect(result.notInspected.map((f) => f.redFlagId)).toEqual(["li-timeline-conflict"]);
  });

  it("makes the legit offer red-flag free and rejecting it a missed opportunity", () => {
    const legit = scenario("legit-offer");
    expect(legit.legit).toBe(true);
    expect(legit.redFlags).toEqual({});
    expect(legit.nodes.missed).toMatchObject({ kind: "outcome", result: "missed-opportunity" });
  });

  it("never shows a password field in the login bonus", () => {
    const login = scenario("login-bonus");
    expect(Object.values(login.nodes).map((n) => n.kind)).not.toContain("compose");
    expect(login.nodes["mailbox-taken"]).toMatchObject({ result: "compromised" });
  });
});
