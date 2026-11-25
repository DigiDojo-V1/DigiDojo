"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { Flag, Trash2, X } from "lucide-react";
import { useT } from "@/i18n/hooks";
import { cn } from "@/lib/utils";

export interface ChipView {
  value: string;
  label: string;
}

/**
 * "Why is this suspicious?": a bottom sheet next to what the player flagged. It never says
 * whether a reason is right; that waits for the debrief.
 */
export function FlagPopover({
  quote,
  chips,
  chosen,
  note,
  maxNote,
  showNote,
  editing,
  onChoose,
  onNote,
  onSave,
  onCancel,
  onRemove,
}: {
  quote: string;
  /** `null` while the chips load. */
  chips: ChipView[] | null;
  chosen: string | undefined;
  note: string;
  maxNote: number;
  /** Show the "In your own words" box: only when explanations are graded. */
  showNote: boolean;
  /** Editing an existing flag (shows Remove). */
  editing: boolean;
  onChoose: (value: string) => void;
  onNote: (note: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onRemove: () => void;
}) {
  const t = useT();
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label={t("flag.close")}
        onClick={onCancel}
        className="absolute inset-0 bg-black/40"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="flag-popover-title"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.18 }}
        className="relative max-h-[85dvh] w-full max-w-[420px] overflow-y-auto rounded-t-3xl bg-white p-4 pb-6 shadow-2xl"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-300" aria-hidden />
        <div className="flex items-start gap-2">
          <Flag className="mt-1 size-4 shrink-0 fill-red-500 text-red-600" aria-hidden />
          <blockquote className="min-w-0 flex-1 rounded-lg bg-red-50 px-3 py-2 text-sm leading-snug text-slate-900 ring-1 ring-red-200">
            “{quote}”
          </blockquote>
          <button
            type="button"
            onClick={onCancel}
            aria-label={t("flag.close")}
            className="-mt-2 -mr-2 flex size-11 shrink-0 items-center justify-center text-slate-500"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <h2 id="flag-popover-title" className="mt-4 text-base font-semibold text-slate-900">
          {t("flag.why")}
        </h2>
        <div className="mt-2 grid grid-cols-1 gap-2" role="radiogroup" aria-label={t("flag.why")}>
          {chips === null
            ? [0, 1, 2, 3].map((i) => (
                <div key={i} className="h-11 animate-pulse rounded-xl bg-slate-100" aria-hidden />
              ))
            : chips.map((chip) => (
                <button
                  key={chip.value}
                  type="button"
                  role="radio"
                  aria-checked={chosen === chip.value}
                  onClick={() => onChoose(chip.value)}
                  className={cn(
                    "min-h-11 rounded-xl border px-3.5 py-2 text-left text-sm leading-snug transition-colors",
                    chosen === chip.value
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 text-slate-800 hover:bg-slate-50",
                  )}
                >
                  {chip.label}
                </button>
              ))}
        </div>
        {chips === null && <p className="mt-2 text-xs text-slate-500">{t("flag.loadingChips")}</p>}

        {showNote && (
          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-900">{t("flag.noteLabel")}</span>
            <span className="ml-1 text-xs text-slate-500">{t("flag.noteOptional")}</span>
            <textarea
              value={note}
              maxLength={maxNote}
              onChange={(e) => onNote(e.target.value)}
              rows={2}
              autoComplete="off"
              placeholder={t("flag.notePlaceholder")}
              className="mt-1.5 block w-full resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
            />
            <span className="mt-1 flex justify-between text-[11px] text-slate-500">
              <span>{t("flag.notePrivacy")}</span>
              <span className="tabular-nums">
                {note.length}/{maxNote}
              </span>
            </span>
          </label>
        )}

        <div className="mt-4 flex gap-2">
          {editing && (
            <button
              type="button"
              onClick={onRemove}
              className="flex h-11 items-center gap-1.5 rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700"
            >
              <Trash2 className="size-4" aria-hidden /> {t("flag.remove")}
            </button>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={chosen === undefined}
            className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-600 text-sm font-semibold text-white disabled:bg-slate-300"
          >
            <Flag className="size-4" aria-hidden /> {editing ? t("flag.update") : t("flag.save")}
          </button>
        </div>
        {/* Always takes its space, so the buttons don't jump when a reason is picked. */}
        <p
          className={cn(
            "mt-2 text-center text-xs text-slate-500",
            (chosen !== undefined || chips === null) && "invisible",
          )}
          aria-hidden={chosen !== undefined}
        >
          {t("flag.pickReason")}
        </p>
      </motion.div>
    </div>
  );
}
