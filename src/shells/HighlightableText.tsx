"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { Flag, X } from "lucide-react";
import { snapToWords, tokenize } from "@/engine/highlight";
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

  const clear = () => {
    setSelection(null);
    clearNativeSelection();
  };

  const confirm = () => {
    if (selection === null || range === null) return;
    onFlagRange(selection.targetId, range.start, range.end);
    clear();
  };

  // Click-and-drag (or long-press on a phone) selects text the usual way. The selection is
  // widened to whole words and becomes the one the "Flag this" bar acts on.
  useEffect(() => {
    const onSelectionChange = () => {
      const native = document.getSelection();
      if (native === null || native.isCollapsed || native.rangeCount === 0) return;
      const r = native.getRangeAt(0);
      const container = targetElement(r.commonAncestorContainer);
      if (container === null) return;
      const targetId = container.dataset.highlightTarget;
      if (targetId === undefined) return;
      const start = textOffset(container, r.startContainer, r.startOffset);
      const end = textOffset(container, r.endContainer, r.endOffset);
      const tokens = tokenize(container.textContent ?? "");
      const words = snapToWords(tokens, start, end);
      if (words === undefined) return;
      const from = tokens[words.first]!.start;
      const to = tokens[words.last]!.end;
      // Never overlap a flag the player already made.
      if (marksFor(targetId).some((m) => from < m.end && to > m.start)) return;
      setSelection({ targetId, anchor: words.first, focus: words.last });
      registerRange({ start: from, end: to });
    };
    document.addEventListener("selectionchange", onSelectionChange);
    return () => document.removeEventListener("selectionchange", onSelectionChange);
  }, [marksFor]);

  // Tapping or clicking anywhere outside the texts and the "Flag this" bar drops the selection,
  // like tapping away from selected text in any app.
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const el = e.target instanceof Element ? e.target : null;
      if (el?.closest("[data-highlight-target], [data-highlight-bar]")) return;
      setSelection(null);
      clearNativeSelectionInTargets();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  // Escape drops a selection in progress, wherever focus is. Registered once: a listener
  // tied to `selection` would be removed mid-event when the text's own Escape handler runs.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setSelection(null);
      clearNativeSelectionInTargets();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
            data-highlight-bar
            aria-label={t("highlight.toolbar")}
          >
            <p className="min-w-0 flex-1 text-xs leading-snug text-slate-300">
              {t("highlight.extendHint")}
            </p>
            <button
              type="button"
              onClick={clear}
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

function clearNativeSelection() {
  document.getSelection()?.removeAllRanges();
}

/** Clears the browser's selection only if it sits inside a highlightable text. */
function clearNativeSelectionInTargets() {
  const native = document.getSelection();
  if (native === null || native.rangeCount === 0) return;
  if (targetElement(native.getRangeAt(0).commonAncestorContainer) !== null)
    native.removeAllRanges();
}

/** True while the player has text selected the usual way (drag or long-press). */
function hasNativeSelection(): boolean {
  const native = document.getSelection();
  return native !== null && !native.isCollapsed;
}

/** The highlightable text a DOM node sits in, if any. */
function targetElement(node: Node): HTMLElement | null {
  const element = node instanceof HTMLElement ? node : node.parentElement;
  return element?.closest<HTMLElement>("[data-highlight-target]") ?? null;
}

/** Character offset of a DOM position from the start of `container`'s text. */
function textOffset(container: HTMLElement, node: Node, offset: number): number {
  const r = document.createRange();
  r.setStart(container, 0);
  r.setEnd(node, offset);
  return r.toString().length;
}

/**
 * Text the player can highlight word by word. Nothing in it looks tappable: red flags are
 * hidden, so the player has to find them. Select words by click-and-drag (long-press on a
 * phone), or tap a word and tap another to extend; then "Flag this". Tapping a flagged
 * highlight reopens it.
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
      data-highlight-target={targetId}
      className="whitespace-pre-line select-text selection:bg-amber-200 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
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
              // A drag that ends on a word also fires a click: the drag's selection wins.
              if (hasNativeSelection()) return;
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
