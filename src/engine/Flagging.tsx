"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocale, useT } from "@/i18n/hooks";
import type { Box } from "@/lib/popover";
import { FlagPopover } from "@/shells/FlagPopover";
import { HighlightProvider, type HighlightMark } from "@/shells/HighlightableText";
import {
  flaggedItemIds,
  JudgeResultSchema,
  MAX_NOTE_CHARS,
  MIN_NOTE_CHARS,
  resolveSpot,
  type FlagRecord,
  type FlagSpot,
  type JudgeState,
} from "./flags";
import { correctTactics, reasonChips, type Chip } from "./highlight";
import type { Scenario, Tactic } from "./schema";
import { useRunStore } from "./store";
import { z } from "zod";

const JUDGE_TIMEOUT_MS = 15000;

interface Draft {
  /** Set when editing an existing flag. */
  flagId?: string;
  spot: FlagSpot;
  text: string;
  catches: string[];
  chips: Chip[];
  tactic?: Tactic;
  note: string;
  /** Where the tapped text is on screen, for the desktop popover. */
  anchor?: Box;
}

const toBox = (r: DOMRect): Box => ({ top: r.top, left: r.left, width: r.width, height: r.height });

/**
 * Remembers the last thing clicked, so the reason popover can sit next to it on desktop.
 * Falls back to the focused element (keyboard flagging).
 */
function useLastClickAnchor() {
  const last = useRef<{ box: Box; at: number } | null>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = e.target instanceof Element ? e.target.closest("[role=button], button") : null;
      if (el !== null) last.current = { box: toBox(el.getBoundingClientRect()), at: Date.now() };
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return useCallback((): Box | undefined => {
    if (last.current !== null && Date.now() - last.current.at < 500) return last.current.box;
    const focused = document.activeElement;
    if (focused instanceof HTMLElement && focused !== document.body)
      return toBox(focused.getBoundingClientRect());
    return undefined;
  }, []);
}

interface FlagActions {
  /** Ids of whole items (Reply-To lines, profile fields...) the player has flagged. */
  itemIds: string[];
  /** Tap on a whole item: open its flag, or start one. */
  flagItem: (id: string) => void;
}

const FlagActionsContext = createContext<FlagActions | null>(null);

/** Item-level flag wiring for any view inside `<Flagging>`. */
export function useFlagActions(): FlagActions {
  const ctx = useContext(FlagActionsContext);
  if (ctx === null) throw new Error("useFlagActions must be used inside <Flagging>");
  return ctx;
}

let counter = 0;
const newFlagId = () => `flag-${Date.now().toString(36)}-${(counter++).toString(36)}`;

const JudgeResponseSchema = z.object({ result: JudgeResultSchema.nullable() });

async function postJson(url: string, body: unknown, timeoutMs: number): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchJudge(scenario: Scenario, flag: FlagRecord): Promise<JudgeState> {
  try {
    const json = await postJson(
      "/api/flag/judge",
      {
        dojoId: scenario.dojoId,
        scenarioId: scenario.id,
        targetId: flag.targetId,
        start: flag.start,
        end: flag.end,
        tactic: flag.tactic,
        note: flag.note,
        locale: flag.locale,
      },
      JUDGE_TIMEOUT_MS,
    );
    return JudgeResponseSchema.parse(json).result ?? "skipped";
  } catch {
    return "error";
  }
}

/**
 * Everything about flagging during play: tapping sentences and whole items, the
 * "Why is this suspicious?" popup, and grading the player's note in the background.
 * `graded`: the AI marks written explanations (FLAG_AI on), so the note box shows.
 */
export function Flagging({
  scenario,
  graded,
  children,
}: {
  scenario: Scenario;
  graded: boolean;
  children: ReactNode;
}) {
  const t = useT();
  const locale = useLocale();
  const flags = useRunStore((s) => s.flags);
  const saveFlag = useRunStore((s) => s.saveFlag);
  const removeFlag = useRunStore((s) => s.removeFlag);
  const setJudge = useRunStore((s) => s.setJudge);
  const [draft, setDraft] = useState<Draft | null>(null);
  const anchorNow = useLastClickAnchor();

  const start = useCallback(
    (spot: FlagSpot) => {
      const resolved = resolveSpot(scenario, spot, locale);
      if (resolved === undefined) return;
      const seed = `${spot.targetId}:${spot.start ?? ""}:${spot.end ?? ""}`;
      const chips = reasonChips(scenario, correctTactics(scenario, resolved.catches), seed);
      setDraft({
        spot,
        text: resolved.text,
        catches: resolved.catches,
        chips,
        note: "",
        anchor: anchorNow(),
      });
    },
    [scenario, locale, anchorNow],
  );

  const open = useCallback(
    (flagId: string) => {
      const flag = useRunStore.getState().flags[flagId];
      if (flag === undefined) return;
      setDraft({
        flagId,
        spot: { targetId: flag.targetId, start: flag.start, end: flag.end },
        text: flag.text,
        catches: flag.catches,
        chips: flag.chips,
        tactic: flag.tactic,
        note: flag.note ?? "",
        anchor: anchorNow(),
      });
    },
    [anchorNow],
  );

  const marksFor = useCallback(
    (targetId: string): HighlightMark[] =>
      Object.values(flags).flatMap((f) =>
        f.targetId === targetId && f.start !== undefined && f.end !== undefined
          ? [{ flagId: f.id, start: f.start, end: f.end }]
          : [],
      ),
    [flags],
  );
  const onFlagRange = useCallback(
    (targetId: string, s: number, e: number) => start({ targetId, start: s, end: e }),
    [start],
  );

  const itemIds = useMemo(() => flaggedItemIds(flags), [flags]);
  const flagItem = useCallback(
    (id: string) => {
      const existing = Object.values(useRunStore.getState().flags).find(
        (f) => f.targetId === id && f.start === undefined,
      );
      if (existing !== undefined) open(existing.id);
      else start({ targetId: id });
    },
    [open, start],
  );
  const actions = useMemo(() => ({ itemIds, flagItem }), [itemIds, flagItem]);

  const close = () => setDraft(null);

  const draftNote = draft?.note.trim() ?? "";
  // A picked reason saves the flag; so does a real explanation, when explanations are marked.
  const canSave =
    draft !== null &&
    (draft.tactic !== undefined || (graded && draftNote.length >= MIN_NOTE_CHARS));

  const save = () => {
    if (draft === null || !canSave) return;
    const note = draftNote.slice(0, MAX_NOTE_CHARS);
    const previous = draft.flagId === undefined ? undefined : flags[draft.flagId];
    const unchangedNote = previous !== undefined && (previous.note ?? "") === note;
    // Grade only notes on flags that caught something; a false alarm earns nothing either way.
    const needsJudge = note.length > 0 && draft.catches.length > 0;
    const flag: FlagRecord = {
      id: draft.flagId ?? newFlagId(),
      ...draft.spot,
      text: draft.text,
      locale,
      catches: draft.catches,
      chips: draft.chips,
      tactic: draft.tactic,
      note: note.length > 0 ? note : undefined,
      judge:
        unchangedNote && previous.tactic === draft.tactic
          ? previous.judge
          : needsJudge
            ? "pending"
            : "skipped",
    };
    saveFlag(flag);
    close();
    if (flag.judge === "pending") {
      void fetchJudge(scenario, flag).then((judge) => {
        // Only store it if the flag is still the one we graded.
        const current = useRunStore.getState().flags[flag.id];
        if (current?.note === flag.note && current.tactic === flag.tactic) setJudge(flag.id, judge);
      });
    }
  };

  const remove = () => {
    if (draft?.flagId !== undefined) removeFlag(draft.flagId);
    close();
  };

  return (
    <FlagActionsContext.Provider value={actions}>
      <HighlightProvider marksFor={marksFor} onFlagRange={onFlagRange} onOpenFlag={open}>
        {children}
      </HighlightProvider>
      {draft !== null && (
        <FlagPopover
          anchor={draft.anchor}
          quote={draft.text}
          chips={draft.chips.map((chip) => ({
            value: chip.tactic,
            label: chip.label ?? t(`tactic.${chip.tactic}.label`),
          }))}
          chosen={draft.tactic}
          note={draft.note}
          maxNote={MAX_NOTE_CHARS}
          showNote={graded || draft.note.length > 0}
          canExplainOnly={graded}
          canSave={canSave}
          editing={draft.flagId !== undefined}
          onChoose={(value) =>
            setDraft((d) => {
              if (d === null) return d;
              // Tapping the picked reason again unpicks it, to answer in your own words instead.
              if (d.tactic === value && graded) return { ...d, tactic: undefined };
              return { ...d, tactic: d.chips.find((c) => c.tactic === value)?.tactic };
            })
          }
          onNote={(note) => setDraft((d) => (d === null ? d : { ...d, note }))}
          onSave={save}
          onCancel={close}
          onRemove={remove}
        />
      )}
    </FlagActionsContext.Provider>
  );
}
