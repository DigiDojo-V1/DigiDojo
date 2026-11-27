"use client";

import { ChevronLeft, Star } from "lucide-react";
import type { TriageLabel } from "@/engine/schema";
import { useT } from "@/i18n/hooks";
import { cn } from "@/lib/utils";
import { MailAvatar } from "./MailShell";
import { useInDojoPanel } from "./panel-slot";

export interface InboxRow {
  id: string;
  displayName: string;
  shortAddress: string;
  subject: string;
  preview: string;
  date: string;
  label?: TriageLabel;
  /** Opened already: drawn as read (not bold). */
  opened?: boolean;
}

const LABEL_STYLE: Record<TriageLabel, string> = {
  legit: "bg-emerald-100 text-emerald-900 ring-emerald-200",
  scam: "bg-red-100 text-red-900 ring-red-200",
  "needs-checking": "bg-amber-100 text-amber-900 ring-amber-200",
};

/** The inbox list. Tapping a row opens it; the chosen label shows as a chip under the preview. */
export function InboxList({ rows, onOpen }: { rows: InboxRow[]; onOpen: (id: string) => void }) {
  const t = useT();
  const desktop = useInDojoPanel();
  if (desktop) return <DenseInboxList rows={rows} onOpen={onOpen} />;
  return (
    <ul className="pb-32">
      {rows.map((row) => {
        const unread = row.opened !== true;
        return (
          <li key={row.id}>
            <button
              type="button"
              onClick={() => onOpen(row.id)}
              className="flex min-h-16 w-full gap-3 px-4 py-3 text-left hover:bg-slate-50 active:bg-slate-100"
            >
              <MailAvatar name={row.displayName} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-[15px]",
                      unread ? "font-bold text-slate-900" : "text-slate-700",
                    )}
                  >
                    {row.displayName}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-xs",
                      unread ? "font-bold text-slate-900" : "text-slate-500",
                    )}
                  >
                    {row.date}
                  </span>
                </span>
                <span className="truncate text-xs text-slate-500">{row.shortAddress}</span>
                <span className="flex items-start gap-2">
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block truncate text-sm",
                        unread ? "font-bold text-slate-900" : "text-slate-700",
                      )}
                    >
                      {row.subject}
                    </span>
                    <span className="line-clamp-2 text-sm text-slate-500">{row.preview}</span>
                  </span>
                  <Star className="mt-1 size-5 shrink-0 text-slate-400" aria-hidden />
                </span>
                <span
                  className={cn(
                    "mt-1.5 self-start rounded-md px-2 py-0.5 text-xs font-medium ring-1",
                    row.label === undefined
                      ? "bg-slate-50 text-slate-500 ring-slate-200"
                      : LABEL_STYLE[row.label],
                  )}
                >
                  {row.label === undefined ? t("triage.unlabelled") : t(`triage.${row.label}`)}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Desktop webmail rows: one line each, sender | subject - preview | label | date. */
function DenseInboxList({ rows, onOpen }: { rows: InboxRow[]; onOpen: (id: string) => void }) {
  const t = useT();
  return (
    <ul>
      {rows.map((row) => {
        const unread = row.opened !== true;
        return (
          <li key={row.id}>
            <button
              type="button"
              onClick={() => onOpen(row.id)}
              className={cn(
                "relative flex h-10 w-full items-center gap-3 border-b border-[#f1f3f4] px-4 text-left text-sm text-[#1f1f1f] hover:z-10 hover:shadow-[inset_1px_0_0_#dadce0,inset_-1px_0_0_#dadce0,0_1px_2px_0_rgba(60,64,67,.3),0_1px_3px_1px_rgba(60,64,67,.15)]",
                unread ? "bg-white" : "bg-[#f2f6fc]",
              )}
            >
              <span
                aria-hidden
                className="size-[18px] shrink-0 rounded-sm border-2 border-[#c4c7c5]"
              />
              <Star aria-hidden className="size-[18px] shrink-0 text-[#c4c7c5]" />
              <span className={cn("w-[180px] shrink-0 truncate", unread && "font-bold")}>
                {row.displayName}
              </span>
              <span className="min-w-0 flex-1 truncate">
                <span className={cn(unread && "font-bold")}>{row.subject}</span>
                <span className="text-[#5f6368]"> - {row.preview}</span>
              </span>
              <span
                className={cn(
                  "shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ring-1",
                  row.label === undefined
                    ? "bg-slate-50 text-slate-500 ring-slate-200"
                    : LABEL_STYLE[row.label],
                )}
              >
                {row.label === undefined ? t("triage.unlabelled") : t(`triage.${row.label}`)}
              </span>
              <span
                className={cn(
                  "shrink-0 text-right text-xs whitespace-nowrap",
                  unread && "font-bold",
                )}
              >
                {row.date}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

const LABEL_ACTIVE: Record<TriageLabel, string> = {
  legit: "border-emerald-700 bg-emerald-700 text-white",
  scam: "border-red-700 bg-red-700 text-white",
  "needs-checking": "border-amber-600 bg-amber-600 text-white",
};

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
    <div className="sticky bottom-0 z-30 space-y-2 border-t border-slate-200 bg-white/95 p-3 backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
      <p className="text-xs font-medium text-slate-500">{t("triage.prompt")}</p>
      <div className="grid grid-cols-3 gap-2">
        {labels.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => onChoose(label)}
            aria-pressed={value === label}
            className={cn(
              "min-h-11 rounded-full border border-slate-300 px-2 py-2 text-sm font-medium text-slate-800",
              value === label && LABEL_ACTIVE[label],
            )}
          >
            {t(`triage.${label}`)}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onBack}
        className="flex min-h-11 items-center gap-1 text-sm font-medium text-indigo-700"
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
