"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig } from "motion/react";
import { ChevronLeft, Flag, Volume2, VolumeX } from "lucide-react";
import { useLocale, useT } from "@/i18n/hooks";
import type { Locale } from "@/i18n/locale";
import {
  CallerHeader,
  CallFrame,
  CallTimer,
  CaptionCard,
  NoticeCaption,
  SpeakingBars,
} from "./call/parts";
import type { ChatBubble, ShellProps } from "./types";

/** System lines longer than this are drawn as a notification card rather than a status pill. */
const NOTICE_MIN_CHARS = 60;

/**
 * A phone call with reply options: the caller's lines arrive as live captions (and, if the
 * player leaves the voice on, are read aloud by the browser). Caller lines can be highlighted
 * and flagged like any message. `contact.subtitle` is the number on screen.
 */
export function CallShell({
  contact,
  messages,
  typing,
  backHref,
  hint,
  toolbar,
  footer,
}: ShellProps) {
  const t = useT();
  const locale = useLocale();
  const [since] = useState(() => Date.now());
  const [voice, setVoice] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  useSpeakCaptions(messages, voice, locale);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, typing, footer]);

  return (
    <MotionConfig reducedMotion="user">
      <CallFrame>
        <div className="flex items-center justify-between px-2 pt-1">
          <Link
            href={backHref}
            aria-label={t("nav.back")}
            className="flex size-11 items-center justify-center rounded-full text-white/80 hover:bg-white/10"
          >
            <ChevronLeft className="size-5" />
          </Link>
          <button
            type="button"
            onClick={() => setVoice((v) => !v)}
            aria-pressed={voice}
            className="flex h-9 items-center gap-1.5 rounded-full bg-white/10 px-3 text-xs text-white/80 hover:bg-white/15"
          >
            {voice ? (
              <Volume2 className="size-4" aria-hidden />
            ) : (
              <VolumeX className="size-4" aria-hidden />
            )}
            {t(voice ? "call.voiceOn" : "call.voiceOff")}
          </button>
        </div>

        <CallerHeader
          name={contact.name}
          number={contact.subtitle ?? ""}
          compact
          status={
            typing ? (
              <span className="flex items-center gap-1.5 text-sky-300">
                <SpeakingBars /> {t("call.speaking")}
              </span>
            ) : (
              <CallTimer since={since} />
            )
          }
        />
        {toolbar}

        <div className="flex flex-1 flex-col gap-2.5 px-3 pt-3 pb-4">
          {hint !== undefined && (
            <p className="mx-auto mb-1 flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/75">
              <Flag className="size-3" aria-hidden /> {hint}
            </p>
          )}
          <AnimatePresence initial={false}>
            {messages.map((m) =>
              // Long system lines are things arriving on the phone (a text): flaggable cards.
              m.from === "system" && m.text.length > NOTICE_MIN_CHARS ? (
                <NoticeCaption key={m.id} text={m.text} targetId={m.flaggable ? m.id : undefined} />
              ) : (
                <CaptionCard
                  key={m.id}
                  who={m.from === "them" ? "caller" : m.from === "me" ? "player" : "system"}
                  text={m.text}
                  targetId={m.flaggable && m.from === "them" ? m.id : undefined}
                  sender={m.sender ?? contact.name}
                  youLabel={t("call.youSaid")}
                />
              ),
            )}
          </AnimatePresence>
        </div>
        {footer}
        <div ref={endRef} />
      </CallFrame>
    </MotionConfig>
  );
}

/** Reads new caller lines aloud with the browser's own voice, if it has one. */
function useSpeakCaptions(messages: readonly ChatBubble[], enabled: boolean, locale: Locale) {
  // Lines already on screen when the call opens (after a rewind) aren't read again.
  const spoken = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (spoken.current === null) {
      spoken.current = new Set(messages.map((m) => m.id));
      return;
    }
    for (const message of messages) {
      if (spoken.current.has(message.id)) continue;
      spoken.current.add(message.id);
      if (!enabled || message.from !== "them") continue;
      const utterance = new SpeechSynthesisUtterance(message.text);
      utterance.lang = locale === "hinglish" ? "hi-IN" : "en-IN";
      const voice = window.speechSynthesis
        .getVoices()
        .find((v) => v.lang === utterance.lang || v.lang.startsWith("en-IN"));
      if (voice !== undefined) utterance.voice = voice;
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  }, [messages, enabled, locale]);

  useEffect(() => {
    if (!enabled && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, [enabled]);

  useEffect(
    () => () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    },
    [],
  );
}
