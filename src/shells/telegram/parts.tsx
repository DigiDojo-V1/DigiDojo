"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  CheckCheck,
  EllipsisVertical,
  Flag,
  Mic,
  Paperclip,
  Phone,
  Smile,
} from "lucide-react";
import { useT } from "@/i18n/hooks";
import { cn } from "@/lib/utils";
import { ContactButton, MessageBody, THEMES, TransitionCard } from "../chat-parts";
import type { ChannelTransitionView, ChatBubble, ShellContact } from "../types";
import { BubbleTail, TelegramAvatar, peerNameColor } from "./brand";

/* Pieces of the Telegram chat screen shared by the phone (Android) and desktop (Telegram Web)
 * layouts. Telegram shows typing in the header, not as a bubble, and a time in every bubble. */

const TG = THEMES.telegram;

/** A group chat: other people's messages carry a sender name. */
export function isGroupChat(messages: ChatBubble[]): boolean {
  return messages.some((m) => m.from === "them" && m.sender !== undefined);
}

/** Scenario messages rarely have a time, but Telegram shows one in every bubble. */
const CLOCK_START = 19 * 60 + 42;

/** The time shown in a message: its own, or one a minute after the message before it. */
export function useMessageTime(): (message: ChatBubble | undefined, index: number) => string {
  const t = useT();
  return (message, index) => message?.time ?? t("tg.time")(CLOCK_START + index);
}

/** "1,284 members", "last seen recently", or "Anjali is typing…" in Telegram blue. */
export function TelegramStatus({
  contact,
  typing,
  typingSender,
  className,
}: {
  contact: ShellContact;
  typing: boolean;
  typingSender?: string;
  className?: string;
}) {
  const t = useT();
  return (
    <span className={cn("block truncate", typing ? "text-[#3390ec]" : "text-[#707579]", className)}>
      {typing ? t("chat.typing")(typingSender) : (contact.subtitle ?? t("tg.lastSeenRecently"))}
    </span>
  );
}

/** Telegram's dark translucent pill for dates and service messages. */
const SERVICE_PILL =
  "rounded-full bg-[#5a7f5b]/55 px-2.5 py-0.5 text-center font-medium text-white backdrop-blur-sm " +
  // Flagged words get a light highlight, so keep their text dark.
  "[&_.bg-red-100]:text-red-950 [&_[role=button]:active]:text-red-950 [&_[role=button]:hover]:text-red-950";

/** Date pill, hint, then the bubbles in runs. */
export function TelegramMessages({
  contact,
  messages,
  hint,
  transition,
  desktop = false,
}: {
  contact: ShellContact;
  messages: ChatBubble[];
  hint?: string;
  transition?: ChannelTransitionView;
  desktop?: boolean;
}) {
  const t = useT();
  const timeOf = useMessageTime();
  const group = isGroupChat(messages);

  return (
    <>
      {transition !== undefined && <TransitionCard transition={transition} />}
      <p aria-hidden className={cn("mx-auto mb-1 text-sm", SERVICE_PILL)}>
        {t("tg.today")}
      </p>
      {hint !== undefined && (
        <p className="mx-auto my-1 flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs text-neutral-700">
          <Flag className="size-3" aria-hidden /> {hint}
        </p>
      )}
      <AnimatePresence initial={false}>
        {messages.map((m, i) => (
          <TelegramBubble
            key={m.id}
            message={m}
            previous={messages[i - 1]}
            next={messages[i + 1]}
            time={timeOf(m, i)}
            group={group}
            contact={contact}
            desktop={desktop}
          />
        ))}
      </AnimatePresence>
    </>
  );
}

/** Same sender, one after the other: Telegram draws them as one run. */
function sameRun(a: ChatBubble | undefined, b: ChatBubble | undefined): boolean {
  return (
    a !== undefined &&
    b !== undefined &&
    a.from !== "system" &&
    a.from === b.from &&
    a.sender === b.sender
  );
}

function TelegramBubble({
  message,
  previous,
  next,
  time,
  group,
  contact,
  desktop,
}: {
  message: ChatBubble;
  previous: ChatBubble | undefined;
  next: ChatBubble | undefined;
  time: string;
  group: boolean;
  contact: ShellContact;
  desktop: boolean;
}) {
  const isMe = message.from === "me";
  const enter = {
    initial: { opacity: 0, y: 8, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.18 },
  };

  if (message.from === "system") {
    return (
      <motion.div layout="position" {...enter} className="my-1.5 flex justify-center">
        <div className={cn("max-w-[85%] rounded-2xl text-sm leading-snug", SERVICE_PILL)}>
          <MessageBody message={message} tone={TG.voiceThem} />
        </div>
      </motion.div>
    );
  }

  const first = !sameRun(previous, message);
  const last = !sameRun(message, next);
  const sender = message.sender ?? contact.name;
  // Groups show who's talking: a coloured name on the first bubble, an avatar by the last.
  const showName = group && !isMe && first;
  const avatarColumn = group && !isMe;

  return (
    <motion.div
      layout="position"
      {...enter}
      className={cn("flex items-end", isMe ? "justify-end" : "gap-1.5", first ? "mt-2" : "mt-0.5")}
    >
      {avatarColumn && (
        <span className="w-[34px] shrink-0">
          {last && (
            <TelegramAvatar
              name={sender}
              src={message.sender === undefined ? contact.avatar : undefined}
              size="size-[34px]"
              text="text-[13px]"
            />
          )}
        </span>
      )}
      <div
        className={cn(
          "relative min-w-0 px-2.5 pt-1.5 pb-1.5 text-left text-base leading-[1.3125] text-black",
          "drop-shadow-[0_1px_1px_rgba(16,35,47,0.16)]",
          desktop ? "max-w-[min(480px,78%)]" : "max-w-[85%]",
          isMe ? "bg-[#effdde]" : "bg-white",
          "rounded-[15px]",
          isMe
            ? cn(!first && "rounded-tr-[6px]", last ? "rounded-br-none" : "rounded-br-[6px]")
            : cn(!first && "rounded-tl-[6px]", last ? "rounded-bl-none" : "rounded-bl-[6px]"),
          // Every bubble leaves room for the tail, so a run lines up.
          isMe ? "mr-[6px]" : "ml-[6px]",
        )}
      >
        {last && (
          <BubbleTail
            side={isMe ? "right" : "left"}
            className={isMe ? "text-[#effdde]" : "text-white"}
          />
        )}
        {showName && (
          <span
            className="block truncate text-[15px] leading-tight font-semibold"
            style={{ color: peerNameColor(sender) }}
          >
            {sender}
          </span>
        )}
        <MessageBody message={message} tone={isMe ? TG.voiceMe : TG.voiceThem} />
        {/* Room for the time on the last line, as Telegram wraps text around it. */}
        <span aria-hidden className={cn("inline-block h-3", isMe ? "w-[74px]" : "w-[54px]")} />
        <span
          className={cn(
            "absolute right-2 bottom-1 flex items-center gap-0.5 text-xs leading-none",
            isMe ? "text-[#4fae4e]" : "text-[#686c72]",
          )}
        >
          {time}
          {isMe && <CheckCheck className="size-4" strokeWidth={2} aria-hidden />}
        </span>
      </div>
    </motion.div>
  );
}

/** Android's chat header: back arrow, the chat, and the overflow menu. */
export function TelegramMobileHeader({
  contact,
  group,
  typing,
  typingSender,
  backHref,
  onContactClick,
}: {
  contact: ShellContact;
  group: boolean;
  typing: boolean;
  typingSender?: string;
  backHref: string;
  onContactClick?: () => void;
}) {
  const t = useT();
  return (
    <header className="flex h-14 items-center gap-1 bg-white/90 pr-1 pl-1 text-black shadow-[0_1px_0_rgba(0,0,0,0.06)] backdrop-blur-md">
      <Link
        href={backHref}
        aria-label={t("nav.back")}
        className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-black/5"
      >
        <ArrowLeft className="size-6 text-[#222]" strokeWidth={2} />
      </Link>
      <ContactButton onClick={onContactClick} label={t("chat.viewProfile")(contact.name)}>
        <TelegramAvatar name={contact.name} src={contact.avatar} size="size-10" text="text-base" />
        <span className="min-w-0 flex-1 text-left leading-tight">
          <span className="block truncate text-[17px] font-semibold">{contact.name}</span>
          <TelegramStatus
            contact={contact}
            typing={typing}
            typingSender={typingSender}
            className="mt-0.5 text-sm"
          />
        </span>
      </ContactButton>
      {!group && (
        <span className="flex size-11 shrink-0 items-center justify-center">
          <Phone
            className="size-[22px] text-[#222]"
            strokeWidth={1.75}
            aria-label={t("chat.call")}
          />
        </span>
      )}
      <span className="flex size-11 shrink-0 items-center justify-center">
        <EllipsisVertical className="size-6 text-[#222]" aria-label={t("chat.more")} />
      </span>
    </header>
  );
}

/** Android's floating message box. Decorative: the player replies with the choices. */
export function TelegramMobileComposer() {
  const t = useT();
  return (
    <div aria-hidden className="sticky bottom-0 z-10 flex items-center gap-2 px-2 pt-1 pb-2">
      <div className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-full bg-white/95 px-3 shadow-[0_1px_3px_rgba(16,35,47,0.2)] backdrop-blur">
        <Smile className="size-6 shrink-0 text-[#8a8f94]" strokeWidth={1.75} />
        <span className="flex-1 truncate text-[17px] text-[#9aa1a7]">
          {t("tg.messagePlaceholder")}
        </span>
        <Paperclip className="size-6 shrink-0 -rotate-45 text-[#8a8f94]" strokeWidth={1.75} />
      </div>
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/95 shadow-[0_1px_3px_rgba(16,35,47,0.2)] backdrop-blur">
        <Mic className="size-6 text-[#8a8f94]" strokeWidth={1.75} />
      </span>
    </div>
  );
}
