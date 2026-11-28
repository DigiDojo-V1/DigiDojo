"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import type { Locale } from "@/i18n/locale";
import { resolveText } from "@/i18n/text";
import { MicError, PcmPlayer, startMic, type Mic } from "@/lib/voice/audio";
import { LiveSession, type TokenResponse, type ToolCall } from "@/lib/voice/live-session";
import type { LiveConfig } from "@/server/call-api";
import {
  CALL_START_CUE,
  CallReportSchema,
  DEFAULT_MAX_MINUTES,
  END_CALL_TOOL,
  fillCode,
  makeCode,
  MAX_QUOTE_CHARS,
  MAX_TURN_CHARS,
  MAX_TURNS,
  REPORTED_SIGNAL,
  resolveOutcome,
  saidCode,
  TRIGGER_EVENT_TOOL,
  type CallEnding,
  type CallTurn,
  type LiveCallRecord,
  type LiveFlag,
} from "./live-call";
import { fallbackReport } from "./call-score";
import type { LiveCallNode, Scenario, Tactic } from "./schema";
import { useRunStore } from "./store";

/** ended: the call is over and the player can report the number; reviewing: the judge is at work. */
export type LiveCallPhase = "idle" | "connecting" | "active" | "ended" | "reviewing";
export type LiveCallFailure = "mic" | "voice-off" | "connect";
/** Where connecting is up to, for the loading screen. */
export type ConnectStep = "mic" | "setup" | "line";

export interface CallNotice {
  id: string;
  eventId: string;
  app: "sms" | "whatsapp";
  sender: string;
  text: string;
  fileName?: string;
  panelId?: string;
}

export interface PaymentRequest {
  eventId: string;
  state: "open" | "paid" | "declined";
}

const READY_TIMEOUT_MS = 15_000;
const REPORT_TIMEOUT_MS = 32_000;
/** After the caller says goodbye, wait for its last words to play out, at most this long. */
const DRAIN_MAX_MS = 8_000;

const TokenResponseSchema = z.object({
  token: z.string().min(1),
  model: z.string().min(1),
  config: z.custom<LiveConfig>((v) => typeof v === "object" && v !== null),
});

/**
 * Everything about one live voice call: the mic, the caller's voice, the transcript, what the
 * caller makes happen on the phone, and the review afterwards. The view only draws it.
 */
export function useLiveCall({
  scenario,
  node,
  nodeId,
  locale,
}: {
  scenario: Scenario;
  node: LiveCallNode;
  nodeId: string;
  locale: Locale;
}) {
  const saveLiveCall = useRunStore((s) => s.saveLiveCall);
  const setCallReport = useRunStore((s) => s.setCallReport);

  const [phase, setPhase] = useState<LiveCallPhase>("idle");
  const [failure, setFailure] = useState<LiveCallFailure | null>(null);
  const [connectedAt, setConnectedAt] = useState<number | null>(null);
  const [turns, setTurns] = useState<CallTurn[]>([]);
  const [notices, setNotices] = useState<CallNotice[]>([]);
  const [payment, setPayment] = useState<PaymentRequest | null>(null);
  const [flags, setFlags] = useState<LiveFlag[]>([]);
  const [signals, setSignals] = useState<string[]>([]);
  const [muted, setMutedState] = useState(false);
  const [endedBy, setEndedBy] = useState<CallEnding | null>(null);
  const [step, setStep] = useState<ConnectStep>("mic");
  const [reported, setReported] = useState(false);
  const [durationMs, setDurationMs] = useState(0);

  const session = useRef<LiveSession | null>(null);
  const mic = useRef<Mic | null>(null);
  const player = useRef<PcmPlayer | null>(null);
  const ready = useRef(false);
  const ended = useRef(false);
  const startedAt = useRef(0);
  const turnsRef = useRef<CallTurn[]>([]);
  const flagsRef = useRef<LiveFlag[]>([]);
  const signalsRef = useRef<string[]>([]);
  const callerTurnOpen = useRef(false);
  const triggered = useRef(new Set<string>());
  const otp = useRef<{ eventId: string; code: string; fromTurn: number } | null>(null);
  const pendingPayment = useRef<ToolCall | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  /** Bumped by every answer and cancel, so a cancelled attempt stops at its next step. */
  const attempt = useRef(0);
  const finished = useRef<LiveCallRecord | null>(null);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  const addSignal = useCallback((signal: string) => {
    if (signalsRef.current.includes(signal)) return;
    signalsRef.current = [...signalsRef.current, signal];
    setSignals(signalsRef.current);
  }, []);

  const shutdown = useCallback((cutAudio: boolean) => {
    for (const timer of timers.current) clearTimeout(timer);
    timers.current = [];
    mic.current?.stop();
    mic.current = null;
    session.current?.close();
    session.current = null;
    const p = player.current;
    player.current = null;
    if (p !== null) {
      if (cutAudio) p.close();
      else setTimeout(() => p.close(), 1500);
    }
  }, []);

  /** The call is over. It's saved and reviewed once the player leaves the "call ended" screen. */
  const end = useCallback(
    (reason: CallEnding) => {
      if (ended.current) return;
      ended.current = true;
      shutdown(reason === "player");
      const durationMs = startedAt.current === 0 ? 0 : Date.now() - startedAt.current;
      const transcript = turnsRef.current
        .map((t) => ({ ...t, text: t.text.trim().slice(0, MAX_TURN_CHARS) }))
        .filter((t) => t.text.length > 0)
        .slice(-MAX_TURNS);
      finished.current = {
        nodeId,
        transcript,
        flags: flagsRef.current,
        signals: [],
        endedBy: reason,
        durationMs,
        outcomeId: "",
        report: "pending",
      };
      setEndedBy(reason);
      setDurationMs(durationMs);
      setPhase("ended");
    },
    [nodeId, shutdown],
  );

  /** Saves the finished call with everything that happened, then asks the judge for a review. */
  const finish = useCallback(() => {
    const done = finished.current;
    if (done === null) return;
    finished.current = null;
    const record: LiveCallRecord = {
      ...done,
      signals: signalsRef.current,
      outcomeId: resolveOutcome(node, signalsRef.current).id,
    };
    saveLiveCall(record);
    setPhase("reviewing");
    void fetchReport(scenario, nodeId, locale, record).then((report) =>
      setCallReport(nodeId, report ?? fallbackReport(node, record, scenario.legit === true)),
    );
  }, [node, nodeId, scenario, locale, saveLiveCall, setCallReport]);

  /** Blocks and reports the caller's number: hangs up if the call is still going. */
  const report = useCallback(() => {
    addSignal(REPORTED_SIGNAL);
    setReported(true);
    end("player");
  }, [addSignal, end]);

  const addText = useCallback(
    (who: CallTurn["who"], chunk: string) => {
      const list = turnsRef.current;
      const last = list.at(-1);
      const atMs = Date.now() - startedAt.current;
      const continues =
        last !== undefined && last.who === who && (who === "player" || callerTurnOpen.current);
      turnsRef.current = continues
        ? [...list.slice(0, -1), { ...last, text: last.text + chunk }]
        : [...list, { who, text: chunk.trimStart(), atMs }];
      callerTurnOpen.current = who === "caller";
      setTurns(turnsRef.current);

      const code = otp.current;
      if (
        who === "player" &&
        code !== null &&
        !signalsRef.current.includes(`${code.eventId}.read`)
      ) {
        const said = turnsRef.current
          .slice(code.fromTurn)
          .filter((t) => t.who === "player")
          .map((t) => t.text)
          .join(" ");
        if (saidCode(said, code.code)) addSignal(`${code.eventId}.read`);
      }
    },
    [addSignal],
  );

  const onToolCall = useCallback(
    (call: ToolCall) => {
      const s = session.current;
      if (s === null) return;
      if (call.name === END_CALL_TOOL) {
        s.respond(call, { ok: true }, true);
        // Let the goodbye play out, then hang up.
        const start = Date.now();
        const wait = () => {
          if (ended.current) return;
          if (player.current?.speaking === true && Date.now() - start < DRAIN_MAX_MS)
            later(wait, 250);
          else end("caller");
        };
        later(wait, 600);
        return;
      }
      if (call.name !== TRIGGER_EVENT_TOOL) {
        s.respond(call, { error: "unknown tool" }, true);
        return;
      }
      const eventId = String(call.args.event ?? "");
      const event = node.events?.[eventId];
      if (event === undefined) {
        s.respond(call, { error: "unknown event" }, true);
        return;
      }
      if (triggered.current.has(eventId)) {
        s.respond(call, { status: "already sent earlier" }, true);
        return;
      }
      triggered.current.add(eventId);
      switch (event.kind) {
        case "sms": {
          const code = event.otp === true ? makeCode() : undefined;
          if (code !== undefined) {
            otp.current = { eventId, code, fromTurn: turnsRef.current.length };
          }
          setNotices((n) => [
            ...n,
            {
              id: `${eventId}-${n.length}`,
              eventId,
              app: "sms",
              sender: event.sender,
              text: fillCode(resolveText(event.text, locale), code),
            },
          ]);
          s.respond(call, { status: "delivered: it is on their screen now" }, true);
          break;
        }
        case "document":
          setNotices((n) => [
            ...n,
            {
              id: `${eventId}-${n.length}`,
              eventId,
              app: event.app,
              sender: resolveText(event.sender, locale),
              text: event.fileName,
              fileName: event.fileName,
              panelId: event.panelId,
            },
          ]);
          s.respond(call, { status: "delivered: they can open it now" }, true);
          break;
        case "payment":
          pendingPayment.current = call;
          setPayment({ eventId, state: "open" });
          break;
      }
    },
    [end, later, locale, node.events],
  );

  const answer = useCallback(async () => {
    if (phase === "connecting" || phase === "active") return;
    const mine = ++attempt.current;
    const cancelled = () => attempt.current !== mine;
    setFailure(null);
    setStep("mic");
    setPhase("connecting");
    // Made inside the tap, so the browser lets it play sound.
    const p = new PcmPlayer();
    player.current = p;
    void p.resume();

    const fail = (why: LiveCallFailure) => {
      if (cancelled()) return;
      shutdown(true);
      setFailure(why);
      setPhase("idle");
    };

    try {
      mic.current = await startMic((chunk) => {
        if (ready.current) session.current?.sendAudio(chunk);
      });
    } catch (error) {
      fail(error instanceof MicError ? "mic" : "connect");
      return;
    }
    if (cancelled()) {
      mic.current?.stop();
      mic.current = null;
      return;
    }

    setStep("setup");
    let token: TokenResponse;
    try {
      const res = await fetch("/api/call/token", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ dojoId: scenario.dojoId, scenarioId: scenario.id, nodeId, locale }),
      });
      if (res.status === 503) return fail("voice-off");
      if (!res.ok) return fail("connect");
      token = TokenResponseSchema.parse(await res.json());
    } catch {
      return fail("connect");
    }
    if (cancelled()) return;

    ended.current = false;
    ready.current = false;
    const live = new LiveSession({
      onReady: () => {
        if (ready.current || cancelled()) return;
        ready.current = true;
        startedAt.current = Date.now();
        setConnectedAt(startedAt.current);
        setPhase("active");
        live.sendText(CALL_START_CUE);
        later(() => end("timeout"), (node.maxMinutes ?? DEFAULT_MAX_MINUTES) * 60_000);
      },
      onAudio: (base64) => player.current?.play(base64),
      onInterrupted: () => player.current?.interrupt(),
      onCallerText: (text) => addText("caller", text),
      onPlayerText: (text) => addText("player", text),
      onTurnComplete: () => {
        callerTurnOpen.current = false;
      },
      onToolCall,
      onClose: () => {
        if (ended.current) return;
        if (!ready.current || turnsRef.current.length === 0) fail("connect");
        else end("error");
      },
    });
    session.current = live;
    setStep("line");
    try {
      await live.connect(token);
    } catch {
      return fail("connect");
    }
    if (cancelled()) {
      live.close();
      return;
    }
    later(() => {
      if (!ready.current && !ended.current) fail("connect");
    }, READY_TIMEOUT_MS);
  }, [addText, end, later, locale, node.maxMinutes, nodeId, onToolCall, phase, scenario, shutdown]);

  /** Stops connecting and goes back to the ringing screen. */
  const cancel = useCallback(() => {
    attempt.current++;
    shutdown(true);
    setPhase("idle");
  }, [shutdown]);

  // Leaving the screen mid-call hangs up without saving anything.
  useEffect(
    () => () => {
      ended.current = true;
      shutdown(true);
    },
    [shutdown],
  );

  const setMuted = useCallback((next: boolean) => {
    mic.current?.setMuted(next);
    setMutedState(next);
  }, []);

  const respondPayment = useCallback(
    (paid: boolean) => {
      if (payment === null || payment.state !== "open") return;
      addSignal(`${payment.eventId}.${paid ? "paid" : "declined"}`);
      setPayment({ ...payment, state: paid ? "paid" : "declined" });
      const call = pendingPayment.current;
      pendingPayment.current = null;
      if (call !== null) {
        session.current?.respond(
          call,
          { result: paid ? "The person approved and paid." : "The person declined the request." },
          false,
        );
      }
      later(() => setPayment(null), 1400);
    },
    [addSignal, later, payment],
  );

  const addFlag = useCallback((quote: string, tactic: Tactic) => {
    const flag: LiveFlag = {
      quote: quote.slice(-MAX_QUOTE_CHARS),
      tactic,
      atMs: Math.max(0, Date.now() - startedAt.current),
    };
    flagsRef.current = [...flagsRef.current, flag];
    setFlags(flagsRef.current);
  }, []);

  const lastCallerLine = [...turns]
    .reverse()
    .find((t) => t.who === "caller")
    ?.text.trim();

  return {
    phase,
    failure,
    connectedAt,
    turns,
    notices,
    dismissNotice: (id: string) => setNotices((n) => n.filter((x) => x.id !== id)),
    payment,
    respondPayment,
    flags,
    addFlag,
    signals,
    addSignal,
    muted,
    setMuted,
    endedBy,
    durationMs,
    step,
    cancel,
    reported,
    report,
    finish,
    lastCallerLine: lastCallerLine === "" ? undefined : lastCallerLine,
    answer,
    hangUp: () => end("player"),
    callerLevel: useCallback(() => player.current?.level() ?? 0, []),
  };
}

async function fetchReport(
  scenario: Scenario,
  nodeId: string,
  locale: Locale,
  record: LiveCallRecord,
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REPORT_TIMEOUT_MS);
  try {
    const res = await fetch("/api/call/report", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        dojoId: scenario.dojoId,
        scenarioId: scenario.id,
        nodeId,
        locale,
        transcript: record.transcript,
        flags: record.flags,
        signals: record.signals,
        endedBy: record.endedBy,
        durationMs: record.durationMs,
      }),
      signal: controller.signal,
    });
    if (!res.ok) return undefined;
    const json = (await res.json()) as { report?: unknown };
    return CallReportSchema.parse(json.report);
  } catch {
    return undefined;
  } finally {
    clearTimeout(timer);
  }
}
