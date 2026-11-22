"use client";

import { LanguageToggle } from "@/i18n/LanguageToggle";
import { SimulationBadge } from "./SimulationBadge";

/**
 * Slim strip above every fake app's header: the "Simulation" label on the left and the
 * language toggle on the right. It sits outside the fake app, so it never covers the contact.
 */
export function SimulationBar() {
  return (
    <div className="flex h-9 items-center justify-between border-b border-black/5 bg-neutral-100 px-3">
      <SimulationBadge />
      <LanguageToggle />
    </div>
  );
}
