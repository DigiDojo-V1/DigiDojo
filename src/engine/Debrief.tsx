"use client";

import Link from "next/link";
import { useEffect, useMemo, type ReactNode } from "react";
import { Check, ChevronLeft, Flag, Lightbulb, Phone, RotateCcw, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { computeDebrief, type DebriefFlag } from "./scoring";
import { OUTCOME_STYLE } from "./outcome-style";
import type { OutcomeNode, Scenario } from "./schema";
import { scenarioKey, useProgressStore } from "./store";
import { TACTICS_INFO } from "./tactics";

interface DebriefProps {
  scenario: Scenario;
  outcome: OutcomeNode | undefined;
  seen: readonly string[];
  flagged: readonly string[];
  backHref: string;
  onReplay: () => void;
}

export function Debrief({ scenario, outcome, seen, flagged, backHref, onReplay }: DebriefProps) {
  const markComplete = useProgressStore((s) => s.markComplete);
  const key = scenarioKey(scenario.dojoId, scenario.id);

  // Reaching the debrief completes the scenario.
  useEffect(() => markComplete(key), [key, markComplete]);

  const result = useMemo(() => computeDebrief(scenario, seen, flagged), [scenario, seen, flagged]);
  const seenCount = result.caught.length + result.missed.length;
  const style = outcome !== undefined ? OUTCOME_STYLE[outcome.result] : undefined;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pb-8">
      <header className="flex items-center gap-2">
        <Link
          href={backHref}
          aria-label="Back to dojo"
          className="rounded-full p-1.5 hover:bg-muted"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Debrief
          </p>
          <h1 className="truncate text-lg font-semibold">{scenario.title}</h1>
        </div>
        {style !== undefined && (
          <Badge variant="outline" className={cn("ml-auto", style.tone)}>
            {style.label}
          </Badge>
        )}
      </header>

      <Card>
        <CardContent className="space-y-2">
          {seenCount > 0 ? (
            <>
              <p className="text-sm">
                You caught <strong>{result.caught.length}</strong> of <strong>{seenCount}</strong>{" "}
                red flags you saw.
              </p>
              <Progress value={(result.caught.length / seenCount) * 100} />
            </>
          ) : (
            <p className="text-sm">There were no red flags on the path you took.</p>
          )}
          {result.falseAlarms.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {result.falseAlarms.length} false alarm{result.falseAlarms.length > 1 ? "s" : ""}: you
              flagged messages that were fine.
            </p>
          )}
        </CardContent>
      </Card>

      <FlagSection
        title="Caught"
        icon={<Check className="size-4 text-emerald-600" />}
        flags={result.caught}
      />
      <FlagSection
        title="Missed"
        icon={<X className="size-4 text-red-600" />}
        flags={result.missed}
        empty={seenCount > 0 ? "None. You spotted every red flag you saw." : undefined}
      />

      {result.falseAlarms.length > 0 && (
        <section className="space-y-2">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold">
            <Flag className="size-4 text-amber-600" /> False alarms
          </h2>
          {result.falseAlarms.map((alarm) => (
            <Card key={alarm.messageId} size="sm">
              <CardContent className="space-y-1">
                <Quote text={alarm.text} />
                <p className="text-sm text-muted-foreground">
                  This one was fine. Being careful is good, but suspecting everything means missing
                  real chances.
                </p>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      {result.notReached.length > 0 && (
        <FlagSection
          title="On paths you didn't take"
          icon={<Flag className="size-4 text-muted-foreground" />}
          flags={result.notReached}
          muted
        />
      )}

      <Card className="bg-primary text-primary-foreground ring-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5 text-sm font-medium opacity-80">
            <Lightbulb className="size-4" /> Rule to remember
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-snug font-semibold">{scenario.debrief.rule}</p>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardContent className="flex gap-2 text-sm">
          <Phone className="mt-0.5 size-4 shrink-0" />
          <p>{scenario.debrief.realWorldAction}</p>
        </CardContent>
      </Card>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <Button variant="outline" size="lg" onClick={onReplay}>
          <RotateCcw /> Play again
        </Button>
        <Link href={backHref} className={buttonVariants({ size: "lg" })}>
          Back to dojo
        </Link>
      </div>
    </main>
  );
}

function FlagSection({
  title,
  icon,
  flags,
  empty,
  muted = false,
}: {
  title: string;
  icon: ReactNode;
  flags: DebriefFlag[];
  empty?: string;
  muted?: boolean;
}) {
  if (flags.length === 0 && empty === undefined) return null;
  return (
    <section className={cn("space-y-2", muted && "opacity-70")}>
      <h2 className="flex items-center gap-1.5 text-sm font-semibold">
        {icon} {title}
      </h2>
      {flags.length === 0 && <p className="text-sm text-muted-foreground">{empty}</p>}
      {flags.map((flag) => (
        <Card key={flag.redFlagId} size="sm">
          <CardContent className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{flag.label}</span>
              <Badge variant="secondary">{TACTICS_INFO[flag.tactic].label}</Badge>
            </div>
            <Quote text={flag.messageText} />
            <p className="text-sm">{flag.explanation}</p>
            <p className="text-xs text-muted-foreground">{TACTICS_INFO[flag.tactic].explanation}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function Quote({ text }: { text: string }) {
  return (
    <blockquote className="border-l-2 pl-2 text-sm text-muted-foreground italic">
      “{text}”
    </blockquote>
  );
}
