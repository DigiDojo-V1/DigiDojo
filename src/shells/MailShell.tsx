"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronDown, ChevronLeft, ChevronUp, Flag, Globe, Paperclip } from "lucide-react";
import { useT } from "@/i18n/hooks";
import { cn } from "@/lib/utils";
import { SegmentButton } from "./ChatShell";
import { SimulationBar } from "./SimulationBar";
import type { FlagProps, MailView } from "./types";

/**
 * Bare-bones fake mail app. Our own look, not a copy of any real mail app.
 * Nothing here opens a real link: destinations are only ever shown as text.
 */
export function MailShell({
  title,
  backHref,
  hint,
  toolbar,
  footer,
  children,
}: {
  /** Header text, e.g. "Inbox". */
  title: string;
  backHref: string;
  hint?: string;
  toolbar?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const t = useT();
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <div className="sticky top-0 z-40 bg-white">
        <SimulationBar />
        <header className="flex h-12 items-center gap-2 border-b px-2">
          <Link
            href={backHref}
            aria-label={t("nav.back")}
            className="rounded-full p-1.5 hover:bg-neutral-100"
          >
            <ChevronLeft className="size-5" />
          </Link>
          <span className="font-medium">{title}</span>
        </header>
        {toolbar}
      </div>
      {hint !== undefined && (
        <p className="mx-auto mt-3 flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-1 text-xs text-neutral-600">
          <Flag className="size-3" aria-hidden /> {hint}
        </p>
      )}
      <div className="flex-1">{children}</div>
      {footer}
    </div>
  );
}

/** A small flag toggle next to an inspected detail. The tap area is 44 px; the icon stays small. */
export function FlagToggle({
  id,
  label,
  flaggedIds,
  onToggleFlag,
  className,
}: FlagProps & { id: string; label: string; className?: string }) {
  const t = useT();
  const flagged = flaggedIds.includes(id);
  return (
    <button
      type="button"
      onClick={() => onToggleFlag(id)}
      aria-pressed={flagged}
      aria-label={t(flagged ? "chat.unflagAria" : "chat.flagAria")(label)}
      className={cn("group -my-2 flex size-11 shrink-0 items-center justify-center", className)}
    >
      <span
        className={cn(
          "rounded-full p-1.5 transition-colors",
          flagged
            ? "bg-red-500 text-white"
            : "text-neutral-400 group-hover:bg-neutral-100 group-hover:text-neutral-600",
        )}
      >
        <Flag className="size-3.5" aria-hidden />
      </span>
    </button>
  );
}

/** A labelled, flaggable line such as "Reply-To: x@y". */
function DetailRow({
  id,
  label,
  value,
  ...flag
}: FlagProps & { id: string; label: string; value: string }) {
  const flagged = flag.flaggedIds.includes(id);
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded px-1 text-sm",
        flagged && "bg-red-50 ring-1 ring-red-300",
      )}
    >
      <span className="w-16 shrink-0 text-neutral-500">{label}</span>
      <span className="min-w-0 flex-1 font-mono text-[13px] break-all">{value}</span>
      <FlagToggle id={id} label={`${label} ${value}`} {...flag} />
    </div>
  );
}

/**
 * The reading pane: sender, details, body, links and attachments. What the player has
 * revealed comes from `seenIds`, so it stays open across re-renders and rewinds.
 */
export function MailBody({
  mail,
  seenIds,
  onReveal,
  onOpenPanel,
  ...flag
}: FlagProps & {
  mail: MailView;
  seenIds: readonly string[];
  onReveal: (ids: string[]) => void;
  onOpenPanel: (panelId: string) => void;
}) {
  const t = useT();
  const detailIds = [mail.from.id, ...(mail.replyTo ? [mail.replyTo.id] : []), mail.to.id];
  const detailsOpen = detailIds.every((id) => seenIds.includes(id));

  return (
    <article className="space-y-4 p-4">
      <h1 className="text-lg leading-snug font-semibold">{mail.subject}</h1>

      <div className="space-y-1">
        <button
          type="button"
          className="flex w-full items-center gap-2 text-left"
          onClick={() => onReveal(detailIds)}
          aria-expanded={detailsOpen}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold">
            {mail.displayName.trim().charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">{mail.displayName}</span>
            <span className="block text-xs text-neutral-500">
              {mail.date} · {t("mail.toMe")}
            </span>
          </span>
          {detailsOpen ? (
            <ChevronUp className="size-4 text-neutral-400" />
          ) : (
            <ChevronDown className="size-4 text-neutral-400" />
          )}
        </button>
        {mail.showFromAddress && !detailsOpen && (
          <DetailRow id={mail.from.id} label={t("mail.from")} value={mail.from.address} {...flag} />
        )}
        {!detailsOpen && <p className="text-xs text-neutral-500">{t("mail.tapSender")}</p>}
        {detailsOpen && (
          <div className="space-y-1 rounded-lg border bg-neutral-50 p-2">
            <DetailRow
              id={mail.from.id}
              label={t("mail.from")}
              value={mail.from.address}
              {...flag}
            />
            {mail.replyTo !== undefined && (
              <DetailRow
                id={mail.replyTo.id}
                label={t("mail.replyTo")}
                value={mail.replyTo.address}
                {...flag}
              />
            )}
            <DetailRow id={mail.to.id} label={t("mail.to")} value={mail.to.address} {...flag} />
          </div>
        )}
      </div>

      <div className="space-y-3 text-[15px] leading-relaxed">
        {mail.body.map((paragraph, p) => (
          <p key={p} className="whitespace-pre-line">
            {paragraph.map((segment, i) =>
              segment.flaggable && segment.id !== undefined ? (
                <SegmentButton
                  key={segment.id}
                  id={segment.id}
                  text={segment.text}
                  flagged={flag.flaggedIds.includes(segment.id)}
                  onToggleFlag={flag.onToggleFlag}
                />
              ) : (
                <span key={i}>{segment.text}</span>
              ),
            )}
          </p>
        ))}
      </div>

      {mail.links.map((link) => {
        const inspected = seenIds.includes(link.id);
        return (
          <div key={link.id} className="space-y-1">
            {/* Inert on purpose: a button, never an <a href>. */}
            <button
              type="button"
              onClick={() => onReveal([link.id])}
              className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white"
            >
              {link.text}
            </button>
            {inspected ? (
              <div className="flex items-center gap-2 rounded-md border bg-neutral-50 px-2 py-1">
                <Globe className="size-3.5 shrink-0 text-neutral-500" />
                <span className="min-w-0 flex-1 font-mono text-xs break-all">{link.actualUrl}</span>
                <FlagToggle id={link.id} label={link.actualUrl} {...flag} />
              </div>
            ) : (
              <p className="text-xs text-neutral-500">{t("mail.inspectLinkHint")}</p>
            )}
          </div>
        );
      })}

      {mail.attachments.length > 0 && (
        <div className="space-y-2">
          {mail.attachments.map((a) => {
            const inspected = seenIds.includes(a.id);
            return (
              <div key={a.id} className="rounded-lg border p-2">
                <button
                  type="button"
                  onClick={() => onReveal([a.id])}
                  className="flex w-full items-center gap-2 text-left text-sm"
                >
                  <Paperclip className="size-4 shrink-0 text-neutral-500" />
                  <span className="min-w-0 flex-1 truncate">{a.shownName}</span>
                  {a.sizeLabel !== undefined && (
                    <span className="text-xs text-neutral-500">{a.sizeLabel}</span>
                  )}
                </button>
                {inspected && (
                  <div className="mt-2 space-y-1 border-t pt-2">
                    <DetailRow id={a.id} label={t("mail.fileName")} value={a.fullName} {...flag} />
                    <p className="px-1 text-sm">
                      <span className="text-neutral-500">{t("mail.fileType")} </span>
                      {a.actualType}
                    </p>
                    {a.documentId !== undefined && (
                      <button
                        type="button"
                        onClick={() => onOpenPanel(a.documentId!)}
                        className="px-1 text-sm font-medium text-blue-700 underline"
                      >
                        {t("mail.openDocument")}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}
