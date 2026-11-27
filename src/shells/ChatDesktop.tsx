"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, MotionConfig } from "motion/react";
import {
  Bell,
  BriefcaseBusiness,
  CircleDashed,
  Clapperboard,
  Compass,
  EllipsisVertical,
  Flag,
  Heart,
  House,
  Image as ImageIcon,
  Info,
  Menu,
  MessageSquareText,
  Mic,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Phone,
  Plus,
  Search,
  Send,
  Settings,
  Smile,
  SquarePlus,
  Star,
  UserRound,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";
import { useT } from "@/i18n/hooks";
import { cn } from "@/lib/utils";
import {
  Avatar,
  Bubble,
  CardTyping,
  ContactButton,
  MessageCard,
  THEMES,
  TransitionCard,
  TypingIndicator,
  type ChatTheme,
  type ThemeStyle,
} from "./chat-parts";
import type { ShellProps } from "./types";

/** How each app looks on a desktop browser. Layout and colours only: no logos or wordmarks. */
interface DesktopLook {
  /** Narrow icon column on the far left. */
  rail?: "messenger" | "photo";
  /** Global top nav with a centred page (the professional network). */
  topNav?: boolean;
  page: string;
  sidebar: string;
  sidebarTitle: string;
  search: string;
  activeRow: string;
  activeMuted: string;
  threadHeader: string;
  wallpaper: string;
  composer: string;
  composerInput: string;
  /** Overrides for the message styles. */
  bubbles: Partial<ThemeStyle>;
  headerIcons: LucideIcon[];
}

/** Apps with a desktop web version. SMS is phone-only: it shows in a phone mockup instead. */
export type DesktopChatTheme = Exclude<ChatTheme, "sms">;

const LOOKS: Record<DesktopChatTheme, DesktopLook> = {
  whatsapp: {
    rail: "messenger",
    page: "bg-[#f0f2f5]",
    sidebar: "bg-white border-r border-[#e9edef]",
    sidebarTitle: "text-[22px] font-bold text-[#111b21]",
    search: "bg-[#f0f2f5] rounded-full",
    activeRow: "bg-[#f0f2f5]",
    activeMuted: "text-[#667781]",
    threadHeader: "bg-[#f0f2f5] text-[#111b21] border-l border-[#d1d7db]",
    wallpaper: "bg-[#efeae2]",
    composer: "bg-[#f0f2f5]",
    composerInput: "bg-white rounded-lg",
    bubbles: {
      them: "bg-white text-[#111b21]",
      me: "bg-[#d9fdd3] text-[#111b21]",
      system: "bg-[#ffeecd] text-[#54656f]",
      sender: "text-[#1fa855]",
      headerMuted: "text-[#667781]",
      avatar: "bg-[#dfe5e7] text-[#54656f]",
      bubbleMax: "max-w-[65%]",
    },
    headerIcons: [Video, Search, EllipsisVertical],
  },
  telegram: {
    page: "bg-white",
    sidebar: "bg-white border-r border-[#dadce0]",
    sidebarTitle: "sr-only",
    search: "bg-[#f4f4f5] rounded-full",
    activeRow: "bg-[#3390ec] text-white",
    activeMuted: "text-white/80",
    threadHeader: "bg-white text-black border-b border-[#dadce0]",
    wallpaper: "bg-[linear-gradient(135deg,#dbe8b6,#9fcb97_50%,#d6e5ae)]",
    composer: "bg-transparent",
    composerInput: "bg-white rounded-xl shadow-sm",
    bubbles: {
      them: "bg-white text-black",
      me: "bg-[#eeffde] text-black",
      system: "bg-black/25 text-white",
      sender: "text-[#3390ec]",
      headerMuted: "text-[#707579]",
      avatar: "bg-[#5fbcf0] text-white",
      bubbleMax: "max-w-[65%]",
    },
    headerIcons: [Search, Phone, EllipsisVertical],
  },
  instagram: {
    rail: "photo",
    page: "bg-white",
    sidebar: "bg-white border-r border-[#dbdbdb]",
    sidebarTitle: "text-xl font-bold text-black",
    search: "bg-[#efefef] rounded-lg",
    activeRow: "bg-[#efefef]",
    activeMuted: "text-[#737373]",
    threadHeader: "bg-white text-black border-b border-[#dbdbdb]",
    wallpaper: "bg-white",
    composer: "bg-white",
    composerInput: "rounded-full border border-[#dbdbdb] bg-white",
    bubbles: {
      them: "bg-[#efefef] text-black",
      me: "bg-[#3797f0] text-white",
      system: "bg-transparent text-[#737373]",
      sender: "text-[#737373]",
      headerMuted: "text-[#737373]",
      avatar: "bg-[#efefef] text-[#262626]",
      bubbleMax: "max-w-[65%]",
    },
    headerIcons: [Phone, Video, Info],
  },
  linkedin: {
    topNav: true,
    page: "bg-[#f4f2ee]",
    sidebar: "bg-white border-r border-[#e8e8e8]",
    sidebarTitle: "text-base font-semibold text-black/90",
    search: "bg-[#edf3f8] rounded",
    activeRow: "bg-[#ebf4fd] shadow-[inset_3px_0_0_#01754f]",
    activeMuted: "text-black/60",
    threadHeader: "bg-white text-black/90 border-b border-[#e8e8e8]",
    wallpaper: "bg-white",
    composer: "bg-white border-t border-[#e8e8e8]",
    composerInput: "rounded-lg bg-[#f4f2ee]",
    bubbles: {
      // A work inbox shows plain text under each name, no bubbles.
      them: "bg-transparent text-black/90 shadow-none ring-0 px-0 py-0.5",
      me: "bg-transparent text-black/90 shadow-none ring-0 px-0 py-0.5",
      system: "text-black/60",
      sender: "text-black/90",
      headerMuted: "text-black/60",
      avatar: "bg-[#e9e5df] text-black/70",
    },
    headerIcons: [MoreHorizontal, Video, Star],
  },
};

/** The desktop web layout of ChatShell. Same props, same messages, same flagging. */
export function ChatDesktop({
  theme,
  contact,
  messages,
  typing,
  typingSender,
  hint,
  toolbar,
  footer,
  onContactClick,
  aside,
  transition,
}: ShellProps & { theme: DesktopChatTheme }) {
  const tr = useT();
  const look = LOOKS[theme];
  const style: ThemeStyle = { ...THEMES[theme], ...look.bubbles };
  const cards = style.layout === "cards";
  const endRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view inside the thread's own scroll.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, typing]);

  const last = messages.findLast((m) => m.from !== "system");
  const preview = last === undefined ? (contact.subtitle ?? "") : last.text;

  const thread = (
    <section className="flex min-w-0 flex-1 flex-col">
      <header className={cn("flex h-16 shrink-0 items-center gap-3 px-4", look.threadHeader)}>
        <ContactButton onClick={onContactClick} label={tr("chat.viewProfile")(contact.name)}>
          <Avatar
            name={contact.name}
            src={contact.avatar}
            className={style.avatar}
            size="size-10"
          />
          <div className="min-w-0 flex-1 text-left leading-tight">
            <div className="truncate text-base font-semibold">{contact.name}</div>
            <div className={cn("truncate text-[13px]", style.headerMuted)}>
              {typing ? tr("chat.typing")(typingSender) : contact.subtitle}
            </div>
          </div>
        </ContactButton>
        <span aria-hidden className={cn("flex items-center gap-5", style.headerMuted)}>
          {look.headerIcons.map((Icon, i) => (
            <Icon key={i} className="size-5" />
          ))}
        </span>
      </header>
      {toolbar}
      <div className={cn("relative min-h-0 flex-1 overflow-y-auto", look.wallpaper)}>
        <div
          className={cn(
            "mx-auto flex w-full flex-col px-6 pt-5 pb-4 xl:px-12",
            cards ? "max-w-[760px] gap-3" : "max-w-[920px] gap-1.5",
          )}
        >
          {transition !== undefined && <TransitionCard transition={transition} />}
          {hint !== undefined && (
            <p className="mx-auto mb-2 flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-1 text-xs text-neutral-600">
              <Flag className="size-3" aria-hidden /> {hint}
            </p>
          )}
          <AnimatePresence initial={false}>
            {messages.map((m, i) =>
              cards ? (
                <MessageCard
                  key={m.id}
                  message={m}
                  previous={messages[i - 1]}
                  contactName={contact.name}
                  contactAvatar={contact.avatar}
                  style={style}
                />
              ) : (
                <Bubble key={m.id} message={m} style={style} />
              ),
            )}
            {typing &&
              (cards ? (
                <CardTyping key="typing" name={typingSender ?? contact.name} style={style} />
              ) : (
                <TypingIndicator key="typing" className={style.them} />
              ))}
          </AnimatePresence>
          <div ref={endRef} />
        </div>
      </div>
      <Composer
        look={look}
        placeholder={cards ? tr("composer.placeholder") : tr("desktop.typeMessage")}
      />
      {/* Choices render into the Dojo panel. */}
      {footer}
    </section>
  );

  const list = (
    <ChatList
      look={look}
      title={
        cards
          ? tr("desktop.navMessaging")
          : theme === "instagram"
            ? tr("desktop.messages")
            : tr("desktop.chats")
      }
      tabs={cards ? [tr("desktop.focused"), tr("desktop.other")] : undefined}
      active={
        <>
          <Avatar
            name={contact.name}
            src={contact.avatar}
            className={style.avatar}
            size="size-12"
          />
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline gap-2">
              <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">
                {contact.name}
              </span>
              {last?.time !== undefined && (
                <span className={cn("shrink-0 text-xs", look.activeMuted)}>{last.time}</span>
              )}
            </span>
            <span className={cn("block truncate text-sm", look.activeMuted)}>
              {typing ? tr("chat.typing")(typingSender) : preview}
            </span>
          </span>
        </>
      }
    />
  );

  const evidence =
    aside === undefined ? null : (
      <section
        aria-label={aside.label}
        className="w-[380px] shrink-0 overflow-y-auto border-l border-[#e8e8e8] xl:w-[420px]"
      >
        {aside.content}
      </section>
    );

  return (
    <MotionConfig reducedMotion="user">
      <div className={cn("flex h-full min-h-0 flex-1 flex-col", look.page)}>
        {look.topNav === true && <NetworkNav />}
        {look.topNav === true ? (
          <div className="flex min-h-0 flex-1 justify-center px-4 py-4 xl:px-6">
            <div className="flex w-full max-w-[1128px] min-w-0 overflow-hidden rounded-lg bg-white ring-1 ring-black/10">
              <div className={aside === undefined ? "hidden xl:flex" : "hidden 2xl:flex"}>
                {list}
              </div>
              {thread}
              {evidence}
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1">
            {look.rail !== undefined && <IconRail kind={look.rail} />}
            <div className={aside === undefined ? "hidden xl:flex" : "hidden 2xl:flex"}>{list}</div>
            {thread}
            {evidence}
          </div>
        )}
      </div>
    </MotionConfig>
  );
}

/** The chat list column: header, search, the open conversation, and blank rows for the rest. */
function ChatList({
  look,
  title,
  tabs,
  active,
}: {
  look: DesktopLook;
  title: string;
  tabs?: string[];
  active: ReactNode;
}) {
  const t = useT();
  return (
    <aside className={cn("flex w-[340px] shrink-0 flex-col", look.sidebar)}>
      <div className="flex h-16 shrink-0 items-center gap-3 px-4">
        {look.sidebarTitle === "sr-only" && (
          <Menu aria-hidden className="size-5 shrink-0 text-[#707579]" />
        )}
        <h2 className={cn("flex-1", look.sidebarTitle)}>{title}</h2>
        {look.sidebarTitle !== "sr-only" && (
          <span aria-hidden className="flex items-center gap-4 text-black/60">
            {look.topNav === true ? (
              <MoreHorizontal className="size-5" />
            ) : (
              <Plus className="size-5" />
            )}
            <Pencil className="size-5" />
          </span>
        )}
      </div>
      <div aria-hidden className="px-3 pb-2">
        <div className={cn("flex h-9 items-center gap-3 px-3 text-sm text-black/50", look.search)}>
          <Search className="size-4" /> {t("desktop.search")}
        </div>
      </div>
      {tabs !== undefined && (
        <div aria-hidden className="flex border-b border-[#e8e8e8] text-sm font-semibold">
          {tabs.map((tab, i) => (
            <span
              key={tab}
              className={cn(
                "px-4 py-2.5",
                i === 0 ? "text-[#01754f] shadow-[inset_0_-2px_0_#01754f]" : "text-black/60",
              )}
            >
              {tab}
            </span>
          ))}
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-hidden">
        <div className={cn("flex items-center gap-3 px-3 py-3", look.activeRow)}>{active}</div>
        {/* Other conversations: blank placeholders, so no extra story is invented. */}
        {[0.7, 0.55, 0.8, 0.6, 0.5, 0.65].map((w, i) => (
          <div key={i} aria-hidden className="flex items-center gap-3 px-3 py-3 opacity-60">
            <span className="size-12 shrink-0 rounded-full bg-black/[0.06]" />
            <span className="flex-1 space-y-2">
              <span className="block h-3 rounded bg-black/[0.07]" style={{ width: `${w * 70}%` }} />
              <span
                className="block h-2.5 rounded bg-black/[0.05]"
                style={{ width: `${w * 100}%` }}
              />
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}

/** A decorative message box under the thread. The player replies through the Dojo panel. */
function Composer({ look, placeholder }: { look: DesktopLook; placeholder: string }) {
  return (
    <div
      aria-hidden
      className={cn("flex shrink-0 items-center gap-3 px-4 py-3 text-black/50", look.composer)}
    >
      <Smile className="size-6 shrink-0" />
      <Paperclip className="size-5 shrink-0" />
      <span className={cn("flex h-10 flex-1 items-center px-4 text-[15px]", look.composerInput)}>
        {placeholder}
      </span>
      {look.topNav === true ? (
        <>
          <ImageIcon className="size-5 shrink-0" />
          <span className="rounded-full bg-black/10 px-4 py-1 text-sm font-semibold text-black/40">
            <Send className="size-4" />
          </span>
        </>
      ) : (
        <Mic className="size-6 shrink-0" />
      )}
    </div>
  );
}

/** Far-left icon column of a messenger or photo app on desktop. Decorative. */
function IconRail({ kind }: { kind: "messenger" | "photo" }) {
  const top: LucideIcon[] =
    kind === "messenger"
      ? [MessageSquareText, CircleDashed, Users]
      : [House, Search, Compass, Clapperboard, Send, Heart, SquarePlus];
  const activeIndex = kind === "messenger" ? 0 : 4;
  return (
    <nav
      aria-hidden
      className={cn(
        "flex shrink-0 flex-col items-center gap-2 py-4",
        kind === "messenger"
          ? "w-16 border-r border-[#d1d7db] bg-[#f0f2f5] text-[#54656f]"
          : "w-[72px] border-r border-[#dbdbdb] bg-white pt-20 text-black",
      )}
    >
      {top.map((Icon, i) => (
        <span
          key={i}
          className={cn(
            "flex size-11 items-center justify-center rounded-full",
            i === activeIndex && (kind === "messenger" ? "bg-[#d9dbdf]" : "font-bold"),
          )}
        >
          <Icon className="size-6" strokeWidth={i === activeIndex ? 2.5 : 2} />
        </span>
      ))}
      <span className="mt-auto flex flex-col items-center gap-3">
        {kind === "messenger" ? <Settings className="size-6" /> : <Menu className="size-6" />}
        <span className="flex size-8 items-center justify-center rounded-full bg-black/10">
          <UserRound className="size-4" />
        </span>
      </span>
    </nav>
  );
}

/** The professional network's global nav: mark, search, and icon tabs with Messaging active. */
function NetworkNav() {
  const t = useT();
  const items: { icon: LucideIcon; label: string; active?: boolean }[] = [
    { icon: House, label: t("desktop.navHome") },
    { icon: Users, label: t("desktop.navNetwork") },
    { icon: BriefcaseBusiness, label: t("desktop.navJobs") },
    { icon: MessageSquareText, label: t("desktop.navMessaging"), active: true },
    { icon: Bell, label: t("desktop.navNotifications") },
  ];
  return (
    <header aria-hidden className="h-[52px] shrink-0 border-b border-black/10 bg-white">
      <div className="mx-auto flex h-full max-w-[1128px] items-center gap-2 px-4 xl:px-0">
        <span className="size-[34px] shrink-0 rounded bg-[#0a66c2]" />
        <span className="flex h-[34px] w-[280px] items-center gap-2 rounded bg-[#edf3f8] px-3 text-sm text-black/60">
          <Search className="size-4" /> {t("desktop.search")}
        </span>
        <nav className="ml-auto flex h-full">
          {items.map(({ icon: Icon, label, active }) => (
            <span
              key={label}
              className={cn(
                "flex w-[80px] flex-col items-center justify-center gap-0.5 text-xs",
                active ? "text-black/90 shadow-[inset_0_-2px_0_rgba(0,0,0,.9)]" : "text-black/60",
              )}
            >
              <Icon className="size-6" />
              <span className="max-w-full truncate px-1">{label}</span>
            </span>
          ))}
          <span className="flex w-[80px] flex-col items-center justify-center gap-0.5 text-xs text-black/60">
            <span className="flex size-6 items-center justify-center rounded-full bg-black/10">
              <UserRound className="size-4" />
            </span>
            {t("desktop.navMe")}
          </span>
        </nav>
      </div>
    </header>
  );
}
