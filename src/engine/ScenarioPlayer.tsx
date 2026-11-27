"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { RotateCcw } from "lucide-react";
import { AppChrome } from "@/components/layout/AppChrome";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { useLocale, useT, useText } from "@/i18n/hooks";
import { formatRupees } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CallShell } from "@/shells/CallShell";
import { ChatShell } from "@/shells/ChatShell";
import { SmsShell } from "@/shells/SmsShell";
import type { ShellProps } from "@/shells/types";
import { UpiShell } from "@/shells/UpiShell";
import { Debrief } from "./Debrief";
import { Flagging, useFlagActions } from "./Flagging";
import { HowToPlay } from "./HowToPlay";
import { PlayerFrame } from "./PlayerFrame";
import { messageRevealIds } from "./evidence";
import {
  ChoiceFooter,
  ComposeView,
  EmailView,
  EvidenceStack,
  EvidenceToolbar,
  flaggedInPanels,
  TriageView,
  useEvidence,
} from "./PlayViews";
import { OUTCOME_STYLE } from "./outcome-style";
import type { OutcomeNode, Scenario, ThreadApp, ThreadNode } from "./schema";
import { scenarioKey } from "./keys";
import { ScenarioIntro } from "./ScenarioIntro";
import { currentNodeId, useProgressStore, useRunStore } from "./store";
import { channelTransition, priorTranscript, toBubble } from "./transcript";

const DEFAULT_DELAY_MS = 800;

interface ScenarioPlayerProps {
  scenario: Scenario;
  /** Where "Back" and "Back to dojo" go. */
  backHref: string;
  /** Whether the AI marks the player's written explanations (FLAG_AI on). */
  notesGraded: boolean;
}

/** Plays one scenario: how to play (first time only) → primer → threads → outcome → debrief. */
export function ScenarioPlayer({ scenario, backHref, notesGraded }: ScenarioPlayerProps) {
  const key = scenarioKey(scenario.dojoId, scenario.id);
  const activeKey = useRunStore((s) => s.scenarioKey);
  const phase = useRunStore((s) => s.phase);
  const trail = useRunStore((s) => s.trail);
  const seen = useRunStore((s) => s.seen);
  const flags = useRunStore((s) => s.flags);
  const visited = useRunStore((s) => s.visited);
  const classifications = useRunStore((s) => s.classifications);
  const rewinds = useRunStore((s) => s.rewinds);
  const start = useRunStore((s) => s.start);
  const reset = useRunStore((s) => s.reset);
  const beginSimulation = useRunStore((s) => s.beginSimulation);
  const finishTutorial = useRunStore((s) => s.finishTutorial);
  const openTutorial = useRunStore((s) => s.openTutorial);
  const markTutorialSeen = useProgressStore((s) => s.markTutorialSeen);
  const rewind = useRunStore((s) => s.rewind);
  const openDebrief = useRunStore((s) => s.openDebrief);
  const text = useText();

  // A fresh run every time the player opens the scenario. "How to play" opens the very first one.
  // Runs on the client only, after the saved progress has loaded.
  useEffect(() => {
    start(key, scenario, { tutorial: !useProgressStore.getState().tutorialSeen });
    return () => reset();
  }, [key, scenario, start, reset]);

  if (activeKey !== key) return null;

  const nodeId = currentNodeId({ trail });
  const node = nodeId === undefined ? undefined : scenario.nodes[nodeId];

  if (phase === "tutorial") {
    return (
      <AppChrome>
        <HowToPlay
          onDone={() => {
            markTutorialSeen();
            finishTutorial();
          }}
        />
      </AppChrome>
    );
  }

  if (phase === "primer" && scenario.primer !== undefined) {
    return (
      <AppChrome>
        <ScenarioIntro
          primer={scenario.primer}
          backHref={backHref}
          onStart={beginSimulation}
          onHowToPlay={openTutorial}
        />
      </AppChrome>
    );
  }

  if (phase === "debrief") {
    return (
      <AppChrome>
        <Debrief
          scenario={scenario}
          outcome={node?.kind === "outcome" ? node : undefined}
          run={{ seen, flags, visited, classifications }}
          backHref={backHref}
          onReplay={() => start(key, scenario)}
        />
      </AppChrome>
    );
  }

  if (node === undefined) return null;

  if (node.kind === "outcome") {
    const rewindTarget = node.rewindToNodeId;
    return (
      <AppChrome>
        <OutcomeView
          outcome={node}
          backHref={backHref}
          onRewind={rewindTarget !== undefined ? () => rewind(rewindTarget) : undefined}
          onDebrief={openDebrief}
        />
      </AppChrome>
    );
  }

  // Remount for every visit so each screen starts fresh (messages reveal again, instantly if seen).
  const visitKey = `${trail.length}-${rewinds}`;
  return (
    <PlayerFrame title={text(scenario.title)} backHref={backHref}>
      <Flagging scenario={scenario} graded={notesGraded}>
        {node.kind === "thread" && (
          <ThreadView key={visitKey} scenario={scenario} node={node} backHref={backHref} />
        )}
        {node.kind === "email" && nodeId !== undefined && (
          <EmailView
            key={visitKey}
            scenario={scenario}
            nodeId={nodeId}
            node={node}
            backHref={backHref}
          />
        )}
        {node.kind === "compose" && <ComposeView key={visitKey} node={node} backHref={backHref} />}
        {node.kind === "triage" && (
          <TriageView key={visitKey} scenario={scenario} node={node} backHref={backHref} />
        )}
      </Flagging>
    </PlayerFrame>
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
  const { itemIds: flagged } = useFlagActions();
  const reveal = useRunStore((s) => s.reveal);
  const t = useT();
  const text = useText();
  const locale = useLocale();

  // Messages seen before this visit (after a rewind) appear without waiting.
  const [seenBefore] = useState(() => new Set(useRunStore.getState().seen));
  const [revealed, setRevealed] = useState(0);

  const next = node.messages[revealed];
  useEffect(() => {
    if (next === undefined) return;
    const delay = seenBefore.has(next.id) ? 0 : (next.delayMs ?? DEFAULT_DELAY_MS);
    const timer = setTimeout(() => {
      reveal(messageRevealIds(next));
      setRevealed((r) => r + 1);
    }, delay);
    return () => clearTimeout(timer);
  }, [next, seenBefore, reveal]);

  // Text is resolved on every render, so switching language mid-run just re-renders this screen.
  const prior = useMemo(() => priorTranscript(scenario, trail, locale), [scenario, trail, locale]);
  const messages = useMemo(
    () => [...prior, ...node.messages.slice(0, revealed).map((m) => toBubble(m, locale))],
    [prior, node.messages, revealed, locale],
  );

  const typing = next !== undefined && next.from === "them" && !seenBefore.has(next.id);
  const done = next === undefined;
  // Decided once per screen, so the hint doesn't vanish (and shift the chat) on the first tap.
  const [showHint] = useState(
    () => scenario.coldRun !== true && Object.keys(useRunStore.getState().flags).length === 0,
  );

  const evidence = useEvidence(scenario);
  const network = node.app === "linkedin";
  const footer = done ? (
    <ChoiceFooter choices={node.choices} variant={network ? "composer" : "default"} />
  ) : undefined;
  const transition = useMemo(
    () => channelTransition(scenario, trail, locale),
    [scenario, trail, locale],
  );
  // Tapping the contact opens their profile, if the screen offers one.
  const profileId = node.evidence?.find((id) => scenario.evidence?.[id]?.kind === "profile");
  const split = node.layout === "split" && node.evidence !== undefined;

  const shellProps: ShellProps = {
    contact: {
      name: text(node.contact.name),
      subtitle: node.contact.subtitle === undefined ? undefined : text(node.contact.subtitle),
      avatar: node.contact.avatar,
    },
    messages,
    typing,
    typingSender: typing && next?.sender !== undefined ? text(next.sender) : undefined,
    backHref,
    hint: showHint ? t("thread.hint") : undefined,
    toolbar: (
      <EvidenceToolbar
        scenario={scenario}
        panelIds={node.evidence}
        onOpen={evidence.open}
        variant={network ? "network" : "default"}
      />
    ),
    footer,
    onContactClick: profileId === undefined ? undefined : () => evidence.open(profileId),
    aside:
      split && node.evidence !== undefined
        ? {
            label: t("split.evidence"),
            flaggedCount: flaggedInPanels(scenario, node.evidence, flagged),
            content: <EvidenceStack scenario={scenario} panelIds={node.evidence} />,
          }
        : undefined,
    transition,
  };

  return (
    <div className="flex flex-1 flex-col lg:min-h-0">
      <Shell app={node.app} {...shellProps} />
      {evidence.sheet}
    </div>
  );
}

function Shell({ app, ...props }: ShellProps & { app: ThreadApp }) {
  switch (app) {
    case "whatsapp":
    case "telegram":
    case "instagram":
    case "linkedin":
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
  backHref,
  onRewind,
  onDebrief,
}: {
  outcome: OutcomeNode;
  backHref: string;
  onRewind?: () => void;
  onDebrief: () => void;
}) {
  const t = useT();
  const text = useText();
  const style = OUTCOME_STYLE[outcome.result];
  const Icon = style.icon;
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:rounded-lg md:bg-white md:p-6 md:ring-1 md:ring-black/10">
      <TopBar back={{ href: backHref, label: "nav.backToDojo" }} />
      <div className="flex flex-1 flex-col justify-center gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn("rounded-2xl p-6 text-center ring-1", style.soft)}
        >
          <Icon className={cn("mx-auto size-12", style.tone)} aria-hidden />
          <p className={cn("mt-3 text-xs font-semibold tracking-wide uppercase", style.tone)}>
            {t(`outcome.${outcome.result}`)}
          </p>
          <h1 className="mt-1 text-2xl font-bold">{text(outcome.title)}</h1>
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
          <p className="mt-3 leading-relaxed text-neutral-700">{text(outcome.body)}</p>
        </motion.div>

        {onRewind !== undefined && (
          <Button variant="outline" size="lg" className="h-11" onClick={onRewind}>
            <RotateCcw /> {t("outcome.rewind")}
          </Button>
        )}
        <Button size="lg" className="h-11" onClick={onDebrief}>
          {t("outcome.seeDebrief")}
        </Button>
      </div>
    </main>
  );
}
