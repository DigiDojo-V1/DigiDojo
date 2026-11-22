import { cn } from "@/lib/utils";

/**
 * Small "Simulation" label. Every simulation screen must show it: each shell puts it in its
 * header, in the normal layout flow, so it never covers the contact name.
 */
export function SimulationBadge({ className }: { className?: string }) {
  return (
    <span
      role="note"
      aria-label="This is a simulation"
      className={cn(
        "shrink-0 rounded-full bg-black/75 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-white uppercase",
        className,
      )}
    >
      Simulation
    </span>
  );
}
