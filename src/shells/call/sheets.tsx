"use client";

import { useState, type ReactNode } from "react";
import { MotionConfig, motion } from "motion/react";
import { Check, CheckCheck, Flag, IdCard, IndianRupee, Send, ShieldAlert, X } from "lucide-react";
import { useT } from "@/i18n/hooks";
import { cn } from "@/lib/utils";

/** A bottom sheet over the call screen. */
function CallSheet({
  title,
  icon,
  onClose,
  children,
}: {
  title: string;
  icon: ReactNode;
  onClose?: () => void;
  children: ReactNode;
}) {
  const t = useT();
  return (
    <MotionConfig reducedMotion="user">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed inset-0 z-50 flex justify-center"
      >
        <button
          type="button"
          aria-label={t("flag.close")}
          onClick={onClose}
          disabled={onClose === undefined}
          className="absolute inset-0 bg-black/50"
        />
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 34 }}
          className="relative mt-auto w-full max-w-[420px] rounded-t-3xl bg-white p-4 pb-6 text-slate-900 shadow-2xl"
        >
          <div className="mb-3 flex items-center gap-2">
            {icon}
            <h2 className="flex-1 text-base font-semibold">{title}</h2>
            {onClose !== undefined && (
              <button
                type="button"
                onClick={onClose}
                aria-label={t("flag.close")}
                className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100"
              >
                <X className="size-5" aria-hidden />
              </button>
            )}
          </div>
          {children}
        </motion.div>
      </div>
    </MotionConfig>
  );
}

/** The made-up identity card: what the player can say instead of their real details. */
export function PersonaSheet({
  name,
  details,
  onClose,
}: {
  name: string;
  details: { label: string; value: string }[];
  onClose: () => void;
}) {
  const t = useT();
  return (
    <CallSheet
      title={t("call.persona.title")}
      icon={<IdCard className="size-5 text-indigo-700" aria-hidden />}
      onClose={onClose}
    >
      <dl className="divide-y rounded-2xl bg-slate-50 px-4 ring-1 ring-slate-200">
        {[{ label: t("call.persona.name"), value: name }, ...details].map((d) => (
          <div key={d.label} className="flex items-baseline justify-between gap-3 py-2.5">
            <dt className="text-sm text-slate-500">{d.label}</dt>
            <dd className="text-right font-mono text-[15px] font-medium">{d.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-slate-500">{t("call.persona.note")}</p>
    </CallSheet>
  );
}

export type PaymentState = "open" | "paid" | "declined";

/** A payment request the caller pushed to the phone. Paying moves no real money. */
export function PaymentSheet({
  payee,
  amount,
  note,
  state,
  onPay,
  onDecline,
}: {
  payee: string;
  amount: string;
  note?: string;
  state: PaymentState;
  onPay: () => void;
  onDecline: () => void;
}) {
  const t = useT();
  return (
    <CallSheet
      title={t("call.payment.title")}
      icon={<IndianRupee className="size-5 text-emerald-700" aria-hidden />}
    >
      <div className="rounded-2xl bg-slate-50 p-4 text-center ring-1 ring-slate-200">
        <p className="text-xs text-slate-500">{t("call.payment.to")}</p>
        <p className="font-semibold">{payee}</p>
        <p className="mt-2 text-3xl font-bold tabular-nums">{amount}</p>
        {note !== undefined && <p className="mt-1 text-sm text-slate-600">{note}</p>}
      </div>
      {state === "open" ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onDecline}
            className="h-12 rounded-xl border border-slate-300 font-semibold hover:bg-slate-50"
          >
            {t("call.payment.decline")}
          </button>
          <button
            type="button"
            onClick={onPay}
            className="h-12 rounded-xl bg-slate-900 font-semibold text-white hover:bg-slate-800"
          >
            {t("call.payment.pay")(amount)}
          </button>
        </div>
      ) : (
        <p className="mt-4 flex items-center justify-center gap-1.5 font-semibold">
          <Check className="size-5" aria-hidden />
          {t(state === "paid" ? "call.payment.paid" : "call.payment.declined")}
        </p>
      )}
      <p className="mt-3 text-center text-xs text-slate-500">{t("call.payment.sim")}</p>
    </CallSheet>
  );
}

/** Quietly texting someone during the call: the player's message, then their reply. */
export function LifelineSheet({
  name,
  message,
  reply,
  sent,
  replied,
  onSend,
  onClose,
}: {
  name: string;
  message: string;
  reply: string;
  sent: boolean;
  replied: boolean;
  onSend: () => void;
  onClose: () => void;
}) {
  const t = useT();
  return (
    <CallSheet
      title={t("call.lifeline.title")(name)}
      icon={<Send className="size-5 text-emerald-700" aria-hidden />}
      onClose={onClose}
    >
      <div className="flex min-h-40 flex-col gap-2 rounded-2xl bg-stone-100 p-3">
        <div
          className={cn(
            "ml-auto max-w-[85%] rounded-2xl rounded-br-sm px-3 py-2 text-[15px] leading-snug",
            sent
              ? "bg-emerald-100"
              : "border border-dashed border-emerald-400 bg-white text-slate-600",
          )}
        >
          {message}
          {sent && (
            <span className="mt-0.5 flex items-center justify-end gap-1 text-[11px] text-slate-500">
              <CheckCheck className="size-3.5 text-sky-600" aria-hidden /> {t("call.lifeline.sent")}
            </span>
          )}
        </div>
        {sent && !replied && (
          <div className="mr-auto flex gap-1 rounded-2xl rounded-bl-sm bg-white px-3 py-3">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="size-1.5 rounded-full bg-slate-400"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        )}
        {replied && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mr-auto max-w-[85%] rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-[15px] leading-snug"
          >
            <span className="block text-xs font-semibold text-emerald-700">{name}</span>
            {reply}
          </motion.div>
        )}
      </div>
      <button
        type="button"
        onClick={sent ? onClose : onSend}
        className="mt-4 h-12 w-full rounded-xl bg-slate-900 font-semibold text-white hover:bg-slate-800"
      >
        {sent ? t("call.lifeline.close") : t("call.lifeline.send")}
      </button>
    </CallSheet>
  );
}

/**
 * "What's off about what they just said?" during a live call: the caller's last words and the
 * reasons. Like everywhere else in the game, nothing says whether the reason is right.
 */
export function LiveFlagSheet({
  quote,
  reasons,
  onSave,
  onClose,
}: {
  quote: string | undefined;
  reasons: { value: string; label: string }[];
  onSave: (value: string) => void;
  onClose: () => void;
}) {
  const t = useT();
  const [picked, setPicked] = useState<string | undefined>(undefined);
  return (
    <CallSheet
      title={t("call.flag.title")}
      icon={<Flag className="size-5 text-red-600" aria-hidden />}
      onClose={onClose}
    >
      {quote === undefined ? (
        <p className="text-sm text-slate-600">{t("call.flag.nothingYet")}</p>
      ) : (
        <>
          <blockquote className="max-h-28 overflow-y-auto rounded-xl bg-slate-50 px-3 py-2 text-sm leading-snug text-slate-700 italic ring-1 ring-slate-200">
            “{quote}”
          </blockquote>
          <div className="mt-3 flex flex-wrap gap-2">
            {reasons.map((reason) => (
              <button
                key={reason.value}
                type="button"
                aria-pressed={picked === reason.value}
                onClick={() => setPicked(reason.value)}
                className={cn(
                  "min-h-10 rounded-full border px-3.5 text-sm font-medium transition-colors",
                  picked === reason.value
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-300 hover:bg-slate-50",
                )}
              >
                {reason.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={picked === undefined}
            onClick={() => picked !== undefined && onSave(picked)}
            className="mt-4 h-12 w-full rounded-xl bg-red-600 font-semibold text-white hover:bg-red-500 disabled:opacity-40"
          >
            {t("flag.save")}
          </button>
        </>
      )}
    </CallSheet>
  );
}

/** "Report this caller?": blocks the number and reports it, which also hangs up. */
export function ReportSheet({
  number,
  onReport,
  onClose,
}: {
  number: string;
  onReport: () => void;
  onClose: () => void;
}) {
  const t = useT();
  return (
    <CallSheet
      title={t("call.report.title")}
      icon={<ShieldAlert className="size-5 text-red-600" aria-hidden />}
      onClose={onClose}
    >
      <p className="text-sm leading-snug text-slate-700">{t("call.report.body")(number)}</p>
      <p className="mt-2 text-xs text-slate-500">{t("call.report.sim")}</p>
      <button
        type="button"
        onClick={onReport}
        className="mt-4 h-12 w-full rounded-xl bg-red-600 font-semibold text-white hover:bg-red-500"
      >
        {t("call.report.confirm")}
      </button>
      <button
        type="button"
        onClick={onClose}
        className="mt-2 h-11 w-full rounded-xl font-medium text-slate-700 hover:bg-slate-100"
      >
        {t("call.report.cancel")}
      </button>
    </CallSheet>
  );
}
