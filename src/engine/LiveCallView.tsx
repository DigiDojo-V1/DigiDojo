"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, MotionConfig } from "motion/react";
import {
  Captions,
  FileSearch,
  Flag,
  Gauge,
  IdCard,
  MessageCircleHeart,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale, useT, useText } from "@/i18n/hooks";
import { formatRupees } from "@/lib/format";
import {
  CallerHeader,
  CallFrame,
  CallTimer,
  CaptionCard,
  HangUpButton,
  RoundButton,
  SpeakingBars,
} from "@/shells/call/parts";
import { IncomingCall } from "@/shells/call/IncomingCall";
import { CallLoadingScreen, useTimedStep } from "@/shells/call/LoadingScreens";
import { PhoneNotifications } from "@/shells/call/PhoneNotifications";
import {
  LifelineSheet,
  LiveFlagSheet,
  PaymentSheet,
  PersonaSheet,
  ReportSheet,
} from "@/shells/call/sheets";
import { VideoFeed } from "@/shells/call/VideoFeed";
import { liveFlagTactics, resolveOutcome } from "./live-call";
import { useEvidence } from "./PlayViews";
import type { LiveCallNode, Scenario, Tactic } from "./schema";
import { useRunStore } from "./store";
import { useLiveCall } from "./useLiveCall";

type Sheet = "persona" | "flag" | "report" | { lifeline: string } | null;

const CONNECT_STEPS = ["mic", "setup", "line"] as const;

/**
 * A live voice call: ringing → connecting → talking to the AI caller → call ended (the player
 * can report the number) → reviewing → on to the node the call leads to. Without a mic, or with
 * voice off, the player takes the scripted version instead.
 */
export function LiveCallView({
  scenario,
  nodeId,
  node,
  backHref,
}: {
  scenario: Scenario;
  nodeId: string;
  node: LiveCallNode;
  backHref: string;
}) {
  const t = useT();
  const text = useText();
  const locale = useLocale();
  const advanceTo = useRunStore((s) => s.advanceTo);
  const record = useRunStore((s) => s.liveCalls[nodeId]);
  const call = useLiveCall({ scenario, node, nodeId, locale });
  const evidence = useEvidence(scenario);
  const [voiceAvailable, setVoiceAvailable] = useState<boolean | null>(null);
  const [captions, setCaptions] = useState(true);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [lifelineState, setLifelineState] = useState<Record<string, "sent" | "replied">>({});
  const [flagNote, setFlagNote] = useState(false);

  useEffect(() => {
    let live = true;
    fetch("/api/call/status")
      .then((res) => (res.ok ? res.json() : { voice: false }))
      .then((json: { voice?: unknown }) => live && setVoiceAvailable(json.voice === true))
      .catch(() => live && setVoiceAvailable(false));
    return () => {
      live = false;
    };
  }, []);

  // Once the review is in, go on to wherever the call led.
  const reviewed =
    call.phase === "reviewing" && record !== undefined && record.report !== "pending"
      ? record
      : undefined;
  useEffect(() => {
    if (reviewed === undefined) return;
    const timer = setTimeout(
      () => advanceTo(resolveOutcome(node, reviewed.signals, reviewed.outcomeId).nextNodeId),
      500,
    );
    return () => clearTimeout(timer);
  }, [reviewed, node, advanceTo]);

  const caller = {
    name: text(node.caller.name),
    number: node.caller.number,
    label: node.caller.label === undefined ? undefined : text(node.caller.label),
  };
  const video = node.video === true;

  const reasons = useMemo(
    () =>
      liveFlagTactics(scenario, node).map((tactic) => ({
        value: tactic,
        label: t(`tactic.${tactic}.label`),
      })),
    [scenario, node, t],
  );

  if (call.phase === "connecting") {
    return (
      <CallLoadingScreen
        name={caller.name}
        title={t("call.connect.title")}
        subtitle={caller.name}
        steps={[
          { icon: Mic, label: t("call.connect.mic") },
          { icon: ShieldCheck, label: t("call.connect.setup") },
          { icon: Phone, label: t("call.connect.line")(caller.name) },
        ]}
        current={CONNECT_STEPS.indexOf(call.step)}
        footer={
          <div className="space-y-3 text-center">
            <p className="text-xs text-white/55">{t("call.connect.tip")}</p>
            <Button
              size="lg"
              variant="ghost"
              className="h-12 w-full text-white hover:bg-white/10 hover:text-white"
              onClick={call.cancel}
            >
              {t("call.connect.cancel")}
            </Button>
          </div>
        }
      />
    );
  }

  if (call.phase === "reviewing") return <ReviewingScreen name={caller.name} />;

  if (call.phase === "idle") {
    const problem =
      call.failure === "mic"
        ? t("call.micDenied")
        : call.failure === "connect"
          ? t("call.failed")
          : call.failure === "voice-off"
            ? t("call.voiceUnavailable")
            : undefined;
    const canVoice = voiceAvailable === true && call.failure !== "voice-off";
    return (
      <IncomingCall
        {...caller}
        video={video}
        backHref={backHref}
        voiceAvailable={voiceAvailable === null ? null : canVoice}
        busy={false}
        problem={problem}
        onAnswer={() => (canVoice ? void call.answer() : advanceTo(node.scriptedNodeId))}
        onAnswerText={() => advanceTo(node.scriptedNodeId)}
        onDecline={
          node.declineNodeId === undefined ? undefined : () => advanceTo(node.declineNodeId!)
        }
      />
    );
  }

  if (call.phase === "ended") {
    const endedKey =
      call.endedBy === "player"
        ? "call.endedByYou"
        : call.endedBy === "caller"
          ? "call.endedByCaller"
          : call.endedBy === "timeout"
            ? "call.endedTimeout"
            : "call.endedError";
    return (
      <CallFrame>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-red-600/90">
            <PhoneOff className="size-7" aria-hidden />
          </span>
          <div>
            <p className="text-2xl font-semibold">{t("call.ended")}</p>
            <p className="mt-1 text-white/70">{caller.name}</p>
            <p className="text-sm text-white/55">{caller.number}</p>
            <p className="mt-1 text-sm text-white/60 tabular-nums">
              {t("call.timer")(Math.round(call.durationMs / 1000))} · {t(endedKey)}
            </p>
          </div>
        </div>
        <div className="space-y-3 p-4 pb-8">
          {call.reported ? (
            <p
              role="status"
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-white/10 text-sm font-medium text-white/85"
            >
              <ShieldCheck className="size-4 text-emerald-400" aria-hidden />
              {t("call.report.done")}
            </p>
          ) : (
            <Button
              size="lg"
              variant="outline"
              className="h-12 w-full border-red-400/60 bg-transparent text-red-200 hover:bg-red-500/15 hover:text-red-100"
              onClick={call.report}
            >
              <ShieldAlert className="size-4" aria-hidden /> {t("call.report.after")}
            </Button>
          )}
          <Button
            size="lg"
            className="h-12 w-full bg-white text-slate-900 hover:bg-white/90"
            onClick={call.finish}
          >
            {t("call.continue")}
          </Button>
        </div>
      </CallFrame>
    );
  }

  // Active call: one screen tall, captions scrolling between the caller and the buttons.
  const lifelines = node.lifelines ?? [];
  const openNotice = (id: string) => {
    const notice = call.notices.find((n) => n.id === id);
    if (notice?.panelId === undefined) return;
    call.addSignal(`${notice.eventId}.opened`);
    evidence.open(notice.panelId);
  };
  const paymentEvent = call.payment === null ? undefined : node.events?.[call.payment.eventId];
  const activeLifeline =
    sheet !== null && typeof sheet === "object"
      ? lifelines.find((l) => l.id === sheet.lifeline)
      : undefined;

  return (
    <MotionConfig reducedMotion="user">
      <CallFrame fit>
        <PhoneNotifications
          notices={call.notices.map((n) => ({
            id: n.id,
            app: n.app,
            sender: n.sender,
            text: n.text,
            fileName: n.fileName,
          }))}
          onOpen={openNotice}
          onDismiss={call.dismissNotice}
        />

        {video ? (
          <div className="shrink-0 pt-3">
            <VideoFeed
              name={caller.name}
              label={caller.label}
              level={call.callerLevel}
              since={call.connectedAt}
            />
          </div>
        ) : (
          <div className="shrink-0">
            <CallerHeader
              {...caller}
              level={call.callerLevel}
              status={<CallTimer since={call.connectedAt} />}
            />
          </div>
        )}

        <LiveCaptions
          show={captions}
          turns={call.turns}
          callerName={caller.name}
          youLabel={t("call.youSaid")}
          emptyLabel={t("call.captionsEmpty")}
        />

        <div className="z-30 shrink-0 space-y-4 border-t border-white/10 bg-slate-950/90 px-4 pt-4 pb-6">
          {flagNote && (
            <p role="status" className="text-center text-xs text-white/70">
              {t("call.flag.saved")}
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-3">
            <RoundButton
              icon={call.muted ? MicOff : Mic}
              label={t(call.muted ? "call.unmute" : "call.mute")}
              active={call.muted}
              onClick={() => call.setMuted(!call.muted)}
            />
            <RoundButton
              icon={Captions}
              label={t("call.captions")}
              active={captions}
              onClick={() => setCaptions((c) => !c)}
            />
            <RoundButton
              icon={IdCard}
              label={t("call.details")}
              onClick={() => setSheet("persona")}
            />
            <RoundButton
              icon={Flag}
              label={t("call.flag")}
              badge={call.flags.length}
              onClick={() => setSheet("flag")}
            />
            <RoundButton
              icon={ShieldAlert}
              label={t("call.report")}
              onClick={() => setSheet("report")}
            />
            {lifelines.map((lifeline) => (
              <RoundButton
                key={lifeline.id}
                icon={MessageCircleHeart}
                label={t("call.lifeline.button")(text(lifeline.name))}
                onClick={() => setSheet({ lifeline: lifeline.id })}
              />
            ))}
          </div>
          <HangUpButton onClick={call.hangUp} />
        </div>

        {sheet === "persona" && (
          <PersonaSheet
            name={node.player.name}
            details={node.player.details.map((d) => ({ label: text(d.label), value: d.value }))}
            onClose={() => setSheet(null)}
          />
        )}
        {sheet === "report" && (
          <ReportSheet
            number={caller.number}
            onClose={() => setSheet(null)}
            onReport={() => {
              setSheet(null);
              call.report();
            }}
          />
        )}
        {sheet === "flag" && (
          <LiveFlagSheet
            quote={call.lastCallerLine}
            reasons={reasons}
            onClose={() => setSheet(null)}
            onSave={(tactic) => {
              if (call.lastCallerLine !== undefined)
                call.addFlag(call.lastCallerLine, tactic as Tactic);
              setSheet(null);
              setFlagNote(true);
              setTimeout(() => setFlagNote(false), 2500);
            }}
          />
        )}
        {activeLifeline !== undefined && (
          <LifelineSheet
            name={text(activeLifeline.name)}
            message={text(activeLifeline.message)}
            reply={text(activeLifeline.reply)}
            sent={lifelineState[activeLifeline.id] !== undefined}
            replied={lifelineState[activeLifeline.id] === "replied"}
            onSend={() => {
              const id = activeLifeline.id;
              call.addSignal(`${id}.sent`);
              setLifelineState((s) => ({ ...s, [id]: "sent" }));
              setTimeout(() => setLifelineState((s) => ({ ...s, [id]: "replied" })), 2600);
            }}
            onClose={() => setSheet(null)}
          />
        )}
        {call.payment !== null && paymentEvent?.kind === "payment" && (
          <PaymentSheet
            payee={text(paymentEvent.payee)}
            amount={formatRupees(paymentEvent.amount)}
            note={paymentEvent.note === undefined ? undefined : text(paymentEvent.note)}
            state={call.payment.state}
            onPay={() => call.respondPayment(true)}
            onDecline={() => call.respondPayment(false)}
          />
        )}
        {evidence.sheet}
      </CallFrame>
    </MotionConfig>
  );
}

/**
 * Everything said so far, newest at the bottom. It scrolls inside the space between the caller
 * and the buttons, following new lines unless the player has scrolled up to reread.
 */
function LiveCaptions({
  show,
  turns,
  callerName,
  youLabel,
  emptyLabel,
}: {
  show: boolean;
  turns: { who: "caller" | "player"; text: string; atMs: number }[];
  callerName: string;
  youLabel: string;
  emptyLabel: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const follow = useRef(true);
  const visible = turns.filter((turn) => turn.text.trim() !== "");
  const last = visible.at(-1);
  useEffect(() => {
    const box = boxRef.current;
    if (box !== null && follow.current) box.scrollTop = box.scrollHeight;
  }, [turns, show]);

  if (!show) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center text-sky-300">
        {last?.who === "caller" && <SpeakingBars className="h-8" />}
      </div>
    );
  }
  return (
    <div
      ref={boxRef}
      onScroll={(e) => {
        const box = e.currentTarget;
        follow.current = box.scrollHeight - box.scrollTop - box.clientHeight < 40;
      }}
      className="min-h-0 flex-1 [scrollbar-width:thin] [scrollbar-color:rgb(255_255_255/0.35)_transparent] overflow-y-auto overscroll-contain [mask-image:linear-gradient(to_bottom,transparent,black_24px)]"
      aria-live="polite"
    >
      <div className="flex min-h-full flex-col justify-end gap-2.5 px-3 pt-6 pb-3">
        {visible.length === 0 && <p className="text-center text-sm text-white/50">{emptyLabel}</p>}
        <AnimatePresence initial={false}>
          {visible.map((turn) => (
            <CaptionCard
              key={`${turn.who}-${turn.atMs}`}
              who={turn.who}
              text={turn.text.trim()}
              sender={callerName}
              youLabel={youLabel}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** While the judge reviews the call: a few steps ticking over, then on to the result. */
function ReviewingScreen({ name }: { name: string }) {
  const t = useT();
  const steps = [
    { icon: FileSearch, label: t("call.review.read") },
    { icon: ShieldCheck, label: t("call.review.check") },
    { icon: Gauge, label: t("call.review.score") },
  ];
  const current = useTimedStep(steps.length);
  return (
    <CallLoadingScreen name={name} title={t("call.review.title")} steps={steps} current={current} />
  );
}
