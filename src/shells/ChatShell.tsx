"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, EllipsisVertical, Flag, Phone } from "lucide-react";
import { useT } from "@/i18n/hooks";
import { cn } from "@/lib/utils";
import { SimulationBar } from "./SimulationBar";
import type { ChatBubble, ShellProps } from "./types";

export type ChatTheme = "whatsapp" | "telegram" | "instagram";

interface ThemeStyle {
  header: string;
  headerMuted: string;
  avatar: string;
  wallpaper: string;
  them: string;
  me: string;
  system: string;
  sender: string;
}

/** Our own simple palettes. Not copies of the real apps' branding. */
const THEMES: Record<ChatTheme, ThemeStyle> = {
  whatsapp: {
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
    header: "border-b bg-white text-neutral-900",
    headerMuted: "text-neutral-500",
    avatar: "bg-violet-200 text-violet-900",
    wallpaper: "bg-white",
    them: "bg-neutral-100 text-neutral-900",
    me: "bg-violet-600 text-white",
    system: "bg-neutral-100 text-neutral-600",
    sender: "text-violet-700",
  },
};

export function ChatShell({
  theme,
  contact,
  messages,
  typing,
  typingSender,
  flaggedIds,
  onToggleFlag,
  backHref,
  hint,
  footer,
}: ShellProps & { theme: ChatTheme }) {
  const t = THEMES[theme];
  const tr = useT();
  const endRef = useRef<HTMLDivElement>(null);
  const hasFooter = footer !== undefined;

  // Keep the newest message (or the choices) in view.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, typing, hasFooter]);

  return (
    <div className={cn("flex min-h-dvh flex-col", t.wallpaper)}>
      <div className="sticky top-0 z-40">
        <SimulationBar />
        <header className={cn("flex h-14 items-center gap-2 px-2", t.header)}>
          <Link
            href={backHref}
            aria-label={tr("nav.back")}
            className="rounded-full p-1.5 hover:bg-black/10"
          >
            <ChevronLeft className="size-5" />
          </Link>
          <Avatar name={contact.name} src={contact.avatar} className={t.avatar} />
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-[15px] font-semibold">{contact.name}</div>
            <div className={cn("truncate text-xs", t.headerMuted)}>
              {typing ? tr("chat.typing")(typingSender) : contact.subtitle}
            </div>
          </div>
          <Phone className="size-5 shrink-0 opacity-80" aria-hidden />
          <EllipsisVertical className="size-5 shrink-0 opacity-80" aria-hidden />
        </header>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 px-3 pt-4 pb-3">
        {hint !== undefined && (
          <p className="mx-auto mb-2 flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-1 text-xs text-neutral-600">
            <Flag className="size-3" aria-hidden /> {hint}
          </p>
        )}
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <Bubble
              key={m.id}
              message={m}
              style={t}
              flagged={flaggedIds.includes(m.id)}
              onToggleFlag={onToggleFlag}
            />
          ))}
          {typing && <TypingIndicator key="typing" className={t.them} />}
        </AnimatePresence>
      </div>

      {footer}
      <div ref={endRef} />
    </div>
  );
}

function Avatar({ name, src, className }: { name: string; src?: string; className: string }) {
  if (src !== undefined) {
    // Scenario avatars are local files in /public, so a plain img is fine here.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className="size-9 rounded-full object-cover" />;
  }
  return (
    <div
      aria-hidden
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
        className,
      )}
    >
      {name.trim().charAt(0).toUpperCase()}
    </div>
  );
}

function Bubble({
  message,
  style,
  flagged,
  onToggleFlag,
}: {
  message: ChatBubble;
  style: ThemeStyle;
  flagged: boolean;
  onToggleFlag: (id: string) => void;
}) {
  const t = useT();
  const isMe = message.from === "me";
  const isSystem = message.from === "system";

  const body = (
    <>
      {message.sender !== undefined && !isMe && !isSystem && (
        <span className={cn("mb-0.5 block text-xs font-semibold", style.sender)}>
          {message.sender}
        </span>
      )}
      <span className="whitespace-pre-line">{message.text}</span>
      {flagged && (
        <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-red-500 text-white shadow">
          <Flag className="size-3" aria-hidden />
        </span>
      )}
    </>
  );

  const bubbleClass = cn(
    "relative max-w-[80%] px-3 py-2 text-left text-[15px] leading-snug shadow-sm",
    isSystem
      ? cn("mx-auto rounded-lg text-center text-[13px] font-medium", style.system)
      : isMe
        ? cn("ml-auto rounded-2xl rounded-br-sm", style.me)
        : cn("mr-auto rounded-2xl rounded-bl-sm", style.them),
    flagged && "ring-2 ring-red-500 ring-offset-1",
  );

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18 }}
      className="flex"
    >
      {message.flaggable ? (
        <button
          type="button"
          onClick={() => onToggleFlag(message.id)}
          aria-pressed={flagged}
          aria-label={t(flagged ? "chat.unflagAria" : "chat.flagAria")(message.text)}
          className={cn(bubbleClass, "cursor-pointer transition-transform active:scale-[0.98]")}
        >
          {body}
        </button>
      ) : (
        <div className={bubbleClass}>{body}</div>
      )}
    </motion.div>
  );
}

function TypingIndicator({ className }: { className: string }) {
  const t = useT();
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className={cn("mr-auto flex gap-1 rounded-2xl rounded-bl-sm px-3 py-3 shadow-sm", className)}
      aria-label={t("chat.typingAria")}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-neutral-400"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </motion.div>
  );
}
