"use client";

import { CircleCheck, Circle } from "lucide-react";
import { useHydrated, useProgressStore } from "@/engine/store";
import { useT } from "@/i18n/hooks";

export function CompletedTick({ scenarioKey }: { scenarioKey: string }) {
  const t = useT();
  const hydrated = useHydrated();
  const done = useProgressStore((s) => s.completed[scenarioKey] === true);
  return hydrated && done ? (
    <CircleCheck
      className="size-5 shrink-0 text-emerald-600"
      aria-label={t("progress.completed")}
    />
  ) : (
    <Circle className="size-5 shrink-0 text-neutral-300" aria-label={t("progress.notCompleted")} />
  );
}
