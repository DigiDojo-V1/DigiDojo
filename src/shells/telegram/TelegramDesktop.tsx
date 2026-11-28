"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { MotionConfig } from "motion/react";
import {
  BadgeCheck,
  Bookmark,
  CheckCheck,
  EllipsisVertical,
  Menu,
  Mic,
  Paperclip,
  Pencil,
  Phone,
  Search,
  Smile,
  type LucideIcon,
} from "lucide-react";
import { useT } from "@/i18n/hooks";
import { cn } from "@/lib/utils";
import { ContactButton } from "../chat-parts";
import type { ShellProps } from "../types";
import { BubbleTail, TELEGRAM_WALLPAPER, TelegramAvatar, TelegramLogo } from "./brand";
import { TelegramMessages, TelegramStatus, isGroupChat, useMessageTime } from "./parts";

/**
 * Telegram Web: the chat list on the left, the open chat on the wallpaper with the floating
 * message box, and the evidence column on the right. Same props, messages and flagging as every
 * chat shell; choices render into the Dojo panel.
 *
 * Widths (the Dojo panel takes 340 px): the chat list shows from xl, or 2xl with evidence open.
 */
export function TelegramDesktop({
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
}: ShellProps) {
  const t = useT();
  const timeOf = useMessageTime();
  const endRef = useRef<HTMLDivElement>(null);
  const group = isGroupChat(messages);

  // Keep the newest message in view inside the thread's own scroll.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, typing]);

  const lastIndex = messages.findLastIndex((m) => m.from !== "system");
  const last = messages[lastIndex];
  const headerIcons: LucideIcon[] = group
    ? [Search, EllipsisVertical]
    : [Phone, Search, EllipsisVertical];

  const thread = (
    <section className="flex min-w-0 flex-1 flex-col">
      <header className="relative z-10 flex h-14 shrink-0 items-center gap-3 border-b border-[#dadce0] bg-white pr-3 pl-4">
        <ContactButton onClick={onContactClick} label={t("chat.viewProfile")(contact.name)}>
          <TelegramAvatar
            name={contact.name}
            src={contact.avatar}
            size="size-10"
            text="text-base"
          />
          <span className="min-w-0 flex-1 text-left leading-tight">
            <span className="block truncate text-base font-semibold">{contact.name}</span>
            <TelegramStatus
              contact={contact}
              typing={typing}
              typingSender={typingSender}
              className="mt-0.5 text-sm"
            />
          </span>
        </ContactButton>
        <span aria-hidden className="flex items-center gap-1 text-[#707579]">
          {headerIcons.map((Icon, i) => (
            <span key={i} className="flex size-10 items-center justify-center rounded-full">
              <Icon className="size-6" strokeWidth={1.75} />
            </span>
          ))}
        </span>
      </header>
      {toolbar}
      <div className="flex min-h-0 flex-1 flex-col" style={TELEGRAM_WALLPAPER}>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-[760px] flex-col px-4 pt-4 pb-3">
            <TelegramMessages
              contact={contact}
              messages={messages}
              hint={hint}
              transition={transition}
              desktop
            />
            <div ref={endRef} />
          </div>
        </div>
        <Composer />
      </div>
      {/* Choices render into the Dojo panel. */}
      {footer}
    </section>
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex h-full min-h-0 flex-1 bg-white text-black">
        <ChatList
          className={aside === undefined ? "hidden xl:flex" : "hidden 2xl:flex"}
          active={
            <ChatRow
              active
              avatar={
                <TelegramAvatar
                  name={contact.name}
                  src={contact.avatar}
                  size="size-[54px]"
                  text="text-xl"
                />
              }
              name={contact.name}
              time={last === undefined ? "" : timeOf(last, lastIndex)}
              sender={
                typing || last === undefined
                  ? undefined
                  : last.from === "me"
                    ? t("chat.you")
                    : group
                      ? (last.sender ?? contact.name)
                      : undefined
              }
              preview={
                typing ? t("chat.typing")(typingSender) : (last?.text ?? contact.subtitle ?? "")
              }
              sentByMe={!typing && last?.from === "me"}
            />
          }
        />
        {thread}
        {aside !== undefined && (
          <section
            aria-label={aside.label}
            className="w-[380px] shrink-0 overflow-y-auto border-l border-[#dadce0] xl:w-[420px]"
          >
            {aside.content}
          </section>
        )}
      </div>
    </MotionConfig>
  );
}

/** Telegram Web's message box: emoji, "Message", attach, and the round mic button. Decorative. */
function Composer() {
  const t = useT();
  return (
    <div
      aria-hidden
      className="mx-auto flex w-full max-w-[760px] shrink-0 items-end gap-2 px-4 pt-1 pb-5"
    >
      <div className="relative mr-[6px] flex h-14 min-w-0 flex-1 items-center gap-3 rounded-[15px] rounded-br-none bg-white px-4 drop-shadow-[0_1px_1px_rgba(16,35,47,0.16)]">
        <BubbleTail side="right" className="text-white" />
        <Smile className="size-6 shrink-0 text-[#707579]" strokeWidth={1.75} />
        <span className="flex-1 truncate text-base text-[#a2acb4]">
          {t("tg.messagePlaceholder")}
        </span>
        <Paperclip className="size-6 shrink-0 -rotate-45 text-[#707579]" strokeWidth={1.75} />
      </div>
      <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white drop-shadow-[0_1px_1px_rgba(16,35,47,0.16)]">
        <Mic className="size-6 text-[#707579]" strokeWidth={1.75} />
      </span>
    </div>
  );
}

/** Fictional other chats: Telegram's own service chat, Saved Messages and everyday people. */
const OTHER_CHATS = [
  { n: 1, kind: "telegram", unread: 0, muted: false },
  { n: 2, kind: "saved", unread: 0, muted: false },
  { n: 3, kind: "person", unread: 2, muted: false },
  { n: 4, kind: "person", unread: 14, muted: true },
  { n: 5, kind: "person", unread: 0, muted: false, sentByMe: true },
  { n: 6, kind: "person", unread: 5, muted: true },
] as const;

/** The left column: menu, search, the open chat and the others. Decorative. */
function ChatList({ className, active }: { className: string; active: ReactNode }) {
  const t = useT();
  return (
    <aside
      aria-hidden
      className={cn("w-[360px] shrink-0 flex-col border-r border-[#dadce0] bg-white", className)}
    >
      <div className="flex h-14 shrink-0 items-center gap-2 px-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full text-[#707579]">
          <Menu className="size-6" strokeWidth={1.75} />
        </span>
        <span className="flex h-10 flex-1 items-center gap-3 rounded-full bg-[#f4f4f5] px-3 text-base text-[#a2acb4]">
          <Search className="size-5 shrink-0" strokeWidth={2} />
          {t("tg.search")}
        </span>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden px-2 pt-1">
        {active}
        {OTHER_CHATS.map((chat) => {
          const name = t(`tg.chat${chat.n}.name`);
          const avatar =
            chat.kind === "telegram" ? (
              <TelegramLogo className="size-[54px]" />
            ) : chat.kind === "saved" ? (
              <span className="flex size-[54px] shrink-0 items-center justify-center rounded-full bg-[linear-gradient(180deg,#72D5FD,#2A9EF1)] text-white">
                <Bookmark className="size-6 fill-white" />
              </span>
            ) : (
              <TelegramAvatar name={name} size="size-[54px]" text="text-xl" />
            );
          return (
            <ChatRow
              key={chat.n}
              avatar={avatar}
              name={name}
              verified={chat.kind === "telegram"}
              preview={t(`tg.chat${chat.n}.preview`)}
              time={t(`tg.chat${chat.n}.time`)}
              unread={chat.unread}
              muted={chat.muted}
              sentByMe={"sentByMe" in chat}
            />
          );
        })}
        <span className="absolute right-5 bottom-5 flex size-14 items-center justify-center rounded-full bg-[#3390ec] text-white shadow-[0_1px_8px_1px_rgba(0,0,0,0.2)]">
          <Pencil className="size-6" strokeWidth={1.75} />
        </span>
      </div>
    </aside>
  );
}

function ChatRow({
  avatar,
  name,
  preview,
  time,
  sender,
  verified = false,
  unread = 0,
  muted = false,
  sentByMe = false,
  active = false,
}: {
  avatar: ReactNode;
  name: string;
  preview: string;
  time: string;
  sender?: string;
  verified?: boolean;
  unread?: number;
  muted?: boolean;
  sentByMe?: boolean;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-[72px] items-center gap-2.5 rounded-xl px-2",
        active ? "bg-[#3390ec] text-white" : "text-black",
      )}
    >
      {avatar}
      <span className="min-w-0 flex-1 leading-tight">
        <span className="flex items-center gap-1">
          <span className="min-w-0 truncate text-base font-semibold">{name}</span>
          {verified && (
            <BadgeCheck
              className="size-[18px] shrink-0 fill-[#3390ec] text-white"
              strokeWidth={2}
            />
          )}
          <span
            className={cn(
              "ml-auto flex shrink-0 items-center gap-0.5 pl-2 text-xs",
              active ? "text-white" : "text-[#686c72]",
            )}
          >
            {sentByMe && (
              <CheckCheck
                className={cn("size-4", active ? "text-white" : "text-[#4fae4e]")}
                strokeWidth={2}
              />
            )}
            {time}
          </span>
        </span>
        <span className="mt-1 flex items-center gap-2">
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-[15px]",
              active ? "text-white" : "text-[#707579]",
            )}
          >
            {sender !== undefined && (
              <span className={active ? "text-white" : "text-black"}>{sender}: </span>
            )}
            {preview}
          </span>
          {unread > 0 && (
            <span
              className={cn(
                "flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full px-1.5 text-sm font-medium text-white",
                muted ? "bg-[#c4c9cc]" : "bg-[#4fae4e]",
              )}
            >
              {unread}
            </span>
          )}
        </span>
      </span>
    </div>
  );
}
