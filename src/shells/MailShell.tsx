"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  Archive,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  EllipsisVertical,
  File,
  FileArchive,
  FileText,
  Flag,
  Image as ImageIcon,
  MailOpen,
  Menu,
  Paperclip,
  Pencil,
  Search,
  SendHorizontal,
  Smartphone,
  Star,
  Trash2,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { MotionConfig } from "motion/react";
import { useT } from "@/i18n/hooks";
import { cn } from "@/lib/utils";
import { HighlightableText } from "./HighlightableText";
import { SimulationBar } from "./SimulationBar";
import type { FlagProps, MailView } from "./types";

/**
 * A fake mail app: the familiar layout of a phone mail client, with our own styling (no real
 * app's logo, colours or typeface). Icons for actions we don't simulate are decorative only.
 * Nothing here opens a real link: destinations are only ever shown as text, in a browser-style
 * status pill at the bottom-left (on hover, focus or tap), the way a desktop browser shows a
 * link's real URL.
 */
export function MailShell({
  title,
  backHref,
  hint,
  toolbar,
  footer,
  children,
  variant = "message",
}: {
  /** Header text, e.g. "Inbox". */
  title: string;
  backHref: string;
  hint?: string;
  toolbar?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  /** "inbox": search bar and list; "message": reading view; "compose": reply composer. */
  variant?: "inbox" | "message" | "compose";
}) {
  const t = useT();
  const [linkStatus, setLinkStatus] = useState<string | null>(null);
  const back = (
    <Link
      href={backHref}
      aria-label={t("nav.back")}
      className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-slate-100"
    >
      <ChevronLeft className="size-5" />
    </Link>
  );

  return (
    <MotionConfig reducedMotion="user">
      <LinkStatusContext.Provider value={setLinkStatus}>
        <div className="flex min-h-dvh flex-col bg-white">
          <div className="sticky top-0 z-40 bg-white">
            <SimulationBar />
            {variant === "inbox" ? (
              <header className="px-2 pt-2 pb-1">
                <div className="flex items-center gap-1">
                  {back}
                  <div
                    aria-hidden
                    className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-full bg-slate-100 px-4 text-[15px] text-slate-500"
                  >
                    <Menu className="size-5 shrink-0" />
                    <span className="flex-1 truncate">{t("mail.search")}</span>
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-700 text-white">
                      <UserRound className="size-4" />
                    </span>
                  </div>
                </div>
                <h1 className="px-3 pt-3 text-xs font-medium tracking-wide text-slate-500 uppercase">
                  {title}
                </h1>
              </header>
            ) : (
              <header className="flex h-14 items-center gap-1 border-b border-slate-200 px-1 text-slate-700">
                {back}
                <span
                  className={cn(
                    "min-w-0 flex-1 truncate",
                    variant === "compose" ? "text-lg font-medium text-slate-900" : "sr-only",
                  )}
                >
                  {title}
                </span>
                <span aria-hidden className="flex items-center gap-5 pr-3">
                  {variant === "compose" ? (
                    <>
                      <Paperclip className="size-5" />
                      <SendHorizontal className="size-5" />
                    </>
                  ) : (
                    <>
                      <Archive className="size-5" />
                      <Trash2 className="size-5" />
                      <MailOpen className="size-5" />
                    </>
                  )}
                  <EllipsisVertical className="size-5" />
                </span>
              </header>
            )}
            {toolbar}
          </div>
          {hint !== undefined && (
            <p className="mx-auto mt-3 flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-1 text-xs text-neutral-600">
              <Flag className="size-3" aria-hidden /> {hint}
            </p>
          )}
          <div className="relative flex-1">{children}</div>
          {variant === "inbox" && (
            <div
              aria-hidden
              className="pointer-events-none sticky bottom-28 z-20 flex justify-end px-4"
            >
              <span className="flex h-14 items-center gap-3 rounded-2xl bg-teal-100 px-5 text-[15px] font-medium text-teal-900 shadow-md">
                <Pencil className="size-5" /> {t("mail.compose")}
              </span>
            </div>
          )}
          <div className="sticky bottom-0 z-30">
            {linkStatus !== null && (
              <div
                role="status"
                className="pointer-events-none absolute bottom-full left-0 mb-0 max-w-[calc(100%-1.5rem)] truncate rounded-tr-md border border-b-0 border-l-0 border-slate-300 bg-slate-100 px-2 py-0.5 text-xs text-slate-800 shadow-sm"
              >
                {linkStatus}
              </div>
            )}
            {footer}
          </div>
        </div>
      </LinkStatusContext.Provider>
    </MotionConfig>
  );
}

/** Sets the URL shown in the shell's bottom-left status pill (null hides it). */
const LinkStatusContext = createContext<(url: string | null) => void>(() => {});

/** Link text that is itself a web address is drawn as a plain link; anything else as a button. */
const LOOKS_LIKE_URL = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i;

/**
 * One inert link or button in an email. Hovering, focusing or tapping it shows its real
 * destination in the status pill; tapping also counts as inspecting it.
 */
function MailLink({
  link,
  inspected,
  onReveal,
  ...flag
}: FlagProps & {
  link: MailView["links"][number];
  inspected: boolean;
  onReveal: (ids: string[]) => void;
}) {
  const setStatus = useContext(LinkStatusContext);
  const [pinned, setPinned] = useState(false);
  const show = () => setStatus(link.actualUrl);
  const hide = () => {
    if (!pinned) setStatus(null);
  };

  // A tap pins the pill (touch screens have no hover) until the next tap somewhere else.
  useEffect(() => {
    if (!pinned) return;
    const unpin = (e: PointerEvent) => {
      if (e.target instanceof Element && e.target.closest(`[data-link-id="${link.id}"]`)) return;
      setPinned(false);
      setStatus(null);
    };
    document.addEventListener("pointerdown", unpin);
    return () => document.removeEventListener("pointerdown", unpin);
  }, [pinned, link.id, setStatus]);

  // Never leave a stale URL behind when the email changes.
  useEffect(() => () => setStatus(null), [setStatus]);

  const isUrl = LOOKS_LIKE_URL.test(link.text.trim());
  return (
    <div className="flex items-center gap-1">
      {/* Inert on purpose: a button, never an <a href>. */}
      <button
        type="button"
        data-link-id={link.id}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={() => {
          show();
          setPinned(true);
          onReveal([link.id]);
        }}
        className={
          isUrl
            ? "min-h-11 min-w-0 cursor-pointer text-left text-[15px] break-all text-blue-700 underline underline-offset-2 hover:text-blue-800"
            : "min-h-11 cursor-pointer rounded-md bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-800"
        }
      >
        {link.text}
      </button>
      {inspected && <FlagToggle id={link.id} label={link.actualUrl} {...flag} />}
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

/** Colours for initial avatars, picked from the name so a sender always looks the same. */
const AVATAR_COLOURS = [
  "bg-teal-600",
  "bg-indigo-600",
  "bg-rose-600",
  "bg-amber-600",
  "bg-sky-700",
  "bg-fuchsia-700",
  "bg-emerald-700",
] as const;

/** A round avatar with the sender's first letter. Shared with the inbox list and composer. */
export function MailAvatar({ name, className }: { name: string; className?: string }) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full text-base font-medium text-white",
        AVATAR_COLOURS[hash % AVATAR_COLOURS.length],
        className,
      )}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
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
        "flex items-center gap-2 rounded-md px-1.5 py-1 text-sm",
        flagged && "bg-red-50 ring-1 ring-red-300",
      )}
    >
      <span className="w-[72px] shrink-0 text-right text-slate-500">{label}:</span>
      <span className="min-w-0 flex-1 font-mono text-[13px] break-all text-slate-900">{value}</span>
      <FlagToggle id={id} label={`${label} ${value}`} {...flag} />
    </div>
  );
}

/** The icon for the name as shown (cut-short names count by what's visible, as in a real app). */
function fileIcon(name: string): { Icon: LucideIcon; tint: string } {
  const ext =
    name
      .toLowerCase()
      .replace(/[.…]+$/, "")
      .split(".")
      .pop() ?? "";
  if (ext === "pdf") return { Icon: FileText, tint: "text-red-600" };
  if (ext === "apk") return { Icon: Smartphone, tint: "text-emerald-700" };
  if (["zip", "rar", "7z"].includes(ext)) return { Icon: FileArchive, tint: "text-amber-700" };
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext))
    return { Icon: ImageIcon, tint: "text-sky-700" };
  return { Icon: File, tint: "text-slate-600" };
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
    <article className="pb-6">
      {/* Subject, label chip and star */}
      <div className="flex items-start gap-2 px-4 pt-4">
        <h1 className="min-w-0 flex-1 text-[22px] leading-snug text-slate-900">
          {mail.subject}{" "}
          <span className="inline-block translate-y-[-2px] rounded bg-slate-200 px-1.5 py-0.5 align-middle text-[11px] text-slate-700">
            {t("mail.inboxLabel")}
          </span>
        </h1>
        <Star className="mt-1.5 size-5 shrink-0 text-slate-400" aria-hidden />
      </div>

      {/* Sender row */}
      <div className="mt-4 px-4">
        <div className="flex items-start gap-3">
          <MailAvatar name={mail.displayName} />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <span className="min-w-0 truncate font-semibold text-slate-900">
                {mail.displayName}
              </span>
              <span className="shrink-0 text-xs text-slate-500">{mail.date}</span>
            </div>
            <button
              type="button"
              className="-ml-2 flex min-h-11 items-center gap-0.5 rounded-md px-2 text-left text-sm text-slate-600 hover:bg-slate-100"
              onClick={() => onReveal(detailIds)}
              aria-expanded={detailsOpen}
              aria-label={detailsOpen ? t("mail.hideDetails") : t("mail.showDetails")}
            >
              {t("mail.toMe")}
              {detailsOpen ? (
                <ChevronUp className="size-4" aria-hidden />
              ) : (
                <ChevronDown className="size-4" aria-hidden />
              )}
            </button>
          </div>
          <EllipsisVertical className="mt-1 size-5 shrink-0 text-slate-400" aria-hidden />
        </div>

        {mail.showFromAddress && !detailsOpen && (
          <DetailRow id={mail.from.id} label={t("mail.from")} value={mail.from.address} {...flag} />
        )}
        {!detailsOpen && <p className="mt-1 text-xs text-slate-500">{t("mail.tapSender")}</p>}
        {detailsOpen && (
          <div className="mt-1 space-y-0.5 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
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
            <div className="flex items-center gap-2 px-1.5 py-1 text-sm">
              <span className="w-[72px] shrink-0 text-right text-slate-500">{t("mail.date")}:</span>
              <span className="min-w-0 flex-1 text-slate-900">{mail.date}</span>
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="mt-5 space-y-3 px-4 text-[15px] leading-relaxed text-slate-900">
        {mail.body.map((paragraph) => (
          <p key={paragraph.targetId}>
            <HighlightableText targetId={paragraph.targetId} text={paragraph.text} />
          </p>
        ))}
      </div>

      {/* Buttons and links: inert, only their destination can be inspected */}
      {mail.links.length > 0 && (
        <div className="mt-5 space-y-2 px-4">
          {mail.links.map((link) => (
            <MailLink
              key={link.id}
              link={link}
              inspected={seenIds.includes(link.id)}
              onReveal={onReveal}
              {...flag}
            />
          ))}
          {!mail.links.every((link) => seenIds.includes(link.id)) && (
            <p className="text-xs text-slate-500">{t("mail.inspectLinkHint")}</p>
          )}
        </div>
      )}

      {/* Attachments */}
      {mail.attachments.length > 0 && (
        <div className="mt-6 border-t border-slate-200 px-4 pt-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-700">
            <Paperclip className="size-4" aria-hidden />
            {t("mail.attachments")(mail.attachments.length)}
          </p>
          <div className="space-y-3">
            {mail.attachments.map((a) => {
              const inspected = seenIds.includes(a.id);
              const { Icon, tint } = fileIcon(a.shownName);
              return (
                <div key={a.id} className="overflow-hidden rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => onReveal([a.id])}
                    aria-expanded={inspected}
                    className="block w-full text-left"
                  >
                    <span className="flex h-24 items-center justify-center bg-slate-100">
                      <Icon className={cn("size-10", tint)} aria-hidden />
                    </span>
                    <span className="flex items-center gap-2 px-3 py-2.5">
                      <Icon className={cn("size-4 shrink-0", tint)} aria-hidden />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-900">
                        {a.shownName}
                      </span>
                      {a.sizeLabel !== undefined && (
                        <span className="shrink-0 text-xs text-slate-500">{a.sizeLabel}</span>
                      )}
                    </span>
                  </button>
                  {inspected && (
                    <div className="space-y-1 border-t border-slate-200 bg-slate-50 px-2 py-2">
                      <DetailRow
                        id={a.id}
                        label={t("mail.fileName")}
                        value={a.fullName}
                        {...flag}
                      />
                      <p className="px-1.5 text-sm">
                        <span className="text-slate-500">{t("mail.fileType")} </span>
                        <span className="font-medium text-slate-900">{a.actualType}</span>
                      </p>
                      {a.documentId !== undefined && (
                        <button
                          type="button"
                          onClick={() => onOpenPanel(a.documentId!)}
                          className="flex min-h-11 items-center gap-1.5 px-1.5 text-sm font-semibold text-indigo-700"
                        >
                          <Search className="size-4" aria-hidden /> {t("mail.openDocument")}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
}
