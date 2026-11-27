"use client";

import { createContext, useContext, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * On desktop the player docks a "Dojo panel" next to the fake app (`PlayerFrame`). Game
 * controls (reply choices, triage labels) render into it through `<DojoPanel>`; on phones there
 * is no panel and they render where they are, as before.
 */
export const PanelSlotContext = createContext<HTMLElement | null>(null);

/** Whether a docked Dojo panel is showing (desktop player only). */
export function useInDojoPanel(): boolean {
  return useContext(PanelSlotContext) !== null;
}

/** Renders its children in the docked Dojo panel when there is one, otherwise in place. */
export function DojoPanel({ children }: { children: ReactNode }) {
  const slot = useContext(PanelSlotContext);
  if (slot === null) return <>{children}</>;
  return createPortal(children, slot);
}
