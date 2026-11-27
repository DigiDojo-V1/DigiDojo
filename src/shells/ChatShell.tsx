"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Camera,
  CheckCheck,
  ChevronLeft,
  EllipsisVertical,
  Flag,
  IndianRupee,
  MessageCircle,
  MessageSquareText,
  MoreHorizontal,
  Phone,
  Send,
  UserRound,
  Video,
  type LucideIcon,
} from "lucide-react";
import type { ThreadApp } from "@/engine/schema";
import { useT } from "@/i18n/hooks";
import { cn } from "@/lib/utils";
import { HighlightableText } from "./HighlightableText";
import { SimulationBar } from "./SimulationBar";
import type {
  AsidePane,
  ChannelTransitionView,
  ChatBubble,
  ShellContact,
  ShellProps,
} from "./types";
import { VoiceNote, type VoiceNoteTone } from "./VoiceNote";

export type ChatTheme = "whatsapp" | "telegram" | "instagram" | "linkedin";

interface ThemeStyle {
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
  /** "tail": a pointed corner on the sender's side. "round": soft pills with no shadow. */
  bubble: "tail" | "round";
  /** Show the contact's small avatar beside the last message of each run of theirs. */
  themAvatar: boolean;
  /** Ring around the header avatar, like an active story. */
  avatarRing?: string;
  /** Icons on the right of the header. */
  headerIcons: "call-more" | "call-video";
  /** Voice notes in other people's bubbles and in yours. */
  voiceThem: VoiceNoteTone;
  voiceMe: VoiceNoteTone;
}

const NEUTRAL_VOICE: VoiceNoteTone = {
  button: "bg-neutral-800 text-white",
  played: "bg-neutral-800",
  idle: "bg-neutral-300",
  muted: "text-neutral-500",
};

/** Our own simple palettes. Not copies of the real apps' branding. */
const THEMES: Record<ChatTheme, ThemeStyle> = {
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
    bubble: "tail",
    themAvatar: false,
    headerIcons: "call-more",
    voiceThem: {
      button: "bg-emerald-600 text-white",
      played: "bg-emerald-600",
      idle: "bg-neutral-300",
      muted: "text-neutral-500",
    },
    voiceMe: {
      button: "bg-emerald-700 text-white",
      played: "bg-emerald-700",
      idle: "bg-emerald-300",
      muted: "text-emerald-800/70",
    },
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
    bubble: "tail",
    themAvatar: false,
    headerIcons: "call-more",
    voiceThem: {
      button: "bg-sky-600 text-white",
      played: "bg-sky-600",
      idle: "bg-sky-200",
      muted: "text-neutral-500",
    },
    voiceMe: {
      button: "bg-sky-700 text-white",
      played: "bg-sky-700",
      idle: "bg-sky-300",
      muted: "text-sky-800/70",
    },
  },
  instagram: {
    layout: "bubbles",
    header: "border-b border-neutral-200 bg-white text-neutral-900",
    headerMuted: "text-neutral-500",
    avatar: "bg-violet-100 text-violet-800",
    wallpaper: "bg-white",
    them: "bg-neutral-100 text-neutral-900",
    me: "bg-violet-600 text-white",
    system: "text-neutral-500",
    sender: "text-neutral-500",
    bubble: "round",
    themAvatar: true,
    avatarRing: "ring-2 ring-violet-500 ring-offset-2 ring-offset-white",
    headerIcons: "call-video",
    voiceThem: {
      button: "bg-violet-600 text-white",
      played: "bg-violet-600",
      idle: "bg-neutral-300",
      muted: "text-neutral-500",
    },
    voiceMe: {
      button: "bg-white text-violet-700",
      played: "bg-white",
      idle: "bg-white/40",
      muted: "text-violet-100",
    },
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
    bubble: "tail",
    themAvatar: false,
    headerIcons: "call-more",
    voiceThem: NEUTRAL_VOICE,
    voiceMe: NEUTRAL_VOICE,
  },
};

export function ChatShell({
  theme,
  contact,
  messages,
  typing,
  typingSender,
  backHref,
  hint,
  toolbar,
  footer,
  onContactClick,
  aside,
  transition,
}: ShellProps & { theme: ChatTheme }) {
  const t = THEMES[theme];
  const tr = useT();
  const endRef = useRef<HTMLDivElement>(null);
  const hasFooter = footer !== undefined;
  const [pane, setPane] = useState<"messages" | "aside">("messages");
  const scrollByPane = useRef({ messages: 0, aside: 0 });

  // Keep the newest message (or the choices) in view.
  useEffect(() => {
    if (pane !== "messages") return;
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, typing, hasFooter, pane]);

  // Each pane keeps its own scroll position.
  useLayoutEffect(() => {
    window.scrollTo({ top: scrollByPane.current[pane] });
  }, [pane]);
  const switchPane = (next: "messages" | "aside") => {
    if (next === pane) return;
    scrollByPane.current[pane] = window.scrollY;
    setPane(next);
  };

  const cards = t.layout === "cards";
  const header = (
    <header className={cn("flex h-14 items-center gap-2 px-2", t.header)}>
      <Link
        href={backHref}
        aria-label={tr("nav.back")}
        className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-black/10"
      >
        <ChevronLeft className="size-5" />
      </Link>
      <ContactButton onClick={onContactClick} label={tr("chat.viewProfile")(contact.name)}>
        <Avatar
          name={contact.name}
          src={contact.avatar}
          className={cn(t.avatar, t.avatarRing)}
          size={t.avatarRing === undefined ? "size-9" : "size-8"}
        />
        <div className="min-w-0 flex-1 text-left leading-tight">
          <div className="truncate text-[15px] font-semibold">{contact.name}</div>
          <div className={cn("truncate text-xs", t.headerMuted)}>
            {typing ? tr("chat.typing")(typingSender) : contact.subtitle}
          </div>
        </div>
      </ContactButton>
      {cards ? (
        <MoreHorizontal className="mr-2 size-5 shrink-0 opacity-70" aria-hidden />
      ) : t.headerIcons === "call-video" ? (
        <div className="mr-1 flex shrink-0 items-center gap-4">
          <Phone className="size-5" strokeWidth={1.75} aria-label={tr("chat.call")} />
          <Video className="size-6" strokeWidth={1.75} aria-label={tr("chat.videoCall")} />
        </div>
      ) : (
        <>
          <Phone className="size-5 shrink-0 opacity-80" aria-hidden />
          <EllipsisVertical className="size-5 shrink-0 opacity-80" aria-hidden />
        </>
      )}
    </header>
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className={cn("flex min-h-dvh flex-col", t.wallpaper)}>
        <div className="sticky top-0 z-40">
          <SimulationBar />
          {header}
          {aside === undefined ? (
            toolbar
          ) : (
            <PaneSwitch pane={pane} aside={aside} onSwitch={switchPane} />
          )}
        </div>

        <div hidden={pane !== "messages"} className="flex flex-1 flex-col">
          <div className={cn("flex flex-1 flex-col px-3 pt-4 pb-3", cards ? "gap-3" : "gap-1.5")}>
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
                    style={t}
                  />
                ) : (
                  <Bubble
                    key={m.id}
                    message={m}
                    next={messages[i + 1]}
                    lastShown={i === messages.length - 1 && !typing}
                    contact={contact}
                    style={t}
                  />
                ),
              )}
              {typing &&
                (cards ? (
                  <CardTyping key="typing" name={typingSender ?? contact.name} style={t} />
                ) : (
                  <TypingIndicator key="typing" style={t} contact={contact} />
                ))}
            </AnimatePresence>
          </div>
        </div>

        {aside !== undefined && (
          <div hidden={pane !== "aside"} className="flex-1">
            {aside.content}
          </div>
        )}

        {footer}
        <div ref={endRef} />
      </div>
    </MotionConfig>
  );
}

/** The header's contact: a button when there's a profile to open, plain otherwise. */
function ContactButton({
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

/** "Messages | Recruiter & company" switch for the split layout. */
function PaneSwitch({
  pane,
  aside,
  onSwitch,
}: {
  pane: "messages" | "aside";
  aside: AsidePane;
  onSwitch: (pane: "messages" | "aside") => void;
}) {
  const t = useT();
  const options = [
    { id: "messages" as const, label: t("split.messages"), badge: 0 },
    { id: "aside" as const, label: aside.label, badge: aside.flaggedCount },
  ];
  return (
    <div className="border-b border-slate-200 bg-white px-3 py-2">
      <div role="group" className="grid grid-cols-2 gap-1 rounded-full bg-slate-100 p-1">
        {options.map((option) => {
          const active = option.id === pane;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() => onSwitch(option.id)}
              className={cn(
                "flex h-10 items-center justify-center gap-1.5 rounded-full px-2 text-[13px] font-semibold transition-colors",
                active ? "bg-white text-indigo-800 shadow-sm" : "text-slate-600",
              )}
            >
              <span className="truncate">{option.label}</span>
              {option.badge > 0 && (
                <span
                  className="flex items-center gap-0.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] leading-none text-white"
                  aria-label={t("split.flaggedBadge")(option.badge)}
                >
                  <Flag className="size-2.5" aria-hidden />
                  {option.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
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
function TransitionCard({ transition }: { transition: ChannelTransitionView }) {
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

function Avatar({
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
function MessageText({ message }: { message: ChatBubble }) {
  if (!message.flaggable) return <span className="whitespace-pre-line">{message.text}</span>;
  return <HighlightableText targetId={message.id} text={message.text} />;
}

/** The message as text, or as a voice note with its transcript. */
function MessageBody({ message, tone }: { message: ChatBubble; tone: VoiceNoteTone }) {
  if (message.voiceNote === undefined) return <MessageText message={message} />;
  return (
    <VoiceNote
      id={message.id}
      durationSec={message.voiceNote.durationSec}
      speech={message.text}
      transcript={<MessageText message={message} />}
      tone={tone}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Cards layout: name and time above each message, like a work inbox   */
/* ------------------------------------------------------------------ */

function MessageCard({
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
          <MessageBody message={message} tone={isMe ? style.voiceMe : style.voiceThem} />
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

function CardTyping({ name, style }: { name: string; style: ThemeStyle }) {
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

function Bubble({
  message,
  next,
  lastShown,
  contact,
  style,
}: {
  message: ChatBubble;
  next: ChatBubble | undefined;
  /** Nothing comes after it yet (no later message, no typing indicator). */
  lastShown: boolean;
  contact: ShellContact;
  style: ThemeStyle;
}) {
  const isMe = message.from === "me";
  const isSystem = message.from === "system";
  const round = style.bubble === "round";

  const body = (
    <>
      {message.sender !== undefined && !isMe && !isSystem && (
        <span className={cn("mb-0.5 block text-xs font-semibold", style.sender)}>
          {message.sender}
        </span>
      )}
      <MessageBody message={message} tone={isMe ? style.voiceMe : style.voiceThem} />
    </>
  );

  const bubbleClass = cn(
    "relative max-w-[80%] px-3 py-2 text-left text-[15px] leading-snug",
    !round && "shadow-sm",
    isSystem
      ? cn(
          "mx-auto text-center text-[13px] font-medium",
          round ? "max-w-[90%] px-2 py-1 text-xs" : "rounded-lg",
          style.system,
        )
      : isMe
        ? cn("ml-auto", round ? "rounded-[22px] px-3.5" : "rounded-2xl rounded-br-sm", style.me)
        : cn(round ? "rounded-[22px] px-3.5" : "mr-auto rounded-2xl rounded-bl-sm", style.them),
  );

  // Themes with a side avatar show it once, beside the last message of a run.
  const withAvatar = style.themAvatar && !isMe && !isSystem;
  const endsRun = next === undefined ? lastShown : next.from !== message.from;

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18 }}
      className={cn("flex", withAvatar && "items-end gap-2")}
    >
      {withAvatar && (
        <span className={cn("size-7 shrink-0", !endsRun && "invisible")}>
          <Avatar name={contact.name} src={contact.avatar} className={style.avatar} size="size-7" />
        </span>
      )}
      <div className={bubbleClass}>{body}</div>
    </motion.div>
  );
}

function TypingIndicator({ style, contact }: { style: ThemeStyle; contact: ShellContact }) {
  const t = useT();
  const round = style.bubble === "round";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className={cn("mr-auto", style.themAvatar && "flex items-end gap-2")}
      aria-label={t("chat.typingAria")}
    >
      {style.themAvatar && (
        <Avatar name={contact.name} src={contact.avatar} className={style.avatar} size="size-7" />
      )}
      <TypingDots
        className={cn(
          "px-3 py-3",
          round ? "rounded-[22px] px-4" : "rounded-2xl rounded-bl-sm shadow-sm",
          style.them,
        )}
      />
    </motion.div>
  );
}

function TypingDots({ className }: { className: string }) {
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
