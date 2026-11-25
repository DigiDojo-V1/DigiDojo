"use client";

import Link from "next/link";
import { useEffect, useMemo, type ReactNode } from "react";
import {
  Check,
  CircleDashed,
  Eye,
  Flag,
  Inbox,
  Lightbulb,
  Loader2,
  Phone,
  RotateCcw,
  Trophy,
  X,
} from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useT, useText } from "@/i18n/hooks";
import { cn } from "@/lib/utils";
import {
  computeDebrief,
  reasonIsRight,
  type DebriefFlag,
  type DebriefResult,
  type DebriefTriageRow,
  type RunRecord,
} from "./scoring";
import { OUTCOME_STYLE } from "./outcome-style";
import type { LocalizedText, OutcomeNode, Scenario, Tactic } from "./schema";
import { scenarioKey } from "./keys";
import { useProgressStore } from "./store";

interface DebriefProps {
  scenario: Scenario;
  outcome: OutcomeNode | undefined;
  run: RunRecord;
  backHref: string;
  onReplay: () => void;
}

export function Debrief({ scenario, outcome, run, backHref, onReplay }: DebriefProps) {
  const t = useT();
  const text = useText();
  const markComplete = useProgressStore((s) => s.markComplete);
  const key = scenarioKey(scenario.dojoId, scenario.id);

  // Reaching the debrief completes the scenario.
  useEffect(() => markComplete(key), [key, markComplete]);

  const result = useMemo(() => computeDebrief(scenario, run), [scenario, run]);
  const found = result.caught.length + result.spotted.length;
  const reachedCount = found + result.missed.length + result.notInspected.length;
  const style = outcome !== undefined ? OUTCOME_STYLE[outcome.result] : undefined;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pb-8">
      <TopBar back={{ href: backHref, label: "nav.backToDojo" }} className="-mb-2" />
      <header className="flex items-center gap-2">
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

      <ScoreCard result={result} found={found} reached={reachedCount} />

      <FlagSection
        title={t("debrief.caught")}
        icon={<Check className="size-4 text-emerald-600" />}
        flags={result.caught}
      />
      {result.spotted.length > 0 && (
        <FlagSection
          title={t("debrief.spotted")}
          icon={<CircleDashed className="size-4 text-amber-600" />}
          flags={result.spotted}
          note={t("debrief.spottedNote")}
        />
      )}
      <FlagSection
        title={t("debrief.missed")}
        icon={<X className="size-4 text-red-600" />}
        flags={result.missed}
        empty={reachedCount > 0 ? t("debrief.missedNone") : undefined}
      />

      {result.falseAlarms.length > 0 && (
        <section className="space-y-2">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold">
            <Flag className="size-4 text-amber-600" /> {t("debrief.falseAlarms")}
          </h2>
          {result.falseAlarms.map((alarm) => (
            <Card key={alarm.id} size="sm">
              <CardContent className="space-y-1">
                <Quote text={{ en: alarm.text }} />
                {alarm.tactic !== undefined && (
                  <p className="text-xs text-muted-foreground">
                    {t("debrief.yourReason")}: {t(`tactic.${alarm.tactic}.label`)}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">{t("debrief.falseAlarmNote")}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      {result.notInspected.length > 0 && (
        <FlagSection
          title={t("debrief.notInspected")}
          icon={<Eye className="size-4 text-amber-600" />}
          flags={result.notInspected}
          note={t("debrief.notInspectedNote")}
        />
      )}

      {result.triage.length > 0 && <TriageSection rows={result.triage} />}

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
          {scenario.debrief.summary !== undefined && (
            <p className="mt-2 text-sm leading-relaxed opacity-90">
              {text(scenario.debrief.summary)}
            </p>
          )}
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
  note,
  muted = false,
}: {
  title: string;
  icon: ReactNode;
  flags: DebriefFlag[];
  empty?: string;
  note?: string;
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
      {note !== undefined && flags.length > 0 && (
        <p className="text-sm text-muted-foreground">{note}</p>
      )}
      {flags.map((flag) => (
        <Card key={flag.redFlagId} size="sm">
          <CardContent className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{text(flag.label)}</span>
              <Badge variant="secondary">{t(`tactic.${flag.tactic}.label`)}</Badge>
            </div>
            <p className="text-xs font-medium text-muted-foreground">
              {t(`debrief.where.${flag.where}`)}
            </p>
            {flag.player === undefined ? (
              <Quote text={flag.evidenceText} />
            ) : (
              <PlayerFlag player={flag.player} tactic={flag.tactic} />
            )}
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

function ScoreCard({
  result,
  found,
  reached,
}: {
  result: DebriefResult;
  found: number;
  reached: number;
}) {
  const t = useT();
  const { points, max, rank } = result.score;
  return (
    <Card>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-3">
          <Trophy
            className={cn(
              "size-9 shrink-0",
              rank === "scam-proof"
                ? "text-amber-500"
                : rank === "sharp"
                  ? "text-slate-500"
                  : "text-orange-800",
            )}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {t("score.title")}
            </p>
            <p className="text-xl font-bold">{t(`rank.${rank}`)}</p>
          </div>
          <p className="text-right text-sm font-semibold tabular-nums">
            {t("score.points")(points, max)}
          </p>
        </div>
        {max > 0 && <Progress value={Math.min(100, (points / max) * 100)} />}
        {reached > 0 ? (
          <p className="text-sm">
            {t("score.accuracy")(found, reached, result.falseAlarms.length)}
          </p>
        ) : (
          <p className="text-sm">{t("debrief.noFlags")}</p>
        )}
        <p className="text-xs text-muted-foreground">{t("score.howItWorks")}</p>
      </CardContent>
    </Card>
  );
}

/** What the player flagged for this red flag, their reason, and how their note was judged. */
function PlayerFlag({
  player,
  tactic,
}: {
  player: NonNullable<DebriefFlag["player"]>;
  tactic: Tactic;
}) {
  const t = useT();
  const right = reasonIsRight(player, tactic);
  const judge = player.judge;
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{t("debrief.youFlagged")}</p>
      <Quote text={{ en: player.text }} />
      <p className="flex flex-wrap items-center gap-1.5 text-sm">
        <span className="text-muted-foreground">{t("debrief.yourReason")}:</span>
        <span className={cn("font-medium", right ? "text-emerald-700" : "text-red-700")}>
          {player.tactic === undefined ? t("debrief.ownWords") : t(`tactic.${player.tactic}.label`)}
        </span>
        {!right && (
          <>
            <span className="text-muted-foreground">· {t("debrief.rightReason")}:</span>
            <span className="font-medium">{t(`tactic.${tactic}.label`)}</span>
          </>
        )}
      </p>
      {player.note !== undefined && (
        <div className="rounded-lg bg-muted/60 px-2.5 py-2 text-sm">
          <p className="text-xs text-muted-foreground">{t("debrief.yourNote")}</p>
          <p className="italic">“{player.note}”</p>
          {judge === "pending" && (
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="size-3 animate-spin" aria-hidden /> {t("debrief.judgePending")}
            </p>
          )}
          {judge === "error" && (
            <p className="mt-1 text-xs text-muted-foreground">{t("debrief.judgeError")}</p>
          )}
          {typeof judge === "object" && (
            <p className="mt-1 text-xs">
              <span
                className={cn(
                  "font-semibold",
                  judge.verdict === "good"
                    ? "text-emerald-700"
                    : judge.verdict === "partial"
                      ? "text-amber-700"
                      : "text-red-700",
                )}
              >
                {t(`debrief.judge.${judge.verdict}`)}
              </span>{" "}
              {judge.feedback}
            </p>
          )}
        </div>
      )}
    </div>
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

function TriageSection({ rows }: { rows: DebriefTriageRow[] }) {
  const t = useT();
  const text = useText();
  const right = rows.filter((r) => r.isCorrect).length;
  return (
    <section className="space-y-2">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold">
        <Inbox className="size-4" /> {t("debrief.triage")}
      </h2>
      <p className="text-sm">{t("debrief.triageScore")(right, rows.length)}</p>
      {rows.map((row) => (
        <Card key={row.itemId} size="sm">
          <CardContent className="space-y-1.5">
            <div className="flex items-start gap-2">
              {row.isCorrect ? (
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              ) : (
                <X className="mt-0.5 size-4 shrink-0 text-red-600" />
              )}
              <span className="font-medium">{text(row.subject)}</span>
            </div>
            <p className="text-sm">
              {t("debrief.triageYouSaid")}:{" "}
              {row.chosen === undefined ? t("triage.unlabelled") : t(`triage.${row.chosen}`)} ·{" "}
              {t("debrief.triageAnswer")}: {t(`triage.${row.correct}`)}
            </p>
            <p className="text-sm text-muted-foreground">{text(row.explanation)}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
