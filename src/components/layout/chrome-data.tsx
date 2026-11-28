"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { LocalizedText } from "@/engine/schema";

/** One dojo as the app chrome shows it: nav item and progress row. */
export interface DojoSummary {
  id: string;
  order: number;
  name: LocalizedText;
  tagline: LocalizedText;
  scenarioKeys: string[];
}

const ChromeDataContext = createContext<readonly DojoSummary[]>([]);

/** Set once in the root layout, from `dojoSummaries()`. */
export function ChromeDataProvider({
  dojos,
  children,
}: {
  dojos: readonly DojoSummary[];
  children: ReactNode;
}) {
  return <ChromeDataContext.Provider value={dojos}>{children}</ChromeDataContext.Provider>;
}

export function useDojoSummaries(): readonly DojoSummary[] {
  return useContext(ChromeDataContext);
}
