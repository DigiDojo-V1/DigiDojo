"use client";

import Link from "next/link";
import { useEffect, useMemo, type ReactNode } from "react";
import { Check, ChevronLeft, Flag, Lightbulb, Phone, RotateCcw, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useT, useText } from "@/i18n/hooks";
import { cn } from "@/lib/utils";
import { computeDebrief, type DebriefFlag } from "./scoring";
import { OUTCOME_STYLE } from "./outcome-style";
import type { LocalizedText, OutcomeNode, Scenario } from "./schema";
import { scenarioKey } from "./keys";
import { useProgressStore } from "./store";

interface DebriefProps {
  scenario: Scenario;
  outcome: OutcomeNode | undefined;
  seen: readonly string[];
  flagged: readonly string[];
  backHref: string;
  onReplay: () => void;
}

export function Debrief({ scenario, outcome, seen, flagged, backHref, onReplay }: DebriefProps) {
  const t = useT();
  const text = useText();
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
          aria-label={t("nav.backToDojo")}
          className="rounded-full p-1.5 hover:bg-muted"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t("debrief.eyebrow")}
          </p>
          <h1 className="truncate text-lg font-semibold">{text(scenario.title)}</h1>
        </div>
        {outcome !== undefined && style !== undefined && (
          <Badge variant="outline" className={cn("ml-auto", style.tone)}>
            {t(`outcome.${outcome.result}`)}
          </Badge>
        )}
      </header>

      <Card>
        <CardContent className="space-y-2">
          {seenCount > 0 ? (
            <>
              <p className="text-sm">
                {t("debrief.caughtSummary")(result.caught.length, seenCount)}
              </p>
              <Progress value={(result.caught.length / seenCount) * 100} />
            </>
          ) : (
            <p className="text-sm">{t("debrief.noFlags")}</p>
          )}
          {result.falseAlarms.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {t("debrief.falseAlarmSummary")(result.falseAlarms.length)}
            </p>
          )}
        </CardContent>
      </Card>

      <FlagSection
        title={t("debrief.caught")}
        icon={<Check className="size-4 text-emerald-600" />}
        flags={result.caught}
      />
      <FlagSection
        title={t("debrief.missed")}
        icon={<X className="size-4 text-red-600" />}
        flags={result.missed}
        empty={seenCount > 0 ? t("debrief.missedNone") : undefined}
      />

      {result.falseAlarms.length > 0 && (
        <section className="space-y-2">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold">
            <Flag className="size-4 text-amber-600" /> {t("debrief.falseAlarms")}
          </h2>
          {result.falseAlarms.map((alarm) => (
            <Card key={alarm.messageId} size="sm">
              <CardContent className="space-y-1">
                <Quote text={alarm.text} />
                <p className="text-sm text-muted-foreground">{t("debrief.falseAlarmNote")}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      {result.notReached.length > 0 && (
        <FlagSection
          title={t("debrief.notReached")}
          icon={<Flag className="size-4 text-muted-foreground" />}
          flags={result.notReached}
          muted
        />
      )}

      <Card className="bg-primary text-primary-foreground ring-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5 text-sm font-medium opacity-80">
            <Lightbulb className="size-4" /> {t("debrief.rule")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-snug font-semibold">{text(scenario.debrief.rule)}</p>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardContent className="flex gap-2 text-sm">
          <Phone className="mt-0.5 size-4 shrink-0" />
          <p>{text(scenario.debrief.realWorldAction)}</p>
        </CardContent>
      </Card>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <Button variant="outline" size="lg" onClick={onReplay}>
          <RotateCcw /> {t("debrief.playAgain")}
        </Button>
        <Link href={backHref} className={buttonVariants({ size: "lg" })}>
          {t("nav.backToDojo")}
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
  const t = useT();
  const text = useText();
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
              <span className="font-medium">{text(flag.label)}</span>
              <Badge variant="secondary">{t(`tactic.${flag.tactic}.label`)}</Badge>
            </div>
            <Quote text={flag.messageText} />
            <p className="text-sm">{text(flag.explanation)}</p>
            <p className="text-xs text-muted-foreground">
              {t(`tactic.${flag.tactic}.explanation`)}
            </p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function Quote({ text }: { text: LocalizedText }) {
  const resolve = useText();
  return (
    <blockquote className="border-l-2 pl-2 text-sm text-muted-foreground italic">
      “{resolve(text)}”
    </blockquote>
  );
}
