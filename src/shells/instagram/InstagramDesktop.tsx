"use client";

import { useEffect, useRef, type ComponentType, type ReactNode } from "react";
import { MotionConfig } from "motion/react";
import {
  ChevronDown,
  Compass,
  Heart,
  House,
  Image as ImageIcon,
  Info,
  Menu,
  Mic,
  Phone,
  Search,
  Smile,
  SquarePen,
  SquarePlus,
  UserRound,
  Video,
} from "lucide-react";
import { useT } from "@/i18n/hooks";
import { cn } from "@/lib/utils";
import { Avatar, ContactButton } from "../chat-parts";
import type { ShellProps } from "../types";
import { InstagramGlyph, InstagramWordmark, MessengerIcon, ReelsIcon } from "./brand";
import { IG_STYLE, InstagramMessages, useStatusLine } from "./parts";

/**
 * Instagram's web inbox: the side nav with the logo, the conversation list and the open thread.
 * Same props, messages and flagging as every chat shell; choices render into the Dojo panel.
 *
 * Widths (the Dojo panel takes 340 px): the side nav shows the wordmark and labels from 1440 px
 * and collapses to an icon rail with the glyph below that, like Instagram's own; the inbox list
 * shows from xl. With an evidence column open, both wait for more room.
 */
export function InstagramDesktop({
  contact,
  messages,
  typing,
  hint,
  toolbar,
  footer,
  onContactClick,
  aside,
  transition,
}: ShellProps) {
  const t = useT();
  const endRef = useRef<HTMLDivElement>(null);
  const withAside = aside !== undefined;
  const status = useStatusLine(contact);

  // Keep the newest message in view inside the thread's own scroll.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, typing]);

  const thread = (
    <section className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-[75px] shrink-0 items-center gap-3 border-b border-[#dbdbdb] px-4">
        <ContactButton onClick={onContactClick} label={t("chat.viewProfile")(contact.name)}>
          <Avatar
            name={contact.name}
            src={contact.avatar}
            className={IG_STYLE.avatar}
            size="size-11"
          />
          <span className="min-w-0 flex-1 text-left leading-tight">
            <span className="block truncate text-base font-semibold">{contact.name}</span>
            <span className="block truncate text-xs text-[#737373]">{status}</span>
          </span>
        </ContactButton>
        <span aria-hidden className="flex items-center gap-4">
          <Phone className="size-6" strokeWidth={1.75} />
          <Video className="size-7" strokeWidth={1.75} />
          <Info className="size-6" strokeWidth={1.75} />
        </span>
      </header>
      {toolbar}
      <div className="relative min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-1 px-4 pt-4 pb-3">
          <InstagramMessages
            contact={contact}
            messages={messages}
            typing={typing}
            hint={hint}
            transition={transition}
            onContactClick={onContactClick}
            style={{ ...IG_STYLE, bubbleMax: "max-w-[60%]" }}
          />
          <div ref={endRef} />
        </div>
      </div>
      <div aria-hidden className="shrink-0 px-4 pt-1 pb-4">
        <div className="flex h-11 items-center gap-3 rounded-full border border-[#dbdbdb] px-4 text-black">
          <Smile className="size-6 shrink-0" strokeWidth={1.75} />
          <span className="flex-1 truncate text-[15px] text-[#737373]">
            {t("ig.messagePlaceholder")}
          </span>
          <Mic className="size-6 shrink-0" strokeWidth={1.75} />
          <ImageIcon className="size-6 shrink-0" strokeWidth={1.75} />
          <Heart className="size-6 shrink-0" strokeWidth={1.75} />
        </div>
      </div>
      {/* Choices render into the Dojo panel. */}
      {footer}
    </section>
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex h-full min-h-0 flex-1 bg-white text-black">
        <SideNav
          variant="rail"
          className={withAside ? "flex min-[1800px]:hidden" : "flex min-[1440px]:hidden"}
        />
        <SideNav
          variant="wide"
          className={withAside ? "hidden min-[1800px]:flex" : "hidden min-[1440px]:flex"}
        />
        <Inbox
          className={withAside ? "hidden 2xl:flex" : "hidden xl:flex"}
          contactName={contact.name}
          contactAvatar={contact.avatar}
          preview={
            typing
              ? t("chat.typing")()
              : (messages.findLast((m) => m.from !== "system")?.text ?? status)
          }
          fromMe={messages.findLast((m) => m.from !== "system")?.from === "me"}
        />
        {thread}
        {aside !== undefined && (
          <section
            aria-label={aside.label}
            className="w-[380px] shrink-0 overflow-y-auto border-l border-[#dbdbdb] xl:w-[420px]"
          >
            {aside.content}
          </section>
        )}
      </div>
    </MotionConfig>
  );
}

type NavIcon = ComponentType<{ className?: string; strokeWidth?: number }>;

const NAV: {
  key:
    | "ig.navHome"
    | "ig.navSearch"
    | "ig.navExplore"
    | "ig.navReels"
    | "desktop.messages"
    | "ig.navNotifications"
    | "ig.navCreate";
  icon: NavIcon;
}[] = [
  { key: "ig.navHome", icon: House },
  { key: "ig.navSearch", icon: Search },
  { key: "ig.navExplore", icon: Compass },
  { key: "ig.navReels", icon: ReelsIcon },
  { key: "desktop.messages", icon: MessengerIcon },
  { key: "ig.navNotifications", icon: Heart },
  { key: "ig.navCreate", icon: SquarePlus },
];

/** Instagram's left navigation, with Messages active. Decorative. */
function SideNav({ variant, className }: { variant: "rail" | "wide"; className: string }) {
  const t = useT();
  const wide = variant === "wide";
  return (
    <nav
      aria-hidden
      className={cn(
        "shrink-0 flex-col border-r border-[#dbdbdb] bg-white px-3 pt-8 pb-5",
        wide ? "w-[220px]" : "w-[72px] items-center",
        className,
      )}
    >
      <span className={cn("mb-7 flex h-10 items-center", wide ? "px-3" : "justify-center")}>
        {wide ? (
          <InstagramWordmark className="h-[34px] w-auto text-black" />
        ) : (
          <InstagramGlyph className="size-6 text-black" />
        )}
      </span>
      <span className="flex flex-col gap-1">
        {NAV.map(({ key, icon: Icon }) => {
          const active = key === "desktop.messages";
          return (
            <span
              key={key}
              className={cn(
                "flex items-center gap-4 rounded-lg p-3 text-base",
                active ? "font-bold" : "font-normal",
              )}
            >
              {active ? (
                <MessengerIcon className="size-6 shrink-0" filled />
              ) : (
                <Icon className="size-6 shrink-0" strokeWidth={2} />
              )}
              {wide && <span className="truncate">{t(key)}</span>}
            </span>
          );
        })}
        <span className="flex items-center gap-4 rounded-lg p-3 text-base">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#efefef] ring-1 ring-[#dbdbdb]">
            <UserRound className="size-4 text-[#737373]" />
          </span>
          {wide && <span className="truncate">{t("ig.navProfile")}</span>}
        </span>
      </span>
      <span className="mt-auto flex items-center gap-4 rounded-lg p-3 text-base">
        <Menu className="size-6 shrink-0" strokeWidth={2} />
        {wide && <span>{t("ig.navMore")}</span>}
      </span>
    </nav>
  );
}

/** Fictional other conversations: plain everyday chats, so no extra story is invented.
 * Photos: Unsplash License stock images in /public/shells/instagram (see docs/IMAGE_CREDITS.md). */
const OTHER_CHATS = [
  { n: 1, src: "/shells/instagram/inbox-1.jpg", unread: true },
  // The IIMB UG group shows the IIM Bangalore logo (used with permission) on white, so it gets a hairline.
  { n: 2, src: "/shells/instagram/inbox-2.png", unread: false, ring: true },
  { n: 3, src: "/shells/instagram/inbox-3.jpg", unread: false },
  { n: 4, src: "/shells/instagram/inbox-4.jpg", unread: false },
  { n: 5, src: "/shells/instagram/inbox-5.jpg", unread: false },
  { n: 6, src: "/shells/instagram/inbox-6.jpg", unread: false },
  { n: 7, src: "/shells/instagram/inbox-7.jpg", unread: false },
] as const;

/** The conversation list: account switcher, tabs, the open chat and everyday others. Decorative. */
function Inbox({
  className,
  contactName,
  contactAvatar,
  preview,
  fromMe,
}: {
  className: string;
  contactName: string;
  contactAvatar?: string;
  preview: string;
  fromMe: boolean;
}) {
  const t = useT();
  return (
    <aside
      aria-hidden
      className={cn("w-[340px] shrink-0 flex-col border-r border-[#dbdbdb] bg-white", className)}
    >
      <div className="flex h-[75px] shrink-0 items-center px-6 pt-3">
        <span className="flex min-w-0 flex-1 items-center justify-center gap-1.5 pl-6">
          <span className="truncate text-base font-bold">{t("ig.myHandle")}</span>
          <ChevronDown className="size-5 shrink-0" strokeWidth={2} />
        </span>
        <SquarePen className="size-6 shrink-0" strokeWidth={1.75} />
      </div>
      <div className="flex items-center justify-between px-6 pt-2 pb-3 text-base">
        <span className="font-bold">{t("desktop.messages")}</span>
        <span className="text-sm font-semibold text-[#737373]">{t("ig.requests")}</span>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        <InboxRow
          active
          name={contactName}
          avatar={
            <Avatar
              name={contactName}
              src={contactAvatar}
              className="bg-[#dbdbdb] text-[#262626]"
              size="size-14"
            />
          }
          preview={fromMe ? `${t("chat.you")}: ${preview}` : preview}
          time={t("ig.now")}
        />
        {OTHER_CHATS.map((chat) => {
          const { n, src, unread } = chat;
          const name = t(`ig.inbox${n}.name`);
          return (
            <InboxRow
              key={n}
              name={name}
              avatar={
                <Avatar
                  name={name}
                  src={src}
                  className={IG_STYLE.avatar}
                  size={"ring" in chat ? "size-14 ring-1 ring-[#dbdbdb]" : "size-14"}
                />
              }
              preview={t(`ig.inbox${n}.preview`)}
              time={t(`ig.inbox${n}.time`)}
              unread={unread}
            />
          );
        })}
      </div>
    </aside>
  );
}

function InboxRow({
  name,
  avatar,
  preview,
  time,
  active = false,
  unread = false,
}: {
  name: string;
  avatar: ReactNode;
  preview: string;
  time: string;
  active?: boolean;
  unread?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3 px-6 py-2", active && "bg-[#efefef]")}>
      {avatar}
      <span className="min-w-0 flex-1 leading-tight">
        <span className={cn("block truncate text-sm", unread ? "font-bold" : "font-normal")}>
          {name}
        </span>
        <span
          className={cn(
            "mt-1 flex min-w-0 items-baseline text-xs",
            unread ? "font-semibold text-black" : "text-[#737373]",
          )}
        >
          <span className="min-w-0 truncate">{preview}</span>
          <span className="shrink-0 whitespace-pre"> · {time}</span>
        </span>
      </span>
      {unread && <span className="size-2 shrink-0 rounded-full bg-[#0095f6]" />}
    </div>
  );
}
