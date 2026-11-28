"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, MotionConfig } from "motion/react";
import {
  Captions,
  Flag,
  IdCard,
  Loader2,
  MessageCircleHeart,
  Mic,
  MicOff,
  PhoneOff,
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
import { PhoneNotifications } from "@/shells/call/PhoneNotifications";
import { LifelineSheet, LiveFlagSheet, PaymentSheet, PersonaSheet } from "@/shells/call/sheets";
import { VideoFeed } from "@/shells/call/VideoFeed";
import { liveFlagTactics, resolveOutcome } from "./live-call";
import { useEvidence } from "./PlayViews";
import type { LiveCallNode, Scenario, Tactic } from "./schema";
import { useRunStore } from "./store";
import { useLiveCall } from "./useLiveCall";

type Sheet = "persona" | "flag" | { lifeline: string } | null;

/**
 * A live voice call: ringing → talking to the AI caller → call ended → on to the node the call
 * leads to. Without a mic, or with voice off, the player takes the scripted version instead.
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

  if (call.phase === "idle" || call.phase === "connecting") {
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
        busy={call.phase === "connecting"}
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
    const report = record?.report;
    const ready = report !== undefined && report !== "pending";
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
            <p className="mt-1 text-sm text-white/60 tabular-nums">
              {t("call.timer")(Math.round((record?.durationMs ?? 0) / 1000))} · {t(endedKey)}
            </p>
          </div>
          {!ready && (
            <p className="flex items-center gap-2 text-sm text-white/70">
              <Loader2 className="size-4 animate-spin" aria-hidden /> {t("call.analysing")}
            </p>
          )}
        </div>
        <div className="p-4 pb-8">
          <Button
            size="lg"
            className="h-12 w-full bg-white text-slate-900 hover:bg-white/90"
            disabled={!ready || record === undefined}
            onClick={() => {
              if (record === undefined) return;
              const outcome = resolveOutcome(node, record.signals, record.outcomeId);
              advanceTo(outcome.nextNodeId);
            }}
          >
            {t("call.continue")}
          </Button>
        </div>
      </CallFrame>
    );
  }

  // Active call.
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
      <CallFrame>
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
          <div className="pt-3">
            <VideoFeed
              name={caller.name}
              label={caller.label}
              level={call.callerLevel}
              since={call.connectedAt}
            />
          </div>
        ) : (
          <CallerHeader
            {...caller}
            level={call.callerLevel}
            status={<CallTimer since={call.connectedAt} />}
          />
        )}

        <LiveCaptions
          show={captions}
          turns={call.turns}
          callerName={caller.name}
          youLabel={t("call.youSaid")}
          emptyLabel={t("call.captionsEmpty")}
        />

        <div className="sticky bottom-0 z-30 space-y-5 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent px-4 pt-6 pb-8">
          {flagNote && (
            <p role="status" className="text-center text-xs text-white/70">
              {t("call.flag.saved")}
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-4">
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

/** The last few things said, newest at the bottom. */
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
  const endRef = useRef<HTMLDivElement>(null);
  const visible = turns.filter((turn) => turn.text.trim() !== "").slice(-6);
  const last = visible.at(-1);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns]);

  if (!show) {
    return (
      <div className="flex flex-1 items-center justify-center text-sky-300">
        {last?.who === "caller" && <SpeakingBars className="h-8" />}
      </div>
    );
  }
  return (
    <div className="flex flex-1 flex-col justify-end gap-2.5 px-3 pt-4 pb-2" aria-live="polite">
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
      <div ref={endRef} />
    </div>
  );
}
