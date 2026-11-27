"use client";

import { createContext, useContext, useMemo, type KeyboardEvent, type ReactNode } from "react";
import { Flag } from "lucide-react";
import { splitSentences } from "@/engine/highlight";
import { useT } from "@/i18n/hooks";
import { cn } from "@/lib/utils";

/** A flagged sentence, as the shells draw it. */
export interface HighlightMark {
  flagId: string;
  start: number;
  end: number;
}

interface HighlightContextValue {
  marksFor: (targetId: string) => HighlightMark[];
  /** The player tapped a sentence: open the reason popup for it. */
  onFlagRange: (targetId: string, start: number, end: number) => void;
  /** The player tapped a sentence they already flagged. */
  onOpenFlag: (flagId: string) => void;
}

const HighlightContext = createContext<HighlightContextValue | null>(null);

/**
 * Makes every `HighlightableText` inside it flaggable sentence by sentence. Without a provider,
 * texts render as plain text.
 */
export function HighlightProvider({
  marksFor,
  onFlagRange,
  onOpenFlag,
  children,
}: HighlightContextValue & { children: ReactNode }) {
  const value = useMemo(
    () => ({ marksFor, onFlagRange, onOpenFlag }),
    [marksFor, onFlagRange, onOpenFlag],
  );
  return <HighlightContext.Provider value={value}>{children}</HighlightContext.Provider>;
}

/**
 * Text the player flags one sentence at a time. Every sentence turns red on hover and opens the
 * reason popup on click or tap, so nothing hints at where the red flags are. A flagged sentence
 * stays red; tapping it reopens its flag.
 */
export function HighlightableText({ targetId, text }: { targetId: string; text: string }) {
  const ctx = useContext(HighlightContext);
  const t = useT();
  const sentences = useMemo(() => splitSentences(text), [text]);

  if (ctx === null) return <span className="whitespace-pre-line">{text}</span>;
  const marks = ctx.marksFor(targetId);

  const parts: ReactNode[] = [];
  let offset = 0;
  sentences.forEach((s, i) => {
    if (s.start > offset) parts.push(text.slice(offset, s.start));
    offset = s.end;
    const mark = marks.find((m) => m.start === s.start && m.end === s.end);
    const activate = () =>
      mark === undefined ? ctx.onFlagRange(targetId, s.start, s.end) : ctx.onOpenFlag(mark.flagId);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      activate();
    };
    parts.push(
      <span
        key={i}
        role="button"
        tabIndex={0}
        aria-label={mark === undefined ? t("highlight.flagSentence") : t("highlight.openFlag")}
        onClick={(e) => {
          e.stopPropagation();
          activate();
        }}
        onKeyDown={onKeyDown}
        className={cn(
          "cursor-pointer rounded-[3px] [box-decoration-break:clone] transition-colors",
          "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-red-500",
          mark === undefined
            ? // Tailwind v4 applies hover: only on devices that can hover; a tap flashes active:.
              "underline-offset-[3px] hover:bg-red-100 hover:underline hover:decoration-red-400 active:bg-red-200"
            : "bg-red-100 underline decoration-red-500 underline-offset-[3px]",
        )}
      >
        {text.slice(s.start, s.end)}
        {mark !== undefined && (
          <Flag
            className="ml-0.5 inline size-3 -translate-y-px fill-red-500 text-red-600"
            aria-hidden
          />
        )}
      </span>,
    );
  });
  if (offset < text.length) parts.push(text.slice(offset));

  return <span className="whitespace-pre-line">{parts}</span>;
}
