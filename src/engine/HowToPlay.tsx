"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  CircleCheck,
  CircleX,
  Gavel,
  MousePointerClick,
  RotateCcw,
  Search,
  ShieldAlert,
  ThumbsUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/hooks";
import { LanguageToggle } from "@/i18n/LanguageToggle";
import { cn } from "@/lib/utils";
import { FlagPopover } from "@/shells/FlagPopover";
import {
  HighlightableText,
  HighlightProvider,
  type HighlightMark,
} from "@/shells/HighlightableText";
import { SimulationBadge } from "@/shells/SimulationBadge";
import { sentenceCatches } from "./highlight";
import type { Tactic } from "./schema";

const STEPS = 4;
const TARGET_ID = "howto-practice";
const FLAG_ID = "howto-flag";
/** The practice reasons, in display order. The first right answer is pay-to-earn. */
const PRACTICE_CHIPS: Tactic[] = ["urgency", "pay-to-earn", "flattery"];
const RIGHT_REASON: Tactic = "pay-to-earn";

/**
 * "How to play": a quick hands-on walkthrough before the first scenario. The player flags a
 * practice message with the real sentence flagging and reason sheet, sorts a genuine message from a
 * scam, then sees how a run is scored. Unlike the game, every step gives instant feedback.
 */
export function HowToPlay({ onDone }: { onDone: () => void }) {
  const t = useT();
  const [step, setStep] = useState(0);
  const next = () => (step + 1 < STEPS ? setStep(step + 1) : onDone());

  return (
    <main className="flex flex-1 flex-col p-4">
      <div className="flex h-9 items-center justify-between gap-2">
        <button
          type="button"
          onClick={onDone}
          className="-ml-1 rounded-full px-2 py-1 text-sm font-medium text-muted-foreground hover:bg-muted"
        >
          {t("howto.skip")}
        </button>
        <LanguageToggle />
      </div>

      <div className="mt-3 flex items-center gap-3">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {t("howto.title")}
        </p>
        <div
          className="flex flex-1 gap-1.5"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={STEPS}
          aria-valuenow={step + 1}
          aria-label={t("howto.stepOf")(step + 1, STEPS)}
        >
          {Array.from({ length: STEPS }, (_, i) => (
            <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <motion.span
                className="block h-full rounded-full bg-foreground"
                initial={false}
                animate={{ width: i <= step ? "100%" : "0%" }}
                transition={{ duration: 0.35 }}
              />
            </span>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          // Steps 1 and 2 share the practice message, so they stay mounted together.
          key={step <= 1 ? "flag" : step}
          className="flex flex-1 flex-col"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
        >
          {step <= 1 && <FlagSteps step={step} onFlagged={() => setStep(1)} onNext={next} />}
          {step === 2 && <MixedStep onNext={next} />}
          {step === 3 && <RecapStep onDone={onDone} />}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

/* ------------------------------------------------------------------ */

function StepHeading({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-6">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

/** A chat message as the practice screens show it. */
function PracticeBubble({
  sender,
  children,
  tone = "neutral",
}: {
  sender: string;
  children: ReactNode;
  tone?: "neutral" | "good" | "bad";
}) {
  const t = useT();
  return (
    <div
      className={cn(
        "rounded-2xl bg-slate-100 p-3 ring-1 ring-slate-200 transition-colors",
        tone === "good" && "bg-emerald-50 ring-emerald-300",
        tone === "bad" && "bg-red-50 ring-red-300",
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-white"
          aria-hidden
        >
          {sender.charAt(0)}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{sender}</span>
        <SimulationBadge />
      </div>
      <div className="rounded-xl rounded-tl-sm bg-white px-3 py-2 text-[15px] leading-relaxed text-slate-900 shadow-sm">
        {children}
      </div>
      <span className="sr-only">{t("howto.practice")}</span>
    </div>
  );
}

function Feedback({ good, children }: { good: boolean; children: ReactNode }) {
  const Icon = good ? CircleCheck : CircleX;
  return (
    <motion.p
      role="status"
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 26 }}
      className={cn(
        "flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm leading-snug",
        good ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900",
      )}
    >
      <Icon
        className={cn("mt-0.5 size-4 shrink-0", good ? "text-emerald-600" : "text-amber-600")}
        aria-hidden
      />
      <span>{children}</span>
    </motion.p>
  );
}

/* ------------------------------------------------------------------ */

/** Steps 1 and 2: flag the fee sentence, then say why. They share the practice message. */
function FlagSteps({
  step,
  onFlagged,
  onNext,
}: {
  step: number;
  onFlagged: () => void;
  onNext: () => void;
}) {
  const t = useT();
  const message = t("howto.scamMessage");
  const [mark, setMark] = useState<HighlightMark | null>(null);
  const [miss, setMiss] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [chosen, setChosen] = useState<Tactic | undefined>(undefined);
  const [saved, setSaved] = useState<Tactic | undefined>(undefined);

  // The fee phrase is the hidden answer. Found by its number so any language version works.
  const answer = useMemo(() => feeSpan(message), [message]);

  const marksFor = useCallback(() => (mark === null ? [] : [mark]), [mark]);
  const onFlagRange = useCallback(
    (_targetId: string, start: number, end: number) => {
      if (!sentenceCatches(answer, start, end)) {
        // A new key each time, so the hint shakes again on every wrong tap.
        setMiss((n) => n + 1);
        return;
      }
      setMiss(0);
      setMark({ flagId: FLAG_ID, start, end });
      // A beat to see the highlight land, then on to the reason.
      setTimeout(() => {
        onFlagged();
        setSheetOpen(true);
      }, 650);
    },
    [answer, onFlagged],
  );
  const onOpenFlag = useCallback(() => {
    if (saved === undefined) setSheetOpen(true);
  }, [saved]);

  const quote = mark === null ? "" : message.slice(mark.start, mark.end);
  const right = saved === RIGHT_REASON;

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.2 }}
        >
          {step === 0 ? (
            <StepHeading title={t("howto.highlight.title")} body={t("howto.highlight.body")} />
          ) : (
            <StepHeading title={t("howto.why.title")} body={t("howto.why.body")} />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6">
        <HighlightProvider marksFor={marksFor} onFlagRange={onFlagRange} onOpenFlag={onOpenFlag}>
          <PracticeBubble sender={t("howto.sender")}>
            <HighlightableText targetId={TARGET_ID} text={message} />
          </PracticeBubble>
        </HighlightProvider>
      </div>

      <div className="mt-4 mb-6 flex flex-col gap-3">
        {step === 0 && mark === null && miss === 0 && (
          <motion.p
            className="flex items-center gap-2 text-sm text-muted-foreground"
            animate={{ opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            <MousePointerClick className="size-4" aria-hidden /> {t("howto.highlight.tryIt")}
          </motion.p>
        )}
        {step === 0 && mark === null && miss > 0 && (
          <Feedback key={miss} good={false}>
            {t("howto.highlight.miss")}
          </Feedback>
        )}
        {step === 0 && mark !== null && <Feedback good>{t("highlight.flagged")}</Feedback>}
        {step === 1 && saved === undefined && !sheetOpen && (
          <p className="text-sm text-muted-foreground">{t("howto.why.tap")}</p>
        )}
        {step === 1 && saved !== undefined && (
          <>
            <Feedback good={right}>{t(right ? "howto.why.right" : "howto.why.wrong")}</Feedback>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-start gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-sm leading-snug text-white"
            >
              <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              {t("howto.why.secret")}
            </motion.p>
          </>
        )}
      </div>

      {step === 1 && saved !== undefined && (
        <Button size="lg" className="mt-auto h-11 w-full shrink-0" onClick={onNext}>
          {t("howto.next")}
        </Button>
      )}

      {sheetOpen && (
        <FlagPopover
          quote={quote}
          chips={PRACTICE_CHIPS.map((tactic) => ({
            value: tactic,
            label: t(`tactic.${tactic}.label`),
          }))}
          chosen={chosen}
          note=""
          maxNote={0}
          showNote={false}
          canExplainOnly={false}
          canSave={chosen !== undefined}
          editing={false}
          onChoose={(value) => setChosen(PRACTICE_CHIPS.find((c) => c === value))}
          onNote={() => undefined}
          onSave={() => {
            setSaved(chosen);
            setSheetOpen(false);
          }}
          onCancel={() => setSheetOpen(false)}
          onRemove={() => undefined}
        />
      )}
    </>
  );
}

/** The answer span: from "pay" (or the amount) through "fee" around the ₹499. */
function feeSpan(message: string) {
  const amount = message.indexOf("₹499");
  if (amount === -1) return { redFlagId: "fee", start: 0, end: message.length };
  const lower = message.toLowerCase();
  const payAt = lower.lastIndexOf("pay", amount);
  const start = payAt !== -1 && amount - payAt <= 8 ? payAt : amount;
  const feeAt = lower.indexOf("fee", amount);
  const end = feeAt !== -1 && feeAt - amount <= 30 ? feeAt + 3 : amount + 4;
  return { redFlagId: "fee", start, end };
}

/* ------------------------------------------------------------------ */

type Verdict = "fine" | "suspicious";

const MIXED = [
  { sender: "howto.mixed.legitSender", text: "howto.mixed.legitText", answer: "fine" },
  { sender: "howto.mixed.scamSender", text: "howto.mixed.scamText", answer: "suspicious" },
] as const;

/** Step 3: one genuine message and one scam, judged one at a time. */
function MixedStep({ onNext }: { onNext: () => void }) {
  const t = useT();
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Verdict | null>(null);
  const [score, setScore] = useState(0);
  const card = MIXED[index]!;
  const done = index === MIXED.length - 1 && picked !== null;
  const right = picked === card.answer;

  const pick = (verdict: Verdict) => {
    if (picked !== null) return;
    setPicked(verdict);
    if (verdict === card.answer) setScore((s) => s + 1);
  };

  const feedbackKey =
    card.answer === "fine"
      ? right
        ? "howto.mixed.legitRight"
        : "howto.mixed.legitWrong"
      : right
        ? "howto.mixed.scamRight"
        : "howto.mixed.scamWrong";

  return (
    <>
      <StepHeading title={t("howto.mixed.title")} body={t("howto.mixed.body")} />

      <div className="mt-4 flex items-center gap-1.5" aria-hidden>
        {MIXED.map((_, i) => (
          <span
            key={i}
            className={cn(
              "size-2 rounded-full",
              i < index || (i === index && picked !== null) ? "bg-foreground" : "bg-slate-300",
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className="mt-3"
          initial={{ opacity: 0, y: 16, rotate: -1 }}
          animate={{
            opacity: 1,
            y: 0,
            rotate: 0,
            x: picked === null || right ? 0 : [0, -6, 6, -4, 4, 0],
          }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}
        >
          <PracticeBubble
            sender={t(card.sender)}
            tone={picked === null ? "neutral" : right ? "good" : "bad"}
          >
            {t(card.text)}
          </PracticeBubble>
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <VerdictButton
          icon={<ThumbsUp className="size-4" aria-hidden />}
          label={t("howto.mixed.fine")}
          active={picked === "fine"}
          disabled={picked !== null}
          onClick={() => pick("fine")}
        />
        <VerdictButton
          icon={<ShieldAlert className="size-4" aria-hidden />}
          label={t("howto.mixed.suspicious")}
          active={picked === "suspicious"}
          disabled={picked !== null}
          onClick={() => pick("suspicious")}
        />
      </div>

      <div className="mt-4 mb-6 flex flex-col gap-3">
        {picked !== null && (
          <Feedback key={`${index}-${picked}`} good={right}>
            {t(feedbackKey)}
          </Feedback>
        )}
        {done && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl bg-slate-900 px-3 py-2.5 text-sm leading-snug font-medium text-white"
          >
            {score}/{MIXED.length} · {t("howto.mixed.lesson")}
          </motion.p>
        )}
      </div>

      {picked !== null && (
        <Button
          size="lg"
          className="mt-auto h-11 w-full shrink-0"
          onClick={() => {
            if (done) return onNext();
            setIndex(index + 1);
            setPicked(null);
          }}
        >
          {t("howto.next")}
        </Button>
      )}
    </>
  );
}

function VerdictButton({
  icon,
  label,
  active,
  disabled,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-colors",
        active ? "border-foreground bg-foreground text-background" : "border-slate-300",
        disabled && !active && "opacity-40",
      )}
    >
      {icon} {label}
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */

/** Step 4: what else happens in a run, and how it's scored. */
function RecapStep({ onDone }: { onDone: () => void }) {
  const t = useT();
  const rows = [
    { icon: Search, title: t("howto.recap.dig"), body: t("howto.recap.digBody") },
    { icon: Gavel, title: t("howto.recap.decide"), body: t("howto.recap.decideBody") },
    { icon: RotateCcw, title: t("howto.recap.debrief"), body: t("howto.recap.debriefBody") },
  ];
  const scores = [
    { points: "+3", label: t("howto.recap.right"), tone: "text-emerald-700 bg-emerald-50" },
    { points: "+1", label: t("howto.recap.bonus"), tone: "text-sky-700 bg-sky-50" },
    { points: "−1", label: t("howto.recap.falseAlarm"), tone: "text-red-700 bg-red-50" },
  ];

  return (
    <>
      <h1 className="mt-6 text-2xl font-bold tracking-tight">{t("howto.recap.title")}</h1>
      <ul className="mt-5 flex flex-col gap-4">
        {rows.map((row, i) => (
          <motion.li
            key={row.title}
            className="flex gap-3"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.12 }}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
              <row.icon className="size-5" aria-hidden />
            </span>
            <div>
              <p className="font-semibold">{row.title}</p>
              <p className="text-sm leading-snug text-muted-foreground">{row.body}</p>
            </div>
          </motion.li>
        ))}
      </ul>

      <motion.div
        className="mt-6 rounded-2xl border p-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {t("howto.recap.scoring")}
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {scores.map((s) => (
            <div key={s.points} className={cn("rounded-xl px-2 py-2 text-center", s.tone)}>
              <p className="text-xl font-bold tabular-nums">{s.points}</p>
              <p className="text-[11px] leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          {t("rank.rookie")} → {t("rank.sharp")} → {t("rank.scam-proof")}
        </p>
      </motion.div>

      <Button size="lg" className="mt-auto h-11 w-full shrink-0" onClick={onDone}>
        {t("howto.ready")}
      </Button>
    </>
  );
}
