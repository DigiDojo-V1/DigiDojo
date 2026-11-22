"use client";

import { CircleCheck, Circle } from "lucide-react";
import { useHydrated, useProgressStore } from "@/engine/store";

export function CompletedTick({ scenarioKey }: { scenarioKey: string }) {
  const hydrated = useHydrated();
  const done = useProgressStore((s) => s.completed[scenarioKey] === true);
  return hydrated && done ? (
    <CircleCheck className="size-5 shrink-0 text-emerald-600" aria-label="Completed" />
  ) : (
    <Circle className="size-5 shrink-0 text-neutral-300" aria-label="Not completed" />
  );
}
