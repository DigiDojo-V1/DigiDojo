"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Mic, Play, Square } from "lucide-react";
import { useT } from "@/i18n/hooks";
import { cn } from "@/lib/utils";

/** Colours for one chat theme, so a voice note fits the bubble it sits in. */
export interface VoiceNoteTone {
  /** The round play button. */
  button: string;
  /** Waveform bars already played. */
  played: string;
  /** Waveform bars still to play. */
  idle: string;
  /** Length and "Transcript" label. */
  muted: string;
}

const BAR_COUNT = 30;
const TICK_MS = 100;

/** "0:07", "1:05". */
export function formatVoiceLength(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Bar heights (0.25 to 1) that look like speech, the same on every render for one note. */
export function waveform(seed: string, count = BAR_COUNT): number[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    h = Math.imul(h ^ (h >>> 15), 2246822507) ^ i;
    const noise = ((h >>> 0) % 1000) / 1000;
    // Louder in the middle of a phrase, quieter at the ends.
    const envelope = Math.sin((Math.PI * (i + 0.5)) / count);
    bars.push(Math.round((0.25 + 0.75 * (0.35 * envelope + 0.65 * noise)) * 100) / 100);
  }
  return bars;
}

function speechAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * A voice note in a chat bubble. Play reads the transcript aloud with the browser's own
 * speech voice, when it has one, and moves the waveform along. There is no recording: the
 * point of the lesson is that a familiar voice proves nothing.
 */
export function VoiceNote({
  id,
  durationSec,
  speech,
  transcript,
  tone,
}: {
  id: string;
  durationSec: number;
  /** What the speech voice reads, in the player's language. */
  speech: string;
  /** The highlightable transcript. */
  transcript: ReactNode;
  tone: VoiceNoteTone;
}) {
  const t = useT();
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const spoke = useRef(false);
  const bars = waveform(id);
  const total = durationSec * 1000;
  const progress = Math.min(1, elapsed / total);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setElapsed((ms) => {
        const next = ms + TICK_MS;
        if (next >= total) setPlaying(false);
        return Math.min(next, total);
      });
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [playing, total]);

  // Stop talking when the note leaves the screen.
  useEffect(
    () => () => {
      if (spoke.current && speechAvailable()) window.speechSynthesis.cancel();
    },
    [],
  );

  const stop = () => {
    setPlaying(false);
    setElapsed(0);
    if (spoke.current && speechAvailable()) window.speechSynthesis.cancel();
  };

  const play = () => {
    setElapsed(0);
    setPlaying(true);
    if (!speechAvailable()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(speech);
    utterance.lang = "en-IN";
    utterance.rate = 1.05;
    // The bar follows the voice when it finishes first.
    utterance.onend = () => {
      setPlaying(false);
      setElapsed(total);
    };
    spoke.current = true;
    window.speechSynthesis.speak(utterance);
  };

  const length = formatVoiceLength(playing || elapsed > 0 ? elapsed / 1000 : durationSec);

  return (
    <div className="flex w-[15.5rem] max-w-full flex-col gap-1.5">
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={playing ? stop : play}
          aria-label={playing ? t("voice.stop") : t("voice.play")}
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full transition-transform active:scale-95",
            tone.button,
          )}
        >
          {playing ? (
            <Square className="size-3.5 fill-current" aria-hidden />
          ) : (
            <Play className="ml-0.5 size-4 fill-current" aria-hidden />
          )}
        </button>
        <div
          className="flex h-8 min-w-0 flex-1 items-center gap-[2px]"
          role="img"
          aria-label={t("voice.label")(formatVoiceLength(durationSec))}
        >
          {bars.map((height, i) => (
            <span
              key={i}
              className={cn(
                "w-[3px] flex-1 rounded-full transition-colors",
                (i + 0.5) / bars.length <= progress ? tone.played : tone.idle,
              )}
              style={{ height: `${height * 100}%` }}
            />
          ))}
        </div>
        <span className={cn("w-9 shrink-0 text-right text-xs tabular-nums", tone.muted)}>
          {length}
        </span>
      </div>
      <div className="flex items-start gap-1.5">
        <Mic className={cn("mt-0.5 size-3.5 shrink-0", tone.muted)} aria-hidden />
        <div className="min-w-0 text-[14px] leading-snug">
          <span className={cn("sr-only")}>{t("voice.transcript")}: </span>
          <span className="italic">{transcript}</span>
        </div>
      </div>
    </div>
  );
}
