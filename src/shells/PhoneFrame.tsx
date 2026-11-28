"use client";

import type { ReactNode } from "react";
import { BatteryFull, Signal, Wifi } from "lucide-react";
import { useInDojoPanel } from "./panel-slot";

/**
 * Phone-only apps (SMS, UPI, calls) have no desktop version, so on desktop they appear inside a
 * phone mockup centred next to the Dojo panel. On phones this renders its children as they are.
 * A shell inside it should use `min-h-dvh lg:min-h-full` for its root, so it fills the phone.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  const docked = useInDojoPanel();
  if (!docked) return <>{children}</>;
  return (
    <div className="flex h-full min-h-0 flex-1 items-center justify-center bg-[radial-gradient(circle_at_50%_40%,#f5f5f5,#d4d4d4)] p-6">
      <div className="flex h-[min(844px,100%)] w-[390px] shrink-0 flex-col overflow-hidden rounded-[52px] border-[12px] border-neutral-900 bg-white shadow-2xl">
        <div
          aria-hidden
          className="relative flex h-9 shrink-0 items-center justify-between bg-white px-7 text-xs font-semibold text-neutral-900"
        >
          <span>9:41</span>
          <span className="absolute top-1.5 left-1/2 h-6 w-24 -translate-x-1/2 rounded-full bg-neutral-900" />
          <span className="flex items-center gap-1">
            <Signal className="size-3.5" />
            <Wifi className="size-3.5" />
            <BatteryFull className="size-4" />
          </span>
        </div>
        <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
