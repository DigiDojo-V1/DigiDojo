"use client";

import { MotionConfig, motion } from "motion/react";
import {
  ChevronLeft,
  Headphones,
  Info,
  Loader2,
  Mic,
  Phone,
  PhoneOff,
  ShieldCheck,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useT } from "@/i18n/hooks";
import { cn } from "@/lib/utils";
import { CallerAvatar, CallFrame } from "./parts";

export interface IncomingCallProps {
  name: string;
  number: string;
  label?: string;
  video: boolean;
  backHref: string;
  /** null while we're still checking whether voice is on. */
  voiceAvailable: boolean | null;
  busy: boolean;
  /** A problem to show above the buttons (mic denied, connection failed). */
  problem?: string;
  onAnswer: () => void;
  onAnswerText: () => void;
  onDecline?: () => void;
}

/** The ringing screen, with what to know before answering a live call. */
export function IncomingCall({
  name,
  number,
  label,
  video,
  backHref,
  voiceAvailable,
  busy,
  problem,
  onAnswer,
  onAnswerText,
  onDecline,
}: IncomingCallProps) {
  const t = useT();
  const AnswerIcon = video ? Video : Phone;
  return (
    <MotionConfig reducedMotion="user">
      <CallFrame>
        <div className="px-2 pt-1">
          <Link
            href={backHref}
            aria-label={t("nav.back")}
            className="flex size-11 items-center justify-center rounded-full text-white/80 hover:bg-white/10"
          >
            <ChevronLeft className="size-5" />
          </Link>
        </div>
        <div className="flex flex-col items-center gap-3 px-4 pt-4 text-center">
          <p className="text-sm tracking-wide text-white/60">
            {t(video ? "call.incomingVideo" : "call.incoming")}
          </p>
          <motion.div
            animate={busy ? undefined : { scale: [1, 1.06, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          >
            <CallerAvatar name={name} />
          </motion.div>
          <div className="leading-tight">
            <p className="text-2xl font-semibold">{name}</p>
            <p className="mt-1 text-sm text-white/60">{number}</p>
            {label !== undefined && <p className="text-xs text-white/50">{label}</p>}
          </div>
        </div>

        <div className="mx-4 mt-6 rounded-2xl bg-white/8 p-4 text-sm ring-1 ring-white/10">
          <p className="mb-2 flex items-center gap-1.5 font-semibold">
            <Info className="size-4" aria-hidden /> {t("call.before.title")}
          </p>
          <ul className="space-y-2 text-white/80">
            <Tip icon={Mic}>{t("call.before.ai")}</Tip>
            <Tip icon={ShieldCheck}>{t("call.before.details")}</Tip>
            <Tip icon={Headphones}>{t("call.before.earphones")}</Tip>
          </ul>
          <p className="mt-3 text-xs text-white/50">{t("call.before.privacy")}</p>
        </div>

        <div className="mt-auto space-y-4 px-6 pt-6 pb-8">
          {(problem !== undefined || voiceAvailable === false) && (
            <p
              role="alert"
              className="rounded-xl bg-amber-400/15 px-3 py-2 text-center text-sm text-amber-100"
            >
              {problem ?? t("call.voiceUnavailable")}
            </p>
          )}
          <div className={cn("flex items-start", onDecline ? "justify-between" : "justify-center")}>
            {onDecline !== undefined && (
              <RingButton
                label={t("call.decline")}
                className="bg-red-600 hover:bg-red-500"
                onClick={onDecline}
                disabled={busy}
              >
                <PhoneOff className="size-7" aria-hidden />
              </RingButton>
            )}
            <RingButton
              label={voiceAvailable === false ? t("call.answer") : t("call.answerVoice")}
              className="bg-emerald-600 hover:bg-emerald-500"
              onClick={onAnswer}
              disabled={busy || voiceAvailable === null}
            >
              {busy ? (
                <Loader2 className="size-7 animate-spin" aria-hidden />
              ) : (
                <AnswerIcon className="size-7" aria-hidden />
              )}
            </RingButton>
          </div>
          {voiceAvailable !== false && (
            <button
              type="button"
              onClick={onAnswerText}
              disabled={busy}
              className="mx-auto block min-h-11 rounded-full px-4 text-sm text-white/70 underline underline-offset-4 hover:text-white disabled:opacity-40"
            >
              {t("call.answerText")}
            </button>
          )}
        </div>
      </CallFrame>
    </MotionConfig>
  );
}

function Tip({ icon: Icon, children }: { icon: typeof Mic; children: string }) {
  return (
    <li className="flex gap-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-white/60" aria-hidden />
      <span>{children}</span>
    </li>
  );
}

function RingButton({
  label,
  className,
  onClick,
  disabled,
  children,
}: {
  label: string;
  className: string;
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-28 flex-col items-center gap-2 text-sm text-white/85 disabled:opacity-50"
    >
      <span
        className={cn(
          "flex size-16 items-center justify-center rounded-full shadow-lg transition active:scale-95",
          className,
        )}
      >
        {children}
      </span>
      <span className="leading-tight">{label}</span>
    </button>
  );
}
