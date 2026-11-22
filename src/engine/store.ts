import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import type { Choice, Scenario } from "./schema";

/* ------------------------------------------------------------------ */
/* Current run (in memory only)                                        */
/* ------------------------------------------------------------------ */

export type RunPhase = "primer" | "playing" | "debrief";

/** One node on the path the player has taken, with the reply they chose there. */
export interface TrailStep {
  nodeId: string;
  choiceLabel?: string;
}

interface RunState {
  scenarioKey: string | null;
  phase: RunPhase;
  /** Nodes visited on the current timeline. The last entry is the current node. */
  trail: TrailStep[];
  /** Message ids the player has seen, across rewinds. */
  seen: string[];
  /** Message ids the player has flagged. Kept across nodes and rewinds. */
  flagged: string[];
  rewinds: number;
}

interface RunActions {
  start: (key: string, scenario: Scenario) => void;
  beginSimulation: () => void;
  markSeen: (messageId: string) => void;
  toggleFlag: (messageId: string) => void;
  choose: (choice: Choice) => void;
  rewind: (nodeId: string) => void;
  openDebrief: () => void;
  /** Clear the run, e.g. when the player leaves the scenario. */
  reset: () => void;
}

const initialRun: RunState = {
  scenarioKey: null,
  phase: "playing",
  trail: [],
  seen: [],
  flagged: [],
  rewinds: 0,
};

export const useRunStore = create<RunState & RunActions>()((set) => ({
  ...initialRun,

  start: (key, scenario) =>
    set({
      ...initialRun,
      scenarioKey: key,
      phase: scenario.primer !== undefined && scenario.coldRun !== true ? "primer" : "playing",
      trail: [{ nodeId: scenario.startNodeId }],
    }),

  beginSimulation: () => set({ phase: "playing" }),

  markSeen: (messageId) =>
    set((s) => (s.seen.includes(messageId) ? s : { seen: [...s.seen, messageId] })),

  toggleFlag: (messageId) =>
    set((s) => ({
      flagged: s.flagged.includes(messageId)
        ? s.flagged.filter((id) => id !== messageId)
        : [...s.flagged, messageId],
    })),

  choose: (choice) =>
    set((s) => {
      const last = s.trail.at(-1);
      if (last === undefined) return s;
      return {
        trail: [
          ...s.trail.slice(0, -1),
          { ...last, choiceLabel: choice.label },
          { nodeId: choice.nextNodeId },
        ],
      };
    }),

  rewind: (nodeId) =>
    set((s) => {
      const index = s.trail.findLastIndex((step) => step.nodeId === nodeId);
      const trail = index === -1 ? [{ nodeId }] : [...s.trail.slice(0, index), { nodeId }];
      return { trail, phase: "playing", rewinds: s.rewinds + 1 };
    }),

  openDebrief: () => set({ phase: "debrief" }),

  reset: () => set(initialRun),
}));

export function currentNodeId(state: Pick<RunState, "trail">): string | undefined {
  return state.trail.at(-1)?.nodeId;
}

/* ------------------------------------------------------------------ */
/* Persisted progress (localStorage)                                   */
/* ------------------------------------------------------------------ */

interface ProgressState {
  /** Keys are `dojoId/scenarioId`. */
  completed: Record<string, true>;
  markComplete: (key: string) => void;
  resetProgress: () => void;
}

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      completed: {},
      markComplete: (key) => set((s) => ({ completed: { ...s.completed, [key]: true } })),
      resetProgress: () => set({ completed: {} }),
    }),
    {
      name: "digidojo-progress",
      version: 1,
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? noopStorage : window.localStorage,
      ),
      partialize: (s) => ({ completed: s.completed }),
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
