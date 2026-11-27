"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig } from "motion/react";
import { ChevronLeft, EllipsisVertical, Flag, MoreHorizontal, Phone } from "lucide-react";
import { useT } from "@/i18n/hooks";
import { cn } from "@/lib/utils";
import { ChatDesktop } from "./ChatDesktop";
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
} from "./chat-parts";
import { useInDojoPanel } from "./panel-slot";
import { SimulationBar } from "./SimulationBar";
import type { AsidePane, ShellProps } from "./types";

export type { ChatTheme } from "./chat-parts";

/**
 * A messaging app. Phones: the familiar single-thread layout. Desktop (docked Dojo panel): the
 * app's web layout, with a chat list, the thread and, for split screens, the evidence column.
 */
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
  const docked = useInDojoPanel();
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

  if (docked) {
    return (
      <ChatDesktop
        theme={theme}
        contact={contact}
        messages={messages}
        typing={typing}
        typingSender={typingSender}
        backHref={backHref}
        hint={hint}
        toolbar={toolbar}
        footer={footer}
        onContactClick={onContactClick}
        aside={aside}
        transition={transition}
      />
    );
  }

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
        <Avatar name={contact.name} src={contact.avatar} className={t.avatar} />
        <div className="min-w-0 flex-1 text-left leading-tight">
          <div className="truncate text-[15px] font-semibold">{contact.name}</div>
          <div className={cn("truncate text-xs", t.headerMuted)}>
            {typing ? tr("chat.typing")(typingSender) : contact.subtitle}
          </div>
        </div>
      </ContactButton>
      {cards ? (
        <MoreHorizontal className="mr-2 size-5 shrink-0 opacity-70" aria-hidden />
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
                  <Bubble key={m.id} message={m} style={t} />
                ),
              )}
              {typing &&
                (cards ? (
                  <CardTyping key="typing" name={typingSender ?? contact.name} style={t} />
                ) : (
                  <TypingIndicator key="typing" className={t.them} />
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
