"use client";

import { LanguageToggle } from "@/i18n/LanguageToggle";
import { useInDojoPanel } from "./panel-slot";
import { SimulationBadge } from "./SimulationBadge";

/**
 * Slim strip above every fake app's header: the "Simulation" label on the left and the
 * language toggle on the right. It sits outside the fake app, so it never covers the contact.
 * On desktop the docked Dojo panel carries both instead, so the strip steps aside.
 */
export function SimulationBar() {
  const docked = useInDojoPanel();
  if (docked) return null;
  return (
    <div className="flex h-9 items-center justify-between border-b border-black/5 bg-neutral-100 px-3">
      <SimulationBadge />
      <LanguageToggle />
    </div>
  );
}
