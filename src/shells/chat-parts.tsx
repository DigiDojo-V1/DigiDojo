"use client";

import { type ReactNode } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Camera,
  CheckCheck,
  IndianRupee,
  MessageCircle,
  MessageSquareText,
  Phone,
  Send,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { ThreadApp } from "@/engine/schema";
import { useT } from "@/i18n/hooks";
import { cn } from "@/lib/utils";
import { HighlightableText } from "./HighlightableText";
import type { ChannelTransitionView, ChatBubble } from "./types";

/* Pieces shared by the phone and desktop layouts of ChatShell. */

export type ChatTheme = "whatsapp" | "telegram" | "instagram" | "linkedin";

export interface ThemeStyle {
  /** "bubbles": a messaging app. "cards": a professional network inbox (name and time above each message). */
  layout: "bubbles" | "cards";
  header: string;
  headerMuted: string;
  avatar: string;
  wallpaper: string;
  them: string;
  me: string;
  system: string;
  sender: string;
  /** Widest a bubble may get. Defaults to 80% (phones). */
  bubbleMax?: string;
}

/** Our own simple palettes. Not copies of the real apps' branding. */
export const THEMES: Record<ChatTheme, ThemeStyle> = {
  whatsapp: {
    layout: "bubbles",
    header: "bg-emerald-700 text-white",
    headerMuted: "text-emerald-100",
    avatar: "bg-emerald-200 text-emerald-900",
    wallpaper: "bg-stone-100",
    them: "bg-white text-neutral-900",
    me: "bg-emerald-100 text-neutral-900",
    system: "bg-amber-50 text-amber-900",
    sender: "text-emerald-700",
  },
  telegram: {
    layout: "bubbles",
    header: "bg-sky-600 text-white",
    headerMuted: "text-sky-100",
    avatar: "bg-sky-200 text-sky-900",
    wallpaper: "bg-sky-50",
    them: "bg-white text-neutral-900",
    me: "bg-sky-100 text-neutral-900",
    system: "bg-sky-900/10 text-sky-950",
    sender: "text-sky-700",
  },
  instagram: {
    layout: "bubbles",
    header: "border-b bg-white text-neutral-900",
    headerMuted: "text-neutral-500",
    avatar: "bg-violet-200 text-violet-900",
    wallpaper: "bg-white",
    them: "bg-neutral-100 text-neutral-900",
    me: "bg-violet-600 text-white",
    system: "bg-neutral-100 text-neutral-600",
    sender: "text-violet-700",
  },
  linkedin: {
    layout: "cards",
    header: "border-b border-slate-200 bg-white text-slate-900",
    headerMuted: "text-slate-500",
    avatar: "bg-indigo-100 text-indigo-800",
    wallpaper: "bg-slate-100",
    them: "bg-white text-slate-900 ring-1 ring-slate-200",
    me: "bg-indigo-50 text-slate-900 ring-1 ring-indigo-100",
    system: "text-slate-500",
    sender: "text-slate-900",
  },
};

/** The header's contact: a button when there's a profile to open, plain otherwise. */
export function ContactButton({
  onClick,
  label,
  children,
}: {
  onClick?: () => void;
  label: string;
  children: ReactNode;
}) {
  const className = "flex min-h-11 min-w-0 flex-1 items-center gap-2.5 rounded-lg px-1";
  if (onClick === undefined) return <div className={className}>{children}</div>;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(className, "hover:bg-black/5")}
    >
      {children}
    </button>
  );
}

const CHANNEL_ICON: Record<ThreadApp, LucideIcon> = {
  linkedin: BriefcaseBusiness,
  whatsapp: MessageCircle,
  telegram: Send,
  instagram: Camera,
  sms: MessageSquareText,
  upi: IndianRupee,
  call: Phone,
};

/** "Conversation moved": the chat left one app for another. */
export function TransitionCard({ transition }: { transition: ChannelTransitionView }) {
  const t = useT();
  const From = CHANNEL_ICON[transition.fromApp];
  const To = CHANNEL_ICON[transition.toApp];
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      role="note"
      className="mx-auto mb-2 w-[88%] rounded-xl bg-white/95 p-3 text-center shadow-sm ring-1 ring-black/5"
    >
      <div className="flex items-center justify-center gap-2 text-neutral-600" aria-hidden>
        <span className="flex size-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-800">
          <From className="size-4" />
        </span>
        <ArrowRight className="size-4" />
        <span className="flex size-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
          <To className="size-4" />
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold text-neutral-900">{t("transition.title")}</p>
      <p className="mt-0.5 text-xs leading-snug text-neutral-600">
        {t("transition.body")(
          transition.fromName,
          t(`channel.${transition.fromApp}`),
          t(`channel.${transition.toApp}`),
        )}
      </p>
    </motion.div>
  );
}

export function Avatar({
  name,
  src,
  className,
  size = "size-9",
}: {
  name: string;
  src?: string;
  className: string;
  size?: string;
}) {
  if (src !== undefined) {
    // Scenario avatars are local files in /public, so a plain img is fine here.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={cn(size, "shrink-0 rounded-full object-cover")} />;
  }
  return (
    <div
      aria-hidden
      className={cn(
        size,
        "flex shrink-0 items-center justify-center rounded-full text-sm font-semibold",
        className,
      )}
    >
      {name.trim().charAt(0).toUpperCase()}
    </div>
  );
}

/** The message's text. Other people's messages can be highlighted word by word. */
export function MessageText({ message }: { message: ChatBubble }) {
  if (!message.flaggable) return <span className="whitespace-pre-line">{message.text}</span>;
  return <HighlightableText targetId={message.id} text={message.text} />;
}

/* ------------------------------------------------------------------ */
/* Cards layout: name and time above each message, like a work inbox   */
/* ------------------------------------------------------------------ */

export function MessageCard({
  message,
  previous,
  contactName,
  contactAvatar,
  style,
}: {
  message: ChatBubble;
  previous: ChatBubble | undefined;
  contactName: string;
  contactAvatar?: string;
  style: ThemeStyle;
}) {
  const t = useT();

  if (message.from === "system") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="my-1 flex items-center gap-3"
        role="separator"
        aria-label={message.text}
      >
        <span className="h-px flex-1 bg-slate-300" />
        <span className={cn("text-[11px] font-semibold tracking-wide uppercase", style.system)}>
          {message.text}
        </span>
        <span className="h-px flex-1 bg-slate-300" />
      </motion.div>
    );
  }

  const isMe = message.from === "me";
  const name = isMe ? t("chat.you") : (message.sender ?? contactName);
  // Consecutive messages from the same person share one name line.
  const continued =
    previous !== undefined &&
    previous.from === message.from &&
    previous.sender === message.sender &&
    message.time === undefined;

  const cardClass = cn(
    "relative block w-full rounded-xl px-3.5 py-2.5 text-left text-[15px] leading-relaxed shadow-sm",
    isMe ? style.me : style.them,
  );

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="flex flex-col gap-1.5"
    >
      {!continued && (
        <div className="flex items-center gap-2.5">
          {isMe ? (
            <span
              aria-hidden
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-700 text-white"
            >
              <UserRound className="size-5" />
            </span>
          ) : (
            <Avatar name={name} src={contactAvatar} className={style.avatar} size="size-10" />
          )}
          <span className="min-w-0 truncate text-sm font-semibold text-slate-900">{name}</span>
          {message.time !== undefined && (
            <span className="shrink-0 text-xs text-slate-500">· {message.time}</span>
          )}
        </div>
      )}
      <div className="pl-12">
        <div className={cardClass}>
          <MessageText message={message} />
        </div>
        {isMe && (
          <p className="mt-1 flex items-center justify-end gap-1 text-[11px] text-slate-500">
            <CheckCheck className="size-3.5 text-indigo-700" aria-hidden /> {t("chat.sent")}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export function CardTyping({ name, style }: { name: string; style: ThemeStyle }) {
  const t = useT();
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="flex items-center gap-2.5"
      aria-label={t("chat.typingAria")}
    >
      <Avatar name={name} className={style.avatar} size="size-10" />
      <TypingDots className={cn("rounded-xl px-3 py-3 shadow-sm", style.them)} />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Bubbles layout: a messaging app                                     */
/* ------------------------------------------------------------------ */

export function Bubble({ message, style }: { message: ChatBubble; style: ThemeStyle }) {
  const isMe = message.from === "me";
  const isSystem = message.from === "system";

  const body = (
    <>
      {message.sender !== undefined && !isMe && !isSystem && (
        <span className={cn("mb-0.5 block text-xs font-semibold", style.sender)}>
          {message.sender}
        </span>
      )}
      <MessageText message={message} />
    </>
  );

  const bubbleClass = cn(
    "relative px-3 py-2 text-left text-[15px] leading-snug shadow-sm",
    style.bubbleMax ?? "max-w-[80%]",
    isSystem
      ? cn("mx-auto rounded-lg text-center text-[13px] font-medium", style.system)
      : isMe
        ? cn("ml-auto rounded-2xl rounded-br-sm", style.me)
        : cn("mr-auto rounded-2xl rounded-bl-sm", style.them),
  );

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18 }}
      className="flex"
    >
      <div className={bubbleClass}>{body}</div>
    </motion.div>
  );
}

export function TypingIndicator({ className }: { className: string }) {
  const t = useT();
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="mr-auto"
      aria-label={t("chat.typingAria")}
    >
      <TypingDots className={cn("rounded-2xl rounded-bl-sm px-3 py-3 shadow-sm", className)} />
    </motion.div>
  );
}

export function TypingDots({ className }: { className: string }) {
  return (
    <div className={cn("flex gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-neutral-400"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}
