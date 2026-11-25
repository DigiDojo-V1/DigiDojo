import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { z } from "zod";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/locale";
import type { FlagRecord, JudgeState } from "./flags";
import type { Choice, LocalizedText, Scenario, Tactic, TriageLabel } from "./schema";

/* ------------------------------------------------------------------ */
/* Current run (in memory only)                                        */
/* ------------------------------------------------------------------ */

export type RunPhase = "primer" | "playing" | "debrief";

/** One node on the path the player has taken, with the reply they chose there. */
export interface TrailStep {
  nodeId: string;
  choiceLabel?: LocalizedText;
}

interface RunState {
  scenarioKey: string | null;
  phase: RunPhase;
  /** Nodes visited on the current timeline. The last entry is the current node. */
  trail: TrailStep[];
  /** Every node entered during the run, across rewinds, in first-visit order. */
  visited: string[];
  /** Flaggable ids revealed to the player (messages, phrases, inspected fields), across rewinds. */
  seen: string[];
  /** What the player has flagged, by flag id. Kept across nodes and rewinds. */
  flags: Record<string, FlagRecord>;
  /** Inbox triage labels, keyed by triage item id. */
  classifications: Record<string, TriageLabel>;
  rewinds: number;
}

interface RunActions {
  start: (key: string, scenario: Scenario) => void;
  beginSimulation: () => void;
  /** Record flaggable items as seen: a message appeared, a panel opened, the sender was tapped. */
  reveal: (ids: readonly string[]) => void;
  /** Same as `reveal([id])`. */
  markSeen: (id: string) => void;
  /** Save a new flag, or replace one with the same id. */
  saveFlag: (flag: FlagRecord) => void;
  setFlagReason: (id: string, tactic: Tactic | undefined, note: string | undefined) => void;
  removeFlag: (id: string) => void;
  setJudge: (id: string, judge: JudgeState) => void;
  choose: (choice: Choice) => void;
  classify: (itemId: string, label: TriageLabel) => void;
  /** Leave a triage node for its `nextNodeId`. */
  submitTriage: (nextNodeId: string) => void;
  rewind: (nodeId: string) => void;
  openDebrief: () => void;
  /** Clear the run, e.g. when the player leaves the scenario. */
  reset: () => void;
}

const initialRun: RunState = {
  scenarioKey: null,
  phase: "playing",
  trail: [],
  visited: [],
  seen: [],
  flags: {},
  classifications: {},
  rewinds: 0,
};

const withVisit = (visited: string[], nodeId: string) =>
  visited.includes(nodeId) ? visited : [...visited, nodeId];

/** Moves to `nextNodeId`, recording `choiceLabel` (if any) on the step being left. */
function advance(s: RunState, nextNodeId: string, choiceLabel?: LocalizedText): Partial<RunState> {
  const last = s.trail.at(-1);
  if (last === undefined) return {};
  return {
    trail: [...s.trail.slice(0, -1), { ...last, choiceLabel }, { nodeId: nextNodeId }],
    visited: withVisit(s.visited, nextNodeId),
  };
}

export const useRunStore = create<RunState & RunActions>()((set) => ({
  ...initialRun,

  start: (key, scenario) =>
    set({
      ...initialRun,
      scenarioKey: key,
      phase: scenario.primer !== undefined && scenario.coldRun !== true ? "primer" : "playing",
      trail: [{ nodeId: scenario.startNodeId }],
      visited: [scenario.startNodeId],
    }),

  beginSimulation: () => set({ phase: "playing" }),

  reveal: (ids) =>
    set((s) => {
      const fresh = ids.filter((id, i) => !s.seen.includes(id) && ids.indexOf(id) === i);
      return fresh.length === 0 ? s : { seen: [...s.seen, ...fresh] };
    }),

  markSeen: (id) => set((s) => (s.seen.includes(id) ? s : { seen: [...s.seen, id] })),

  saveFlag: (flag) => set((s) => ({ flags: { ...s.flags, [flag.id]: flag } })),

  setFlagReason: (id, tactic, note) =>
    set((s) => {
      const flag = s.flags[id];
      if (flag === undefined) return s;
      return { flags: { ...s.flags, [id]: { ...flag, tactic, note, judge: undefined } } };
    }),

  removeFlag: (id) =>
    set((s) => {
      if (!(id in s.flags)) return s;
      return { flags: Object.fromEntries(Object.entries(s.flags).filter(([key]) => key !== id)) };
    }),

  setJudge: (id, judge) =>
    set((s) => {
      const flag = s.flags[id];
      if (flag === undefined) return s;
      return { flags: { ...s.flags, [id]: { ...flag, judge } } };
    }),

  choose: (choice) => set((s) => advance(s, choice.nextNodeId, choice.label)),

  classify: (itemId, label) =>
    set((s) => ({ classifications: { ...s.classifications, [itemId]: label } })),

  submitTriage: (nextNodeId) => set((s) => advance(s, nextNodeId)),

  rewind: (nodeId) =>
    set((s) => {
      const index = s.trail.findLastIndex((step) => step.nodeId === nodeId);
      const trail = index === -1 ? [{ nodeId }] : [...s.trail.slice(0, index), { nodeId }];
      return {
        trail,
        visited: withVisit(s.visited, nodeId),
        phase: "playing",
        rewinds: s.rewinds + 1,
      };
    }),

  openDebrief: () => set({ phase: "debrief" }),

  reset: () => set(initialRun),
}));

export function currentNodeId(state: Pick<RunState, "trail">): string | undefined {
  return state.trail.at(-1)?.nodeId;
}

/* ------------------------------------------------------------------ */
/* Persisted progress and settings (localStorage)                      */
/* ------------------------------------------------------------------ */

interface ProgressState {
  /** Keys are `dojoId/scenarioId`. */
  completed: Record<string, true>;
  /** The player's language. Read it with `useLocale()` from `@/i18n/hooks`, not directly. */
  locale: Locale;
  markComplete: (key: string) => void;
  resetProgress: () => void;
  setLocale: (locale: Locale) => void;
}

/** What we accept back from localStorage. Anything malformed falls back to the default. */
const PersistedProgressSchema = z.object({
  completed: z.record(z.string(), z.literal(true)).catch({}),
  locale: z.enum(LOCALES).catch(DEFAULT_LOCALE),
});

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      completed: {},
      locale: DEFAULT_LOCALE,
      markComplete: (key) => set((s) => ({ completed: { ...s.completed, [key]: true } })),
      resetProgress: () => set({ completed: {} }),
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: "digidojo-progress",
      version: 1,
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? noopStorage : window.localStorage,
      ),
      partialize: (s) => ({ completed: s.completed, locale: s.locale }),
      // Version 1 saves had no locale; the schema fills it in, so no version bump is needed.
      merge: (persisted, current) => {
        const parsed = PersistedProgressSchema.safeParse(persisted);
        return parsed.success ? { ...current, ...parsed.data } : current;
      },
    },
  ),
);

const subscribeNothing = () => () => {};

/**
 * False during server render and hydration, true afterwards. Gate anything that reads
 * persisted progress on this so the server HTML and the first client render match.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
}
