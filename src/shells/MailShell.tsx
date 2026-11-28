"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  Archive,
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleCheck,
  CircleHelp,
  Clock,
  Download,
  EllipsisVertical,
  File,
  Flag,
  FolderInput,
  Forward,
  Grip,
  Image as ImageIcon,
  Inbox,
  Info,
  Mail,
  Maximize2,
  Menu,
  Minus,
  OctagonAlert,
  Paperclip,
  Pencil,
  Plus,
  Printer,
  Reply,
  RotateCw,
  Search,
  SendHorizontal,
  Settings,
  SlidersHorizontal,
  Smile,
  SquareArrowOutUpRight,
  Star,
  Tag,
  Trash2,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { MotionConfig } from "motion/react";
import { useT } from "@/i18n/hooks";
import { cn } from "@/lib/utils";
import {
  AddToDriveIcon,
  FILE_COLOUR,
  FileTypeIcon,
  fileKind,
  GMAIL_BODY_FONT,
  GMAIL_FONT,
  GmailLockup,
  shortMailDate,
  type FileKind,
} from "./gmail/brand";
import { HighlightableText } from "./HighlightableText";
import { useInDojoPanel } from "./panel-slot";
import { SimulationBar } from "./SimulationBar";
import type { FlagProps, MailView } from "./types";

/**
 * Gmail, replicated with its real UI and logo (used with permission, see CLAUDE.md). Phones get
 * the Android app: search pill, letter avatars, the Compose button. On desktop (docked Dojo
 * panel) it is the web app: logo and search bar, folder list with Compose, and the list or
 * reading view in a rounded white panel. Replies open in a compose window in the bottom-right.
 *
 * Icons for actions we don't simulate are decorative only. Nothing here opens a real link:
 * destinations are only ever shown as text, in a browser-style status pill at the bottom-left
 * (on hover, focus or tap), the way a desktop browser shows a link's real URL.
 */
export function MailShell({
  title,
  backHref,
  hint,
  toolbar,
  footer,
  children,
  variant = "message",
  pager,
  unreadCount,
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
  /** Desktop top-right position text, e.g. "1–5 of 5" or "2 of 5". */
  pager?: string;
  /** Unread count beside Inbox in the desktop folder list. */
  unreadCount?: number;
}) {
  const t = useT();
  const [linkStatus, setLinkStatus] = useState<string | null>(null);
  const docked = useInDojoPanel();

  if (docked) {
    return (
      <MotionConfig reducedMotion="user">
        <LinkStatusContext.Provider value={setLinkStatus}>
          <DesktopMail
            title={title}
            backHref={backHref}
            hint={hint}
            toolbar={toolbar}
            footer={footer}
            variant={variant}
            linkStatus={linkStatus}
            pager={pager}
            unreadCount={unreadCount}
          >
            {children}
          </DesktopMail>
        </LinkStatusContext.Provider>
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <LinkStatusContext.Provider value={setLinkStatus}>
        <div className={cn("flex min-h-dvh flex-col bg-white text-[#1f1f1f]", GMAIL_FONT)}>
          <div className="sticky top-0 z-40 bg-white">
            <SimulationBar />
            {variant === "inbox" ? (
              <header className="px-2 pt-2 pb-1">
                <div className="flex items-center gap-1">
                  <Link
                    href={backHref}
                    aria-label={t("nav.back")}
                    className="flex size-11 shrink-0 items-center justify-center rounded-full text-[#444746] hover:bg-black/5"
                  >
                    <ArrowLeft className="size-6" />
                  </Link>
                  <div
                    aria-hidden
                    className="flex h-12 min-w-0 flex-1 items-center gap-4 rounded-full bg-[#eaf1fb] pr-2 pl-4 text-base text-[#444746]"
                  >
                    <Menu className="size-6 shrink-0" />
                    <span className="flex-1 truncate">{t("mail.search")}</span>
                    <Avatar />
                  </div>
                </div>
                <h1 className="px-3 pt-4 text-sm text-[#444746]">{title}</h1>
              </header>
            ) : (
              <header className="flex h-14 items-center gap-1 px-1 text-[#444746]">
                <Link
                  href={backHref}
                  aria-label={t("nav.back")}
                  className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-black/5"
                >
                  <ArrowLeft className="size-6" />
                </Link>
                <span
                  className={cn(
                    "min-w-0 flex-1 truncate",
                    variant === "compose" ? "text-[22px] text-[#1f1f1f]" : "sr-only",
                  )}
                >
                  {title}
                </span>
                {variant !== "compose" && <span className="flex-1" />}
                <span aria-hidden className="flex items-center gap-1 pr-1">
                  {(variant === "compose"
                    ? [Paperclip, SendHorizontal, EllipsisVertical]
                    : [Archive, Trash2, Mail, EllipsisVertical]
                  ).map((Icon, i) => (
                    <span key={i} className="flex size-11 items-center justify-center">
                      <Icon className="size-[22px]" />
                    </span>
                  ))}
                </span>
              </header>
            )}
            {toolbar}
          </div>
          {hint !== undefined && <HintPill hint={hint} />}
          <div className="relative flex-1">{children}</div>
          {variant === "inbox" && (
            <div
              aria-hidden
              className="pointer-events-none sticky bottom-28 z-20 flex justify-end px-4"
            >
              <span className="flex h-14 items-center gap-3 rounded-2xl bg-[#c2e7ff] pr-5 pl-4 text-sm font-medium text-[#001d35] shadow-[0_1px_3px_rgba(0,0,0,.3),0_4px_8px_3px_rgba(0,0,0,.15)]">
                <Pencil className="size-6" /> {t("mail.compose")}
              </span>
            </div>
          )}
          <div className="sticky bottom-0 z-30">
            {linkStatus !== null && <LinkStatusPill url={linkStatus} />}
            {footer}
          </div>
        </div>
      </LinkStatusContext.Provider>
    </MotionConfig>
  );
}

function HintPill({ hint }: { hint: string }) {
  return (
    <p className="mx-auto mt-3 mb-1 flex max-w-[calc(100%-2rem)] items-center gap-1.5 rounded-full bg-[#f1f3f4] px-3 py-1 text-xs text-[#444746]">
      <Flag className="size-3 shrink-0" aria-hidden /> {hint}
    </p>
  );
}

function LinkStatusPill({ url, fixed = false }: { url: string; fixed?: boolean }) {
  return (
    <div
      role="status"
      className={cn(
        "pointer-events-none truncate rounded-tr-md border border-b-0 border-l-0 border-slate-300 bg-slate-100 px-2 py-0.5 text-xs text-slate-800 shadow-sm",
        fixed
          ? "fixed bottom-0 left-0 z-50 max-w-[60vw]"
          : "absolute bottom-full left-0 max-w-[calc(100%-1.5rem)]",
      )}
    >
      {url}
    </div>
  );
}

/** The signed-in account's round avatar. */
function Avatar({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full bg-[#5e35b1] text-white",
        className,
      )}
    >
      <UserRound className="size-[18px]" />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Desktop: Gmail on the web                                           */
/* ------------------------------------------------------------------ */

const ICON_BUTTON = "flex size-10 shrink-0 items-center justify-center rounded-full text-[#444746]";

/** A decorative row of round icon buttons, with optional dividers ("|") between groups. */
function IconRow({ icons }: { icons: (LucideIcon | "|")[] }) {
  return (
    <span aria-hidden className="flex items-center">
      {icons.map((Icon, i) =>
        Icon === "|" ? (
          <span key={i} className="mx-2 h-5 w-px bg-[#c4c7c5]" />
        ) : (
          <span key={i} className={ICON_BUTTON}>
            <Icon className="size-5" />
          </span>
        ),
      )}
    </span>
  );
}

function DesktopMail({
  title,
  backHref,
  hint,
  toolbar,
  footer,
  children,
  variant,
  linkStatus,
  pager,
  unreadCount,
}: {
  title: string;
  backHref: string;
  hint?: string;
  toolbar?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  variant: "inbox" | "message" | "compose";
  linkStatus: string | null;
  pager?: string;
  unreadCount?: number;
}) {
  const t = useT();
  const folders: { icon: LucideIcon; label: string; count?: number; active?: boolean }[] = [
    { icon: Inbox, label: t("mail.inbox"), count: unreadCount, active: true },
    { icon: Star, label: t("mail.starred") },
    { icon: Clock, label: t("mail.snoozed") },
    { icon: SendHorizontal, label: t("mail.sent") },
    { icon: File, label: t("mail.drafts") },
    { icon: ChevronDown, label: t("mail.more") },
  ];

  return (
    <div
      className={cn(
        "relative flex h-full min-h-0 flex-1 flex-col bg-[#f6f8fc] text-[#1f1f1f]",
        GMAIL_FONT,
      )}
    >
      {/* Top bar: menu, logo, search, help, settings, apps, account. Decorative. */}
      <header className="flex h-16 shrink-0 items-center gap-1 pr-2 pl-2" aria-hidden>
        <span className={cn(ICON_BUTTON, "size-12")}>
          <Menu className="size-6" />
        </span>
        <GmailLockup name={t("mail.appName")} className="shrink-0 pr-4 pl-1 xl:w-[190px]" />
        <div className="flex h-12 max-w-[720px] min-w-0 flex-1 items-center gap-1 rounded-full bg-[#eaf1fb] px-1 text-[#444746]">
          <span className={ICON_BUTTON}>
            <Search className="size-5" />
          </span>
          <span className="flex-1 truncate text-base">{t("mail.search")}</span>
          <span className={ICON_BUTTON}>
            <SlidersHorizontal className="size-5" />
          </span>
        </div>
        <span className="ml-auto flex shrink-0 items-center pl-2">
          <span className={ICON_BUTTON}>
            <CircleHelp className="size-6" />
          </span>
          <span className={ICON_BUTTON}>
            <Settings className="size-6" />
          </span>
          <span className={ICON_BUTTON}>
            <Grip className="size-6" />
          </span>
          <span className="flex size-12 items-center justify-center">
            <Avatar />
          </span>
        </span>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Folders: an icon rail on narrow screens, the full list from xl. Decorative. */}
        <nav aria-hidden className="flex w-[72px] shrink-0 flex-col xl:w-[256px] xl:pr-4">
          <span className="mx-2 mb-4 flex size-14 items-center justify-center gap-3 rounded-2xl bg-[#c2e7ff] text-sm font-medium text-[#001d35] xl:w-auto xl:max-w-max xl:justify-start xl:pr-6 xl:pl-4">
            <Pencil className="size-6 shrink-0" />
            <span className="hidden xl:inline">{t("mail.compose")}</span>
          </span>
          {folders.map(({ icon: Icon, label, count, active }) => (
            <span
              key={label}
              className={cn(
                "mx-2 flex h-8 items-center justify-center rounded-full text-sm xl:mx-0 xl:justify-start xl:gap-[18px] xl:rounded-l-none xl:pr-3 xl:pl-[26px]",
                active ? "bg-[#d3e3fd] font-bold text-[#001d35]" : "text-[#1f1f1f]",
              )}
            >
              <Icon className="size-5 shrink-0" />
              <span className="hidden flex-1 xl:inline">{label}</span>
              {count !== undefined && count > 0 && (
                <span className="hidden text-xs xl:inline">{count}</span>
              )}
            </span>
          ))}
          <span className="mt-4 hidden h-10 items-center justify-between pr-4 pl-[26px] text-base font-medium xl:flex">
            {t("mail.labels")}
            <Plus className="size-5 text-[#444746]" />
          </span>
        </nav>

        <main className="mr-4 mb-4 flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white">
          {/* Action row */}
          <div className="flex h-12 shrink-0 items-center px-2">
            {variant === "inbox" ? (
              <span aria-hidden className="flex items-center">
                <span className="flex h-10 items-center gap-0.5 rounded-full pr-1 pl-2.5 text-[#444746]">
                  <span className="size-[18px] rounded-[3px] border-2 border-[#444746]" />
                  <ChevronDown className="size-4" />
                </span>
                <IconRow icons={[RotateCw, EllipsisVertical]} />
              </span>
            ) : (
              <>
                <Link
                  href={backHref}
                  aria-label={t("nav.back")}
                  className={cn(ICON_BUTTON, "hover:bg-black/5")}
                >
                  <ArrowLeft className="size-5" />
                </Link>
                <span className="w-2" />
                <IconRow
                  icons={[
                    Archive,
                    OctagonAlert,
                    Trash2,
                    "|",
                    Mail,
                    Clock,
                    CircleCheck,
                    "|",
                    FolderInput,
                    Tag,
                    EllipsisVertical,
                  ]}
                />
              </>
            )}
            {pager !== undefined && (
              <span aria-hidden className="ml-auto flex items-center gap-1 text-xs text-[#5f6368]">
                <span className="pr-2">{pager}</span>
                <span className={cn(ICON_BUTTON, "text-[#c4c7c5]")}>
                  <ChevronLeft className="size-5" />
                </span>
                <span className={cn(ICON_BUTTON, "text-[#c4c7c5]")}>
                  <ChevronRight className="size-5" />
                </span>
              </span>
            )}
            <h1 className="sr-only">{title}</h1>
          </div>

          {variant === "inbox" && (
            <div aria-hidden className="flex h-14 shrink-0 text-sm">
              {[
                { icon: Inbox, label: t("mail.primary"), active: true },
                { icon: Tag, label: t("mail.promotions") },
                { icon: Users, label: t("mail.social") },
                { icon: Info, label: t("mail.updates") },
              ].map(({ icon: Icon, label, active }) => (
                <span
                  key={label}
                  className={cn(
                    "relative flex max-w-[250px] min-w-0 flex-1 items-center gap-4 px-4 font-medium",
                    active ? "text-[#0b57d0]" : "text-[#444746]",
                  )}
                >
                  <Icon className="size-5 shrink-0" />
                  <span className="truncate">{label}</span>
                  {active && (
                    <span className="absolute inset-x-2 bottom-0 h-[3px] rounded-t-[3px] bg-[#0b57d0]" />
                  )}
                </span>
              ))}
            </div>
          )}

          {toolbar}
          {hint !== undefined && <HintPill hint={hint} />}
          <div className="relative min-h-0 flex-1 overflow-y-auto">
            {variant === "compose" ? null : children}
          </div>
        </main>
      </div>

      {variant === "compose" && (
        <section
          aria-label={t("mail.newMessage")}
          className="absolute right-6 bottom-0 z-20 flex max-h-[calc(100%-5rem)] w-[560px] flex-col overflow-hidden rounded-t-lg bg-white shadow-[0_8px_10px_1px_rgba(0,0,0,.14),0_3px_14px_2px_rgba(0,0,0,.12),0_5px_5px_-3px_rgba(0,0,0,.2)]"
        >
          <header className="flex h-10 shrink-0 items-center gap-2 bg-[#f2f6fc] pr-2 pl-4 text-sm font-medium">
            <h2 className="flex-1 truncate">{title}</h2>
            <span aria-hidden className="flex items-center gap-2 text-[#444746]">
              <Minus className="size-4" />
              <Maximize2 className="size-4" />
              <X className="size-4" />
            </span>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          <div aria-hidden className="flex h-14 shrink-0 items-center gap-3 px-4 text-[#444746]">
            <span className="flex h-9 items-center overflow-hidden rounded-full bg-[#0b57d0] text-sm font-medium text-white">
              <span className="pr-4 pl-6">{t("mail.send")}</span>
              <span className="flex h-full items-center border-l border-white/30 px-2">
                <ChevronDown className="size-4" />
              </span>
            </span>
            <Paperclip className="size-5" />
            <ImageIcon className="size-5" />
            <Trash2 className="ml-auto size-5" />
          </div>
        </section>
      )}

      {linkStatus !== null && <LinkStatusPill url={linkStatus} fixed />}
      {/* Choices render into the Dojo panel. */}
      {footer}
    </div>
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
            ? "min-h-11 min-w-0 cursor-pointer text-left break-all text-[#1155cc] underline hover:text-[#0b4ab0] lg:min-h-0"
            : "min-h-11 cursor-pointer rounded bg-[#1a73e8] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#1765cc]"
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

/** Gmail's letter-avatar colours, picked from the name so a sender always looks the same. */
const AVATAR_COLOURS = [
  "bg-[#5c6bc0]",
  "bg-[#ef6c00]",
  "bg-[#00897b]",
  "bg-[#8e24aa]",
  "bg-[#d81b60]",
  "bg-[#039be5]",
  "bg-[#7cb342]",
  "bg-[#6d4c41]",
] as const;

/** A round avatar with the sender's first letter. Shared with the inbox list and composer. */
export function MailAvatar({ name, className }: { name: string; className?: string }) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full text-lg text-white",
        AVATAR_COLOURS[hash % AVATAR_COLOURS.length],
        className,
      )}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

/** One row of the "to me" details card, like Gmail's "from: / reply-to: / to:" popup. */
function DetailRow({
  id,
  label,
  value,
  name,
  ...flag
}: Partial<FlagProps> & { id?: string; label: string; value: string; name?: string }) {
  const flaggable = id !== undefined && flag.flaggedIds !== undefined && flag.onToggleFlag;
  const flagged = flaggable && flag.flaggedIds!.includes(id);
  return (
    <div className="contents">
      <span className="pt-1 text-right text-[#5f6368] lowercase">{label}:</span>
      <span
        className={cn(
          "flex min-h-7 min-w-0 items-start gap-1 rounded",
          flagged && "bg-red-50 ring-1 ring-red-300",
        )}
      >
        <span className="min-w-0 flex-1 pt-1 break-words text-[#1f1f1f]">
          {name !== undefined && <span className="font-bold">{name} </span>}
          <span className="inline-block max-w-full break-all">
            {name !== undefined ? `<${value}>` : value}
          </span>
        </span>
        {flaggable && (
          <FlagToggle
            id={id}
            label={`${label} ${value}`}
            flaggedIds={flag.flaggedIds!}
            onToggleFlag={flag.onToggleFlag!}
            className="-my-2"
          />
        )}
      </span>
    </div>
  );
}

/**
 * The reading pane: subject, sender, details, body, links and attachments. What the player has
 * revealed comes from `seenIds`, so it stays open across re-renders and rewinds.
 */
export function MailBody({
  mail,
  seenIds,
  onReveal,
  onOpenPanel,
  labels,
  ...flag
}: FlagProps & {
  mail: MailView;
  seenIds: readonly string[];
  onReveal: (ids: string[]) => void;
  onOpenPanel: (panelId: string) => void;
  /** Extra label chips after the subject, e.g. the player's triage label. */
  labels?: ReactNode;
}) {
  const t = useT();
  const detailIds = [mail.from.id, ...(mail.replyTo ? [mail.replyTo.id] : []), mail.to.id];
  const detailsOpen = detailIds.every((id) => seenIds.includes(id));
  const fromFlagged = flag.flaggedIds.includes(mail.from.id);

  return (
    <article className="pb-8">
      {/* Subject, label chips, and print / new window (desktop) or star (phone) */}
      <div className="flex items-start gap-2 pt-3 pr-2 pl-4 lg:pt-5 lg:pr-4 lg:pl-[72px]">
        <h1 className="min-w-0 flex-1 pt-1 text-[22px] leading-7 text-[#1f1f1f]">
          {mail.subject}{" "}
          <span className="inline-flex translate-y-[-3px] items-center gap-1 align-middle">
            <span className="rounded-[4px] bg-[#dddddd] px-1.5 text-xs leading-5 text-[#444746]">
              {t("mail.inboxLabel")}
            </span>
            {labels}
          </span>
        </h1>
        <span aria-hidden className="hidden lg:flex">
          <span className={ICON_BUTTON}>
            <Printer className="size-5" />
          </span>
          <span className={ICON_BUTTON}>
            <SquareArrowOutUpRight className="size-5" />
          </span>
        </span>
        <span aria-hidden className={cn(ICON_BUTTON, "lg:hidden")}>
          <Star className="size-[22px]" />
        </span>
      </div>

      {/* Sender row */}
      <div className="mt-3 pr-2 pl-4 lg:mt-5 lg:pr-4">
        <div className="flex items-start gap-3 lg:gap-4">
          <MailAvatar name={mail.displayName} />
          <div className="min-w-0 flex-1">
            <div className="flex min-h-5 flex-wrap items-center gap-x-1.5">
              <span className="min-w-0 truncate font-bold text-[#1f1f1f] lg:text-sm">
                {mail.displayName}
              </span>
              {mail.showFromAddress && (
                <span
                  className={cn(
                    "flex min-w-0 items-center rounded text-xs text-[#5f6368]",
                    fromFlagged && "bg-red-50 ring-1 ring-red-300",
                  )}
                >
                  <span className="break-all">&lt;{mail.from.address}&gt;</span>
                  <FlagToggle
                    id={mail.from.id}
                    label={`${t("mail.from")} ${mail.from.address}`}
                    {...flag}
                  />
                </span>
              )}
              <span className="text-xs text-[#5f6368] lg:hidden">{shortMailDate(mail.date)}</span>
            </div>
            <button
              type="button"
              className="-ml-1.5 flex min-h-9 items-center gap-0.5 rounded px-1.5 text-left text-xs text-[#5f6368] hover:bg-black/5 lg:min-h-6"
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
          <span aria-hidden className="flex shrink-0 items-center text-[#444746]">
            <span className="mr-2 hidden text-xs whitespace-nowrap text-[#5f6368] lg:inline">
              {mail.date}
            </span>
            <span className={cn(ICON_BUTTON, "hidden lg:flex")}>
              <Star className="size-5" />
            </span>
            <span className={cn(ICON_BUTTON, "hidden lg:flex")}>
              <Smile className="size-5" />
            </span>
            <span className={ICON_BUTTON}>
              <Reply className="size-5" />
            </span>
            <span className={ICON_BUTTON}>
              <EllipsisVertical className="size-5" />
            </span>
          </span>
        </div>

        {!detailsOpen && (
          <p className="mt-0.5 pl-[52px] text-xs text-[#5f6368] lg:pl-14">{t("mail.tapSender")}</p>
        )}
        {detailsOpen && (
          <div className="mt-1 ml-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-2 rounded-lg bg-white py-3 pr-1 pl-3 text-xs shadow-[0_1px_3px_rgba(60,64,67,.3),0_4px_8px_3px_rgba(60,64,67,.15)] lg:ml-14 lg:max-w-[600px]">
            <DetailRow
              id={mail.from.id}
              label={t("mail.from")}
              name={mail.displayName}
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
            <DetailRow label={t("mail.date")} value={mail.date} />
            <DetailRow label={t("mail.subject")} value={mail.subject} />
          </div>
        )}
      </div>

      {/* Body */}
      <div
        className={cn(
          "mt-5 space-y-5 px-4 text-sm leading-[1.45] text-[#222] lg:max-w-[880px] lg:pr-6 lg:pl-[72px]",
          GMAIL_BODY_FONT,
        )}
      >
        {mail.body.map((paragraph) => (
          <p key={paragraph.targetId}>
            <HighlightableText targetId={paragraph.targetId} text={paragraph.text} />
          </p>
        ))}
      </div>

      {/* Buttons and links: inert, only their destination can be inspected */}
      {mail.links.length > 0 && (
        <div className={cn("mt-5 space-y-2 px-4 text-sm lg:pl-[72px]", GMAIL_BODY_FONT)}>
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
            <p className="font-sans text-xs text-[#5f6368]">{t("mail.inspectLinkHint")}</p>
          )}
        </div>
      )}

      {mail.attachments.length > 0 && (
        <Attachments
          mail={mail}
          seenIds={seenIds}
          onReveal={onReveal}
          onOpenPanel={onOpenPanel}
          {...flag}
        />
      )}

      {/* Reply row. Decorative: the real choices are in the Dojo panel or the footer. */}
      <div aria-hidden className="mt-8 flex flex-wrap gap-3 px-4 lg:pl-[72px]">
        {[
          { icon: Reply, label: t("mail.reply") },
          { icon: Forward, label: t("mail.forward") },
        ].map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="flex h-10 items-center gap-2 rounded-full border border-[#747775] pr-5 pl-4 text-sm font-medium text-[#444746]"
          >
            <Icon className="size-5" /> {label}
          </span>
        ))}
        <span className="flex size-10 items-center justify-center rounded-full border border-[#747775] text-[#444746]">
          <Smile className="size-5" />
        </span>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Attachments                                                         */
/* ------------------------------------------------------------------ */

/**
 * "One attachment • Scanned by Gmail", then Gmail's attachment cards. Tapping a card inspects
 * it (its full name and real type appear below) and opens its preview when it has one.
 */
function Attachments({
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
  const inspected = mail.attachments.filter((a) => seenIds.includes(a.id));
  return (
    <div className="mx-4 mt-6 border-t border-dotted border-[#c4c7c5] pt-4 lg:mr-6 lg:ml-[72px]">
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <span className="font-bold text-[#1f1f1f]">
          {t("mail.attachments")(mail.attachments.length)}
        </span>
        <span aria-hidden className="text-[#5f6368]">
          •
        </span>
        <span className="flex items-center gap-1 text-[#5f6368]">
          {t("mail.scannedBy")} <Info className="size-4" aria-hidden />
        </span>
        <span
          aria-hidden
          className="ml-2 hidden items-center gap-2 font-medium text-[#444746] sm:flex"
        >
          <AddToDriveIcon className="size-5" />
          {mail.attachments.length === 1 ? t("mail.addToDrive") : t("mail.addAllToDrive")}
        </span>
      </p>

      <div className="mt-3 flex flex-wrap gap-3">
        {mail.attachments.map((a) => (
          <AttachmentCard
            key={a.id}
            name={a.shownName}
            size={a.sizeLabel}
            kind={fileKind(a.shownName)}
            inspected={seenIds.includes(a.id)}
            onClick={() => {
              onReveal([a.id]);
              if (a.documentId !== undefined) onOpenPanel(a.documentId);
            }}
          />
        ))}
      </div>

      {inspected.length > 0 && (
        <div className="mt-3 space-y-2">
          {inspected.map((a) => (
            <div
              key={a.id}
              className="grid max-w-[600px] grid-cols-[auto_minmax(0,1fr)] gap-x-2 rounded-lg border border-[#dadce0] py-2 pr-1 pl-3 text-xs"
            >
              <DetailRow id={a.id} label={t("mail.fileName")} value={a.fullName} {...flag} />
              <span className="py-1 text-right text-[#5f6368] lowercase">{t("mail.fileType")}</span>
              <span className="py-1 font-bold text-[#1f1f1f]">{a.actualType}</span>
              {a.documentId !== undefined && (
                <button
                  type="button"
                  onClick={() => onOpenPanel(a.documentId!)}
                  className="col-start-2 flex min-h-9 items-center gap-1.5 text-sm font-medium text-[#0b57d0]"
                >
                  <Search className="size-4" aria-hidden /> {t("mail.openDocument")}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** A Gmail attachment card: preview on top, type icon and name below, a folded corner. */
function AttachmentCard({
  name,
  size,
  kind,
  inspected,
  onClick,
}: {
  name: string;
  size?: string;
  kind: FileKind;
  inspected: boolean;
  onClick: () => void;
}) {
  const t = useT();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={inspected}
      aria-label={name}
      className="group relative block h-[120px] w-[180px] overflow-hidden border border-[#dadce0] bg-[#f5f5f5] text-left"
    >
      {/* Preview */}
      {kind === "pdf" ? (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 bottom-[34px] overflow-hidden bg-white"
        >
          <MiniPage />
        </span>
      ) : (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 bottom-[34px] flex items-center justify-center"
        >
          <FileTypeIcon kind={kind} className="size-9" />
        </span>
      )}
      {/* Name bar */}
      <span className="absolute inset-x-0 bottom-0 flex h-[34px] items-center gap-2 border-t border-[#e0e0e0] bg-[#f5f5f5] pr-7 pl-2.5">
        <FileTypeIcon kind={kind} />
        <span className="min-w-0 truncate text-[13px] font-bold text-[#5f6368]">{name}</span>
      </span>
      {/* Folded corner */}
      <span aria-hidden className="absolute -right-px -bottom-px h-5 w-10">
        <span
          className="absolute inset-0 bg-[#c8c8c8]"
          style={{ clipPath: "polygon(0 100%, 50% 0, 50% 100%)" }}
        />
        <span
          className="absolute inset-0"
          style={{
            background: FILE_COLOUR[kind],
            clipPath: "polygon(50% 0, 100% 0, 50% 100%)",
          }}
        />
        <span
          className="absolute inset-0 bg-white"
          style={{ clipPath: "polygon(100% 0, 100% 100%, 50% 100%)" }}
        />
      </span>
      {/* Hover: full name, size, download and Add to Drive */}
      <span
        aria-hidden
        className="absolute inset-0 hidden flex-col bg-[#f1f1f1] px-3 pt-2.5 pb-3 group-hover:flex"
      >
        <span className="flex items-start gap-2">
          <FileTypeIcon kind={kind} className="mt-0.5" />
          <span className="line-clamp-2 text-sm leading-tight font-bold break-all text-[#5f6368]">
            {name}
          </span>
        </span>
        {size !== undefined && <span className="mt-1 pl-6 text-xs text-[#80868b]">{size}</span>}
        <span className="mt-auto flex gap-2 pl-6">
          <span
            title={t("mail.download")}
            className="flex size-7 items-center justify-center rounded bg-[#757575] text-white"
          >
            <Download className="size-4" />
          </span>
          <span
            title={t("mail.addToDrive")}
            className="flex size-7 items-center justify-center rounded bg-[#757575] text-white"
          >
            <AddToDriveIcon className="size-4" />
          </span>
        </span>
        <span className="absolute -right-px -bottom-px h-5 w-10">
          <span
            className="absolute inset-0 bg-[#c8c8c8]"
            style={{ clipPath: "polygon(0 100%, 50% 0, 50% 100%)" }}
          />
          <span
            className="absolute inset-0"
            style={{
              background: FILE_COLOUR[kind],
              clipPath: "polygon(50% 0, 100% 0, 50% 100%)",
            }}
          />
          <span
            className="absolute inset-0 bg-white"
            style={{ clipPath: "polygon(100% 0, 100% 100%, 50% 100%)" }}
          />
        </span>
      </span>
    </button>
  );
}

/** A thumbnail of a letter's first page: letterhead, a title and lines of text. */
function MiniPage() {
  const widths = [92, 70, 84, 60, 88, 76, 66, 90, 54];
  return (
    <span className="absolute inset-x-3 top-2 bottom-0 border border-[#e0e0e0] bg-white px-2.5 pt-2.5 shadow-[0_1px_2px_rgba(0,0,0,.08)]">
      <span className="flex items-center gap-1.5 border-b border-[#9aa0a6] pb-1.5">
        <span className="size-3.5 rounded-sm bg-[#3c4043]" />
        <span className="h-1.5 w-12 rounded-full bg-[#5f6368]" />
      </span>
      <span className="mx-auto mt-1.5 block h-1 w-14 rounded-full bg-[#80868b]" />
      {widths.map((w, i) => (
        <span
          key={i}
          className="mt-1 block h-[3px] rounded-full bg-[#dadce0]"
          style={{ width: `${w}%` }}
        />
      ))}
    </span>
  );
}
