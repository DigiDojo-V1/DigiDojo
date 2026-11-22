import { cn } from "@/lib/utils";

/** Small "Simulation" label. Every simulation screen must show it. */
export function SimulationBadge({ className }: { className?: string }) {
  return (
    <div
      role="note"
      aria-label="This is a simulation"
      className={cn(
        "pointer-events-none absolute top-1 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/75 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-white uppercase",
        className,
      )}
    >
      Simulation
    </div>
  );
}
