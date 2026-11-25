"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { Flag, X } from "lucide-react";
import { tokenize } from "@/engine/highlight";
import { useT } from "@/i18n/hooks";
import { cn } from "@/lib/utils";

/** A flagged range inside a text, as the shells draw it. */
export interface HighlightMark {
  flagId: string;
  start: number;
  end: number;
}

/** A selection in progress: word indexes into one target's tokens. */
interface Selection {
  targetId: string;
  anchor: number;
  focus: number;
}

interface HighlightContextValue {
  marksFor: (targetId: string) => HighlightMark[];
  /** The player confirmed a selection: open the reason popup for it. */
  onFlagRange: (targetId: string, start: number, end: number) => void;
  /** The player tapped an existing highlight. */
  onOpenFlag: (flagId: string) => void;
  selection: Selection | null;
  setSelection: (selection: Selection | null) => void;
  /** Char range of the current selection, set by the text that owns it. */
  registerRange: (range: { start: number; end: number } | null) => void;
}

const HighlightContext = createContext<HighlightContextValue | null>(null);

/**
 * Lets every `HighlightableText` inside it be highlighted, and shows the "Flag this" bar
 * while the player is selecting. Without a provider, texts render as plain text.
 */
export function HighlightProvider({
  marksFor,
  onFlagRange,
  onOpenFlag,
  children,
}: {
  marksFor: (targetId: string) => HighlightMark[];
  onFlagRange: (targetId: string, start: number, end: number) => void;
  onOpenFlag: (flagId: string) => void;
  children: ReactNode;
}) {
  const t = useT();
  const [selection, setSelection] = useState<Selection | null>(null);
  const [range, registerRange] = useState<{ start: number; end: number } | null>(null);

  const confirm = () => {
    if (selection === null || range === null) return;
    onFlagRange(selection.targetId, range.start, range.end);
    setSelection(null);
  };

  const value = useMemo(
    () => ({ marksFor, onFlagRange, onOpenFlag, selection, setSelection, registerRange }),
    [marksFor, onFlagRange, onOpenFlag, selection],
  );

  return (
    <HighlightContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {selection !== null && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-x-0 bottom-4 z-50 mx-auto flex w-[calc(100%-1.5rem)] max-w-[396px] items-center gap-2 rounded-2xl bg-slate-900 p-2 pl-4 text-white shadow-xl"
            role="toolbar"
            aria-label={t("highlight.toolbar")}
          >
            <p className="min-w-0 flex-1 text-xs leading-snug text-slate-300">
              {t("highlight.extendHint")}
            </p>
            <button
              type="button"
              onClick={() => setSelection(null)}
              aria-label={t("highlight.cancel")}
              className="flex size-11 shrink-0 items-center justify-center rounded-xl text-slate-300 hover:bg-white/10"
            >
              <X className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={confirm}
              className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-red-500 px-4 text-sm font-semibold hover:bg-red-600"
            >
              <Flag className="size-4" aria-hidden /> {t("highlight.flagThis")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </HighlightContext.Provider>
  );
}

/**
 * Text the player can highlight word by word. Nothing in it looks tappable: red flags are
 * hidden, so the player has to find them. Tap a word to start, tap another to extend, then
 * "Flag this". Tapping a flagged highlight reopens it.
 */
export function HighlightableText({ targetId, text }: { targetId: string; text: string }) {
  const ctx = useContext(HighlightContext);
  const t = useT();
  const tokens = useMemo(() => tokenize(text), [text]);
  const marks = ctx?.marksFor(targetId) ?? [];

  if (ctx === null) return <span className="whitespace-pre-line">{text}</span>;

  const markAt = (i: number) => {
    const token = tokens[i]!;
    return marks.find((m) => token.start < m.end && token.end > m.start);
  };
  const selection = ctx.selection?.targetId === targetId ? ctx.selection : null;
  const lo = selection === null ? -1 : Math.min(selection.anchor, selection.focus);
  const hi = selection === null ? -1 : Math.max(selection.anchor, selection.focus);

  const select = (anchor: number, focus: number) => {
    const a = Math.min(anchor, focus);
    const b = Math.max(anchor, focus);
    ctx.setSelection({ targetId, anchor, focus });
    ctx.registerRange({ start: tokens[a]!.start, end: tokens[b]!.end });
  };

  const tapWord = (i: number) => {
    const mark = markAt(i);
    if (mark !== undefined) {
      ctx.setSelection(null);
      ctx.onOpenFlag(mark.flagId);
      return;
    }
    if (selection === null) return select(i, i);
    if (selection.anchor === i && selection.focus === i) return ctx.setSelection(null);
    // Extending across an existing highlight would overlap it: start afresh instead.
    const a = Math.min(selection.anchor, i);
    const b = Math.max(selection.anchor, i);
    for (let k = a; k <= b; k++) if (markAt(k) !== undefined) return select(i, i);
    select(selection.anchor, i);
  };

  const words = tokens.flatMap((token, i) => (token.word ? [i] : []));
  const onKeyDown = (e: KeyboardEvent) => {
    if (words.length === 0) return;
    if (e.key === "Escape") return ctx.setSelection(null);
    if (e.key === "Enter" && selection !== null) {
      e.preventDefault();
      const mark = markAt(selection.focus);
      if (mark !== undefined) return ctx.onOpenFlag(mark.flagId);
      ctx.onFlagRange(targetId, tokens[lo]!.start, tokens[hi]!.end);
      return ctx.setSelection(null);
    }
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const current = selection === null ? -1 : words.indexOf(selection.focus);
    const nextPos =
      current === -1
        ? 0
        : Math.min(words.length - 1, Math.max(0, current + (e.key === "ArrowRight" ? 1 : -1)));
    const focus = words[nextPos]!;
    if (e.shiftKey && selection !== null) select(selection.anchor, focus);
    else select(focus, focus);
  };

  return (
    <span
      tabIndex={0}
      role="group"
      aria-label={t("highlight.textAria")}
      onKeyDown={onKeyDown}
      className="whitespace-pre-line select-none focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      {tokens.map((token, i) => {
        const mark = markAt(i);
        const selected = i >= lo && i <= hi;
        const lastOfMark = mark !== undefined && token.end >= mark.end;
        if (!token.word) {
          return (
            <span
              key={i}
              className={cn(
                mark !== undefined && "bg-red-100",
                mark === undefined && selected && i > lo && i < hi && "bg-amber-200",
              )}
            >
              {token.text}
            </span>
          );
        }
        return (
          <span
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              tapWord(i);
            }}
            className={cn(
              "cursor-text rounded-[3px] [box-decoration-break:clone]",
              mark !== undefined &&
                "cursor-pointer bg-red-100 underline decoration-red-500 underline-offset-[3px]",
              selected && "bg-amber-200",
            )}
          >
            {token.text}
            {lastOfMark && (
              <Flag
                className="ml-0.5 inline size-3 -translate-y-px fill-red-500 text-red-600"
                aria-label={t("highlight.flagged")}
              />
            )}
          </span>
        );
      })}
    </span>
  );
}
