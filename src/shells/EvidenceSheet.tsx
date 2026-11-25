"use client";

import { ArrowLeft } from "lucide-react";
import { MotionConfig, motion } from "motion/react";
import { useT } from "@/i18n/hooks";
import { PanelBody } from "./evidence/PanelViews";
import { PdfViewer } from "./evidence/PdfViewer";
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
          className="flex w-full max-w-[420px] flex-col"
        >
          {panel.kind === "document" ? (
            <PdfViewer panel={panel} onClose={onClose} {...flag} />
          ) : (
            <div className="flex h-full flex-col overflow-y-auto bg-slate-100">
              <div className="sticky top-0 z-10">
                <SimulationBar />
                <header className="flex h-14 items-center gap-1 border-b border-slate-200 bg-white px-1 text-slate-900">
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label={t("evidence.close")}
                    className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-black/10"
                  >
                    <ArrowLeft className="size-5" />
                  </button>
                  <div className="min-w-0 flex-1 px-1 leading-tight">
                    <h2 className="truncate text-[15px] font-semibold">{panel.title}</h2>
                    <p className="truncate text-xs text-slate-500">{kindLabel}</p>
                  </div>
                </header>
                <p className="bg-white/90 px-4 py-1.5 text-xs text-slate-500">
                  {t("evidence.hint")}
                </p>
              </div>
              <PanelBody panel={panel} {...flag} />
            </div>
          )}
        </motion.div>
      </div>
    </MotionConfig>
  );
}
