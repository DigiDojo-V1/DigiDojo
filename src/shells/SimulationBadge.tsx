"use client";

import { useT } from "@/i18n/hooks";
import { cn } from "@/lib/utils";

/**
 * Small "Simulation" label. Every simulation screen must show it: each shell puts it in its
 * header, in the normal layout flow, so it never covers the contact name.
 */
export function SimulationBadge({ className }: { className?: string }) {
  const t = useT();
  return (
    <span
      role="note"
      aria-label={t("simulation.badgeAria")}
      className={cn(
        "shrink-0 rounded-full bg-black/75 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-white uppercase",
        className,
      )}
    >
      {t("simulation.badge")}
    </span>
  );
}
