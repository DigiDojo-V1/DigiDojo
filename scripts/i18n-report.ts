/**
 * npm run i18n:report
 *
 * Prints, per dojo and scenario, how many player-facing text fields still have no Hinglish.
 * A report, not a gate: it always exits 0. Fill the gaps with /translate-hinglish <file>.
 */
import { DOJOS } from "@/dojos/registry";
import { collectDojoTexts, collectTexts, hinglishCoverage, type Coverage } from "@/i18n/coverage";

const rows: { name: string; coverage: Coverage }[] = [];
for (const dojo of DOJOS) {
  rows.push({
    name: `${dojo.id} (dojo name, tagline)`,
    coverage: hinglishCoverage(collectDojoTexts(dojo)),
  });
  for (const scenario of dojo.scenarios) {
    rows.push({
      name: `${dojo.id}/${scenario.id}`,
      coverage: hinglishCoverage(collectTexts(scenario)),
    });
  }
}

const width = Math.max(...rows.map((r) => r.name.length), "Scenario".length);
const line = (name: string, missing: string, total: string) =>
  `${name.padEnd(width)}  ${missing.padStart(7)}  ${total.padStart(5)}`;

console.log(
  "Hinglish coverage (missing = text fields with no Hinglish yet; English is shown instead)\n",
);
console.log(line("Scenario", "Missing", "Total"));
console.log("-".repeat(width + 16));
let missing = 0;
let total = 0;
for (const { name, coverage } of rows) {
  missing += coverage.missing.length;
  total += coverage.total;
  const mark = coverage.missing.length === 0 ? "  ✓" : "";
  console.log(line(name, String(coverage.missing.length), String(coverage.total)) + mark);
}
console.log("-".repeat(width + 16));
console.log(line("All", String(missing), String(total)));
if (missing > 0)
  console.log("\nTo fill a scenario's gaps: /translate-hinglish <path to scenario file>");
