"use client";

import { ArrowLeft, FileText, X } from "lucide-react";
import { MotionConfig, motion } from "motion/react";
import { useT } from "@/i18n/hooks";
import { cn } from "@/lib/utils";
import { PanelBody } from "./evidence/PanelViews";
import { SimulationBar } from "./SimulationBar";
import type { FlagProps, PanelView } from "./types";

/**
 * A full-screen overlay showing a profile, company page, official record, web page or PDF.
 * Every field is flaggable.
 */
export function EvidenceSheet({
  panel,
  onClose,
  ...flag
}: FlagProps & { panel: PanelView; onClose: () => void }) {
  const t = useT();
  const isDocument = panel.kind === "document";
  const kindLabel =
    panel.variant === "official-record"
      ? t("evidence.open.record")
      : t(`evidence.kind.${panel.kind}`);

  return (
    <MotionConfig reducedMotion="user">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={panel.title}
        className="fixed inset-0 z-50 flex justify-center bg-black/40"
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "flex w-full max-w-[420px] flex-col overflow-y-auto",
            isDocument ? "bg-neutral-600" : "bg-slate-100",
          )}
        >
          <div className="sticky top-0 z-10">
            <SimulationBar />
            <header
              className={cn(
                "flex h-14 items-center gap-1 px-1",
                isDocument
                  ? "bg-neutral-800 text-white"
                  : "border-b border-slate-200 bg-white text-slate-900",
              )}
            >
              <button
                type="button"
                onClick={onClose}
                aria-label={t("evidence.close")}
                className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-black/10"
              >
                {isDocument ? <X className="size-5" /> : <ArrowLeft className="size-5" />}
              </button>
              {isDocument && <FileText className="size-5 shrink-0 text-red-300" aria-hidden />}
              <div className="min-w-0 flex-1 px-1 leading-tight">
                <h2 className="truncate text-[15px] font-semibold">{panel.title}</h2>
                <p
                  className={cn(
                    "truncate text-xs",
                    isDocument ? "text-neutral-300" : "text-slate-500",
                  )}
                >
                  {isDocument
                    ? (panel.subtitle ?? t("evidence.pdf.pages")(panel.sections.length))
                    : kindLabel}
                </p>
              </div>
            </header>
            <p
              className={cn(
                "px-4 py-1.5 text-xs",
                isDocument ? "bg-neutral-700 text-neutral-200" : "bg-white/90 text-slate-500",
              )}
            >
              {t("evidence.hint")}
            </p>
          </div>
          <PanelBody panel={panel} {...flag} />
        </motion.div>
      </div>
    </MotionConfig>
  );
}
