"use client";

import { ChevronLeft } from "lucide-react";
import type { TriageLabel } from "@/engine/schema";
import { useT } from "@/i18n/hooks";
import { cn } from "@/lib/utils";

export interface InboxRow {
  id: string;
  displayName: string;
  shortAddress: string;
  subject: string;
  preview: string;
  date: string;
  label?: TriageLabel;
}

/** The inbox list. Tapping a row opens it; the chosen label shows on the right. */
export function InboxList({ rows, onOpen }: { rows: InboxRow[]; onOpen: (id: string) => void }) {
  const t = useT();
  return (
    <ul className="divide-y">
      {rows.map((row) => (
        <li key={row.id}>
          <button
            type="button"
            onClick={() => onOpen(row.id)}
            className="flex w-full flex-col gap-0.5 px-4 py-3 text-left hover:bg-neutral-50"
          >
            <span className="flex items-baseline gap-2">
              <span className="min-w-0 flex-1 truncate font-medium">{row.displayName}</span>
              <span className="shrink-0 text-xs text-neutral-500">{row.date}</span>
            </span>
            <span className="truncate text-xs text-neutral-500">{row.shortAddress}</span>
            <span className="truncate text-sm">{row.subject}</span>
            <span className="truncate text-sm text-neutral-500">{row.preview}</span>
            <span
              className={cn(
                "mt-1 self-start rounded-full px-2 py-0.5 text-xs",
                row.label === undefined
                  ? "bg-neutral-100 text-neutral-500"
                  : "bg-blue-100 text-blue-900",
              )}
            >
              {row.label === undefined ? t("triage.unlabelled") : t(`triage.${row.label}`)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Legit / Scam / Needs checking buttons under an open email. */
export function TriageLabelBar({
  value,
  onChoose,
  onBack,
}: {
  value: TriageLabel | undefined;
  onChoose: (label: TriageLabel) => void;
  onBack: () => void;
}) {
  const t = useT();
  const labels: TriageLabel[] = ["legit", "scam", "needs-checking"];
  return (
    <div className="sticky bottom-0 z-30 space-y-2 border-t bg-white/95 p-3 backdrop-blur">
      <p className="text-xs font-medium text-muted-foreground">{t("triage.prompt")}</p>
      <div className="grid grid-cols-3 gap-2">
        {labels.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => onChoose(label)}
            aria-pressed={value === label}
            className={cn(
              "rounded-md border px-2 py-2 text-sm",
              value === label && "border-blue-700 bg-blue-700 text-white",
            )}
          >
            {t(`triage.${label}`)}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-blue-700"
      >
        <ChevronLeft className="size-4" /> {t("triage.backToInbox")}
      </button>
    </div>
  );
}

/** Shortens an address for the inbox list, keeping the domain: "nisha...@onboard-hr.example". */
export function shortAddress(address: string): string {
  const at = address.lastIndexOf("@");
  if (at === -1) return address;
  const local = address.slice(0, at);
  const host = address.slice(at + 1);
  const parts = host.split(".");
  const domain = parts.length > 2 ? parts.slice(-2).join(".") : host;
  return `${local.length > 8 ? `${local.slice(0, 5)}...` : local}@${domain}`;
}
