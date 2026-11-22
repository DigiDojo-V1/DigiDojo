"use client";

import { Progress } from "@/components/ui/progress";
import { useHydrated, useProgressStore } from "@/engine/store";
import { useT } from "@/i18n/hooks";

/** "2/3 done" bar for a dojo. Reads localStorage, so it shows 0 until hydrated. */
export function DojoProgress({ scenarioKeys }: { scenarioKeys: readonly string[] }) {
  const t = useT();
  const hydrated = useHydrated();
  const completed = useProgressStore((s) => s.completed);
  const total = scenarioKeys.length;
  const done = hydrated ? scenarioKeys.filter((k) => completed[k]).length : 0;

  return (
    <div className="flex items-center gap-2">
      <Progress
        value={total === 0 ? 0 : (done / total) * 100}
        className="flex-1"
        aria-label={t("progress.dojoAria")}
      />
      <span className="text-xs text-muted-foreground tabular-nums">
        {done}/{total}
      </span>
    </div>
  );
}
