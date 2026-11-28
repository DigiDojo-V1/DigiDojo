"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion } from "motion/react";
import { PhoneOff, type LucideIcon } from "lucide-react";
import { useT } from "@/i18n/hooks";
import { cn } from "@/lib/utils";
import { HighlightableText } from "../HighlightableText";
import { PhoneFrame } from "../PhoneFrame";
import { SimulationBar } from "../SimulationBar";

/**
 * Pieces of our own phone-call look, shared by the scripted call shell and the live call screens.
 * A dark screen, the caller in the middle, captions as light cards, round buttons at the bottom.
 */

export function CallFrame({ children, className }: { children: ReactNode; className?: string }) {
  // Calls are phone-only: on desktop they sit in the phone mockup next to the Dojo panel.
  return (
    <PhoneFrame>
      <div
        className={cn(
          "relative flex min-h-dvh flex-col bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 text-white lg:min-h-full",
          className,
        )}
      >
        <div className="sticky top-0 z-40">
          <SimulationBar />
        </div>
        {children}
      </div>
    </PhoneFrame>
  );
}

/**
 * Runs `read` every animation frame and passes the value (0 to 1) to `apply`, without re-rendering.
 * Used to make the caller's avatar pulse with their voice.
 */
export function useAnimationLevel(
  read: (() => number) | undefined,
  apply: (level: number) => void,
) {
  const applyRef = useRef(apply);
  useEffect(() => {
    applyRef.current = apply;
  });
  useEffect(() => {
    if (read === undefined) return;
    let frame = 0;
    let smooth = 0;
    const tick = () => {
      smooth = smooth * 0.7 + Math.min(1, read() * 4) * 0.3;
      applyRef.current(smooth);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [read]);
}

/** The caller's initial in a circle, with a ring that grows with their voice. */
export function CallerAvatar({
  name,
  level,
  size = "lg",
}: {
  name: string;
  level?: () => number;
  size?: "lg" | "sm";
}) {
  const ring = useRef<HTMLSpanElement>(null);
  useAnimationLevel(level, (v) => {
    if (ring.current === null) return;
    ring.current.style.transform = `scale(${1 + v * 0.35})`;
    ring.current.style.opacity = String(0.15 + v * 0.6);
  });
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full",
        size === "lg" ? "size-24" : "size-12",
      )}
    >
      <span
        ref={ring}
        aria-hidden
        className="absolute inset-0 rounded-full bg-sky-400/60 opacity-15 transition-transform duration-75"
      />
      <span
        aria-hidden
        className={cn(
          "relative flex size-full items-center justify-center rounded-full bg-gradient-to-br from-slate-500 to-slate-700 font-semibold ring-1 ring-white/20",
          size === "lg" ? "text-4xl" : "text-lg",
        )}
      >
        {name.trim().charAt(0).toUpperCase()}
      </span>
    </span>
  );
}

export function CallerHeader({
  name,
  number,
  label,
  status,
  level,
  compact = false,
}: {
  name: string;
  number: string;
  label?: string;
  status: ReactNode;
  level?: () => number;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 px-4 py-3">
        <CallerAvatar name={name} level={level} size="sm" />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-lg font-semibold">{name}</p>
          <p className="truncate text-xs text-white/60">
            {number}
            {label !== undefined && ` · ${label}`}
          </p>
        </div>
        <div className="shrink-0 text-sm text-white/70 tabular-nums">{status}</div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-3 px-4 pt-8 pb-4 text-center">
      <CallerAvatar name={name} level={level} />
      <div className="leading-tight">
        <p className="text-2xl font-semibold">{name}</p>
        <p className="mt-1 text-sm text-white/60">{number}</p>
        {label !== undefined && <p className="text-xs text-white/50">{label}</p>}
      </div>
      <div className="text-sm text-white/70 tabular-nums">{status}</div>
    </div>
  );
}

/** A running mm:ss counter from when the call connected. */
export function CallTimer({ since }: { since: number | null }) {
  const t = useT();
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (since === null) return;
    const update = () => {
      if (ref.current !== null) {
        ref.current.textContent = t("call.timer")(Math.floor((Date.now() - since) / 1000));
      }
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [since, t]);
  return <span ref={ref}>{since === null ? "" : t("call.timer")(0)}</span>;
}

/** One caption: what the caller or the player said. Caller lines can be highlighted to flag. */
export function CaptionCard({
  who,
  text,
  targetId,
  youLabel,
  sender,
}: {
  who: "caller" | "player" | "system";
  text: string;
  /** Set to make the words highlightable (scripted calls). */
  targetId?: string;
  youLabel: string;
  sender?: string;
}) {
  if (who === "system") {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto max-w-[90%] rounded-full bg-white/10 px-3 py-1 text-center text-xs text-white/75"
      >
        {text}
      </motion.p>
    );
  }
  const caller = who === "caller";
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={cn("flex flex-col", caller ? "items-start" : "items-end")}
    >
      <span className="mb-0.5 px-1 text-[11px] font-medium text-white/50">
        {caller ? sender : youLabel}
      </span>
      <div
        className={cn(
          "max-w-[88%] rounded-2xl px-3.5 py-2 text-[15px] leading-snug shadow-sm",
          caller
            ? "rounded-tl-sm bg-white text-slate-900"
            : "rounded-tr-sm bg-emerald-600/90 text-white",
        )}
      >
        {targetId !== undefined ? (
          <HighlightableText targetId={targetId} text={text} />
        ) : (
          <span className="whitespace-pre-line">{text}</span>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Something that pops up on the phone mid-call (a text, a file), drawn as a light card so its
 * words can be highlighted and flagged like a caption.
 */
export function NoticeCaption({ text, targetId }: { text: string; targetId?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      role="status"
      className="mx-1 rounded-2xl bg-white/95 px-3.5 py-2.5 text-[14px] leading-snug text-slate-900 shadow-lg ring-1 ring-black/10"
    >
      {targetId !== undefined ? (
        <HighlightableText targetId={targetId} text={text} />
      ) : (
        <span className="whitespace-pre-line">{text}</span>
      )}
    </motion.div>
  );
}

/** Animated bars while the caller is talking. */
export function SpeakingBars({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex h-4 items-end gap-0.5", className)} aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <motion.span
          key={i}
          className="w-1 rounded-full bg-current"
          animate={{ height: ["30%", "100%", "45%", "80%", "30%"] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12 }}
        />
      ))}
    </span>
  );
}

/** A round call control with a label under it. */
export function RoundButton({
  icon: Icon,
  label,
  onClick,
  active = false,
  badge,
  disabled = false,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  active?: boolean;
  badge?: number;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className="flex flex-col items-center gap-1.5 text-xs text-white/80 disabled:opacity-40"
    >
      <span
        className={cn(
          "relative flex size-14 items-center justify-center rounded-full transition-colors",
          active ? "bg-white text-slate-900" : "bg-white/12 hover:bg-white/20",
        )}
      >
        <Icon className="size-6" aria-hidden />
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {badge}
          </span>
        )}
      </span>
      <span className="max-w-[5.5rem] truncate">{label}</span>
    </button>
  );
}

/** The red button. `label` is spoken text for scripted calls ("No. I'm hanging up."). */
export function HangUpButton({ onClick, label }: { onClick: () => void; label?: string }) {
  const t = useT();
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        aria-label={label ?? t("call.hangUp")}
        className="flex size-16 items-center justify-center rounded-full bg-red-600 shadow-lg shadow-red-900/40 transition hover:bg-red-500 active:scale-95"
      >
        <PhoneOff className="size-7" aria-hidden />
      </button>
      {label !== undefined && (
        <span className="max-w-[16rem] text-center text-xs leading-snug text-white/70">
          {label}
        </span>
      )}
    </div>
  );
}
