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

/** A dojo whose only scenario is the scaffold placeholder has nothing to play yet. */
export const isComingSoon = (scenarioKeys: readonly string[]) =>
  scenarioKeys.length === 0 || scenarioKeys.every((key) => key.endsWith("/coming-soon"));

/** Every scenario a player can actually finish: coming-soon placeholders left out. */
export const playableScenarioKeys = (dojos: readonly DojoSummary[]): string[] =>
  dojos.filter((d) => !isComingSoon(d.scenarioKeys)).flatMap((d) => d.scenarioKeys);
