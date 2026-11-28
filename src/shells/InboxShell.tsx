"use client";

import { Archive, ChevronLeft, Clock, MailOpen, Star, Trash2 } from "lucide-react";
import type { TriageLabel } from "@/engine/schema";
import { useT } from "@/i18n/hooks";
import { cn } from "@/lib/utils";
import { FileTypeIcon, fileKind, shortMailDate } from "./gmail/brand";
import { MailAvatar } from "./MailShell";
import { useInDojoPanel } from "./panel-slot";

export interface InboxRow {
  id: string;
  displayName: string;
  subject: string;
  preview: string;
  date: string;
  /** Attachment names as the email shows them, drawn as chips under the row. */
  attachments?: { id: string; name: string }[];
  label?: TriageLabel;
  /** Opened already: drawn as read (not bold). */
  opened?: boolean;
}

/** Gmail label colours (background and text) for the player's triage labels. */
const LABEL_STYLE: Record<TriageLabel, string> = {
  legit: "bg-[#b9e4d0] text-[#0b4f30]",
  scam: "bg-[#f2b2a8] text-[#8a1c0a]",
  "needs-checking": "bg-[#ffe6c7] text-[#7a4706]",
};

/** A Gmail label chip showing the player's triage label for an email. */
export function TriageLabelChip({ label, className }: { label: TriageLabel; className?: string }) {
  const t = useT();
  return (
    <span
      className={cn(
        "inline-block shrink-0 rounded-[4px] px-1.5 text-xs leading-5 font-medium whitespace-nowrap",
        LABEL_STYLE[label],
        className,
      )}
    >
      {t(`triage.${label}`)}
    </span>
  );
}

/** An attachment chip under a list row: type icon and name in a rounded outline. */
function AttachmentChip({ name }: { name: string }) {
  return (
    <span className="flex h-8 max-w-[200px] min-w-0 items-center gap-2 rounded-full border border-[#dadce0] bg-white pr-3 pl-2 text-[13px] font-medium text-[#444746]">
      <FileTypeIcon kind={fileKind(name)} />
      <span className="truncate">{name}</span>
    </span>
  );
}

/** The inbox list. Tapping a row opens it; the chosen label shows as a Gmail label chip. */
export function InboxList({ rows, onOpen }: { rows: InboxRow[]; onOpen: (id: string) => void }) {
  const desktop = useInDojoPanel();
  if (desktop) return <DenseInboxList rows={rows} onOpen={onOpen} />;
  return (
    <ul className="pb-32">
      {rows.map((row) => {
        const unread = row.opened !== true;
        const chips = row.label !== undefined || (row.attachments?.length ?? 0) > 0;
        return (
          <li key={row.id}>
            <button
              type="button"
              onClick={() => onOpen(row.id)}
              className="flex min-h-16 w-full gap-4 px-4 py-3 text-left hover:bg-black/[0.03] active:bg-black/5"
            >
              <MailAvatar name={row.displayName} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-base",
                      unread ? "font-bold text-[#1f1f1f]" : "text-[#444746]",
                    )}
                  >
                    {row.displayName}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-xs",
                      unread ? "font-bold text-[#1f1f1f]" : "text-[#444746]",
                    )}
                  >
                    {shortMailDate(row.date)}
                  </span>
                </span>
                <span
                  className={cn(
                    "truncate text-sm",
                    unread ? "font-bold text-[#1f1f1f]" : "text-[#444746]",
                  )}
                >
                  {row.subject}
                </span>
                <span className="flex items-start gap-3">
                  <span className="min-w-0 flex-1 truncate text-sm text-[#444746]">
                    {row.preview}
                  </span>
                  <Star className="-mt-0.5 size-5 shrink-0 text-[#444746]" aria-hidden />
                </span>
                {chips && (
                  <span className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
                    {row.label !== undefined && <TriageLabelChip label={row.label} />}
                    {row.attachments?.map((a) => (
                      <AttachmentChip key={a.id} name={a.name} />
                    ))}
                  </span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Gmail on the web: one line per email, sender | label, subject - snippet | date. */
function DenseInboxList({ rows, onOpen }: { rows: InboxRow[]; onOpen: (id: string) => void }) {
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
                "group relative flex w-full flex-col text-left text-sm text-[#1f1f1f] shadow-[inset_0_-1px_0_0_rgba(100,121,143,0.12)] hover:z-10 hover:shadow-[inset_1px_0_0_#dadce0,inset_-1px_0_0_#dadce0,0_1px_2px_0_rgba(60,64,67,.3),0_1px_3px_1px_rgba(60,64,67,.15)]",
                unread ? "bg-white" : "bg-[#f2f6fc]",
              )}
            >
              <span className="flex h-10 w-full items-center pr-4 pl-3">
                <span aria-hidden className="flex w-8 shrink-0 justify-center">
                  <span className="size-[18px] rounded-[3px] border-2 border-[#c4c7c5] group-hover:border-[#444746]" />
                </span>
                <span aria-hidden className="flex w-8 shrink-0 justify-center">
                  <Star className="size-5 text-[#c4c7c5] group-hover:text-[#444746]" />
                </span>
                <span
                  className={cn("w-[200px] shrink-0 truncate pr-8 pl-2", unread && "font-bold")}
                >
                  {row.displayName}
                </span>
                <span className="flex min-w-0 flex-1 items-center gap-1">
                  {row.label !== undefined && <TriageLabelChip label={row.label} />}
                  <span className="min-w-0 flex-1 truncate">
                    <span className={cn(unread && "font-bold")}>{row.subject}</span>
                    <span className="text-[#5f6368]"> - {row.preview}</span>
                  </span>
                </span>
                <span
                  className={cn(
                    "w-[72px] shrink-0 pl-2.5 text-right text-xs whitespace-nowrap group-hover:hidden",
                    unread ? "font-bold" : "text-[#5f6368]",
                  )}
                >
                  {shortMailDate(row.date)}
                </span>
                <span
                  aria-hidden
                  className="hidden shrink-0 items-center text-[#444746] group-hover:flex"
                >
                  {[Archive, Trash2, MailOpen, Clock].map((Icon, i) => (
                    <span key={i} className="flex size-10 items-center justify-center">
                      <Icon className="size-5" />
                    </span>
                  ))}
                </span>
              </span>
              {(row.attachments?.length ?? 0) > 0 && (
                <span className="-mt-1 flex gap-2 pr-4 pb-2 pl-[276px]">
                  {row.attachments!.map((a) => (
                    <AttachmentChip key={a.id} name={a.name} />
                  ))}
                </span>
              )}
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
