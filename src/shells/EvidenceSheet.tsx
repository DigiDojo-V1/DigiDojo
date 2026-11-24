"use client";

import { X } from "lucide-react";
import { useT } from "@/i18n/hooks";
import { cn } from "@/lib/utils";
import { FlagToggle } from "./MailShell";
import { SimulationBadge } from "./SimulationBadge";
import type { FlagProps, PanelView } from "./types";

/** A full-screen overlay showing a profile, company page, web page or PDF. Every field is flaggable. */
export function EvidenceSheet({
  panel,
  onClose,
  ...flag
}: FlagProps & { panel: PanelView; onClose: () => void }) {
  const t = useT();
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={panel.title}
      className="fixed inset-0 z-50 flex justify-center bg-black/40"
    >
      <div className="flex w-full max-w-[420px] flex-col overflow-y-auto bg-white">
        <header className="sticky top-0 z-10 flex items-center gap-2 border-b bg-white px-3 py-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-neutral-500 uppercase">{t(`evidence.kind.${panel.kind}`)}</p>
            <h2 className="truncate font-semibold">{panel.title}</h2>
            {panel.subtitle !== undefined && (
              <p className="truncate text-sm text-neutral-600">{panel.subtitle}</p>
            )}
          </div>
          <SimulationBadge />
          <button
            type="button"
            onClick={onClose}
            aria-label={t("evidence.close")}
            className="rounded-full p-1.5 hover:bg-neutral-100"
          >
            <X className="size-5" />
          </button>
        </header>
        <p className="px-4 pt-3 text-xs text-neutral-500">{t("evidence.hint")}</p>
        <div className="space-y-4 p-4">
          {panel.sections.map((section, i) => (
            <section key={i} className="space-y-1.5">
              {section.heading !== undefined && (
                <h3 className="text-sm font-semibold">{section.heading}</h3>
              )}
              {section.fields.map((field) => {
                const flagged = flag.flaggedIds.includes(field.id);
                return (
                  <div
                    key={field.id}
                    className={cn(
                      "flex items-start gap-2 rounded px-1 py-0.5",
                      flagged && "bg-red-50 ring-1 ring-red-300",
                    )}
                  >
                    <div
                      className={cn("min-w-0 flex-1", field.finePrint ? "text-[11px]" : "text-sm")}
                    >
                      {field.label !== undefined && (
                        <span className="block text-xs text-neutral-500">{field.label}</span>
                      )}
                      <span className="whitespace-pre-line">{field.value}</span>
                    </div>
                    <FlagToggle
                      id={field.id}
                      label={
                        field.label === undefined ? field.value : `${field.label}: ${field.value}`
                      }
                      {...flag}
                    />
                  </div>
                );
              })}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
