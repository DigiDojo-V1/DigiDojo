"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupees } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CallShell } from "@/shells/CallShell";
import { ChatShell } from "@/shells/ChatShell";
import { SmsShell } from "@/shells/SmsShell";
import type { ShellProps } from "@/shells/types";
import { UpiShell } from "@/shells/UpiShell";
import { Debrief } from "./Debrief";
import { OUTCOME_STYLE } from "./outcome-style";
import type { AppTheme, OutcomeNode, Scenario, ThreadNode } from "./schema";
import { scenarioKey } from "./keys";
import { currentNodeId, useRunStore } from "./store";
import { priorTranscript, toBubble } from "./transcript";

const DEFAULT_DELAY_MS = 800;

interface ScenarioPlayerProps {
  scenario: Scenario;
  /** Where "Back" and "Back to dojo" go. */
  backHref: string;
}

/** Plays one scenario: primer → threads → outcome → debrief. */
export function ScenarioPlayer({ scenario, backHref }: ScenarioPlayerProps) {
  const key = scenarioKey(scenario.dojoId, scenario.id);
  const activeKey = useRunStore((s) => s.scenarioKey);
  const phase = useRunStore((s) => s.phase);
  const trail = useRunStore((s) => s.trail);
  const seen = useRunStore((s) => s.seen);
  const flagged = useRunStore((s) => s.flagged);
  const rewinds = useRunStore((s) => s.rewinds);
  const start = useRunStore((s) => s.start);
  const reset = useRunStore((s) => s.reset);
  const beginSimulation = useRunStore((s) => s.beginSimulation);
  const rewind = useRunStore((s) => s.rewind);
  const openDebrief = useRunStore((s) => s.openDebrief);

  // A fresh run every time the player opens the scenario.
  useEffect(() => {
    start(key, scenario);
    return () => reset();
  }, [key, scenario, start, reset]);

  if (activeKey !== key) return null;

  const nodeId = currentNodeId({ trail });
  const node = nodeId === undefined ? undefined : scenario.nodes[nodeId];

  if (phase === "primer" && scenario.primer !== undefined) {
    return <PrimerCard primer={scenario.primer} backHref={backHref} onStart={beginSimulation} />;
  }

  if (phase === "debrief") {
    return (
      <Debrief
        scenario={scenario}
        outcome={node?.kind === "outcome" ? node : undefined}
        seen={seen}
        flagged={flagged}
        backHref={backHref}
        onReplay={() => start(key, scenario)}
      />
    );
  }

  if (node === undefined) return null;

  if (node.kind === "outcome") {
    const rewindTarget = node.rewindToNodeId;
    return (
      <OutcomeView
        outcome={node}
        onRewind={rewindTarget !== undefined ? () => rewind(rewindTarget) : undefined}
        onDebrief={openDebrief}
      />
    );
  }

  return (
    <ThreadView
      // Remount for every visit so messages reveal again (instantly if already seen).
      key={`${trail.length}-${rewinds}`}
      scenario={scenario}
      node={node}
      backHref={backHref}
    />
  );
}

/* ------------------------------------------------------------------ */

function PrimerCard({
  primer,
  backHref,
  onStart,
}: {
  primer: NonNullable<Scenario["primer"]>;
  backHref: string;
  onStart: () => void;
}) {
  return (
    <main className="flex flex-1 flex-col p-4">
      <Link
        href={backHref}
        aria-label="Back to dojo"
        className="self-start rounded-full p-1.5 hover:bg-muted"
      >
        <ChevronLeft className="size-5" />
      </Link>
      <motion.div
        className="flex flex-1 flex-col justify-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <Sparkles className="size-4" /> The trick
            </CardDescription>
            <CardTitle className="text-xl">{primer.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed">{primer.body}</p>
          </CardContent>
        </Card>
        <Button size="lg" className="mt-4 h-11" onClick={onStart}>
          Start simulation
        </Button>
      </motion.div>
    </main>
  );
}

/* ------------------------------------------------------------------ */

function ThreadView({
  scenario,
  node,
  backHref,
}: {
  scenario: Scenario;
  node: ThreadNode;
  backHref: string;
}) {
  const trail = useRunStore((s) => s.trail);
  const flagged = useRunStore((s) => s.flagged);
  const markSeen = useRunStore((s) => s.markSeen);
  const toggleFlag = useRunStore((s) => s.toggleFlag);
  const choose = useRunStore((s) => s.choose);

  // Messages seen before this visit (after a rewind) appear without waiting.
  const [seenBefore] = useState(() => new Set(useRunStore.getState().seen));
  const [revealed, setRevealed] = useState(0);

  const next = node.messages[revealed];
  useEffect(() => {
    if (next === undefined) return;
    const delay = seenBefore.has(next.id) ? 0 : (next.delayMs ?? DEFAULT_DELAY_MS);
    const timer = setTimeout(() => {
      markSeen(next.id);
      setRevealed((r) => r + 1);
    }, delay);
    return () => clearTimeout(timer);
  }, [next, seenBefore, markSeen]);

  const prior = useMemo(() => priorTranscript(scenario, trail), [scenario, trail]);
  const messages = useMemo(
    () => [...prior, ...node.messages.slice(0, revealed).map(toBubble)],
    [prior, node.messages, revealed],
  );

  const typing = next !== undefined && next.from === "them" && !seenBefore.has(next.id);
  const done = next === undefined;
  // Decided once per screen, so the hint doesn't vanish (and shift the chat) on the first tap.
  const [showHint] = useState(
    () => scenario.coldRun !== true && useRunStore.getState().flagged.length === 0,
  );

  const footer = done ? (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky bottom-0 z-30 space-y-2 border-t bg-white/95 p-3 backdrop-blur"
    >
      <p className="text-xs font-medium text-muted-foreground">What do you do?</p>
      {node.choices.map((choice) => (
        <Button
          key={choice.nextNodeId + choice.label}
          variant="outline"
          className="h-auto w-full justify-start py-2.5 text-left text-[15px] whitespace-normal"
          onClick={() => choose(choice)}
        >
          {choice.label}
        </Button>
      ))}
    </motion.div>
  ) : undefined;

  const shellProps: ShellProps = {
    contact: node.contact,
    messages,
    typing,
    typingSender: typing ? next?.sender : undefined,
    flaggedIds: flagged,
    onToggleFlag: toggleFlag,
    backHref,
    hint: showHint ? "Tap any message to flag it as suspicious" : undefined,
    footer,
  };

  return (
    <div className="flex flex-1 flex-col">
      <Shell app={node.app} {...shellProps} />
    </div>
  );
}

function Shell({ app, ...props }: ShellProps & { app: AppTheme }) {
  switch (app) {
    case "whatsapp":
    case "telegram":
    case "instagram":
      return <ChatShell theme={app} {...props} />;
    case "sms":
      return <SmsShell {...props} />;
    case "upi":
      return <UpiShell {...props} />;
    case "call":
      return <CallShell {...props} />;
  }
}

/* ------------------------------------------------------------------ */

function OutcomeView({
  outcome,
  onRewind,
  onDebrief,
}: {
  outcome: OutcomeNode;
  onRewind?: () => void;
  onDebrief: () => void;
}) {
  const style = OUTCOME_STYLE[outcome.result];
  const Icon = style.icon;
  return (
    <main className="flex flex-1 flex-col justify-center gap-4 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn("rounded-2xl p-6 text-center ring-1", style.soft)}
      >
        <Icon className={cn("mx-auto size-12", style.tone)} aria-hidden />
        <p className={cn("mt-3 text-xs font-semibold tracking-wide uppercase", style.tone)}>
          {style.label}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{outcome.title}</h1>
        {outcome.moneyDelta !== undefined && outcome.moneyDelta !== 0 && (
          <p
            className={cn(
              "mt-3 text-3xl font-bold tabular-nums",
              outcome.moneyDelta < 0 ? "text-red-700" : "text-emerald-700",
            )}
          >
            {formatRupees(outcome.moneyDelta, { signed: true })}
          </p>
        )}
        <p className="mt-3 leading-relaxed text-neutral-700">{outcome.body}</p>
      </motion.div>

      {onRewind !== undefined && (
        <Button variant="outline" size="lg" className="h-11" onClick={onRewind}>
          <RotateCcw /> Rewind to where you could have stopped
        </Button>
      )}
      <Button size="lg" className="h-11" onClick={onDebrief}>
        See debrief
      </Button>
    </main>
  );
}
