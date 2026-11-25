"use client";

import { Progress } from "@/components/ui/progress";
import { useHydrated, useProgressStore } from "@/engine/store";
import { useT } from "@/i18n/hooks";
import { cn } from "cn";

/** "2/3 done" bar for a dojo. Reads localStorage, so it shows 0 until hydrated. */
export function DojoProgress({
  scenarioKeys,
  inverted = false,
}: {
  scenarioKeys: readonly string[];
  /** Light bar for a dark background. */
  inverted?: boolean;
}) {
  const t = useT();
  const hydrated = useHydrated();
  const completed = useProgressStore((s) => s.completed);
  const total = scenarioKeys.length;
  const done = hydrated ? scenarioKeys.filter((k) => completed[k]).length : 0;

  return (
    <div className="flex items-center gap-2">
      <Progress
        value={total === 0 ? 0 : (done / total) * 100}
        className={cn(
          "flex-1",
          inverted &&
            "[&_[data-slot=progress-indicator]]:bg-primary-foreground [&_[data-slot=progress-track]]:bg-primary-foreground/20",
        )}
        aria-label={t("progress.dojoAria")}
      />
      <span
        className={cn(
          "text-xs tabular-nums",
          inverted ? "text-primary-foreground/70" : "text-muted-foreground",
        )}
      >
        {done}/{total}
      </span>
    </div>
  );
}
