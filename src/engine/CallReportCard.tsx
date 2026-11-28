"use client";

import {
  ChevronDown,
  CircleCheck,
  CircleX,
  Loader2,
  PhoneCall,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useT, useText } from "@/i18n/hooks";
import { cn } from "@/lib/utils";
import {
  PART_MAX,
  ratingBand,
  REPORTED_SIGNAL,
  SCORE_PARTS,
  type CallReport,
  type LiveCallRecord,
  type ReportMoment,
  type ScorePart,
} from "./live-call";
import type { Scenario } from "./schema";

const BAND_STYLE = {
  vulnerable: { tone: "text-red-700", bar: "bg-red-500" },
  moderate: { tone: "text-amber-700", bar: "bg-amber-500" },
  savvy: { tone: "text-emerald-700", bar: "bg-emerald-500" },
} as const;

/** The review of a live call: a rating out of 10, what went well and wrong, and the transcript. */
export function CallReportCard({
  scenario,
  record,
}: {
  scenario: Scenario;
  record: LiveCallRecord;
}) {
  const t = useT();
  const text = useText();
  const node = scenario.nodes[record.nodeId];
  const callerName = node?.kind === "live-call" ? text(node.caller.name) : t("report.caller");
  const report = record.report;
  const duration = t("call.timer")(Math.round(record.durationMs / 1000));

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">
            <PhoneCall className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {t("report.title")}
            </p>
            <p className="truncate text-sm">
              {callerName} · {t("report.duration")(duration)}
            </p>
          </div>
          {typeof report === "object" && (
            <div className="text-right">
              <p
                className={cn(
                  "text-2xl font-bold tabular-nums",
                  BAND_STYLE[ratingBand(report.rating)].tone,
                )}
              >
                {t("report.rating")(String(report.rating))}
              </p>
              <p
                className={cn("text-xs font-semibold", BAND_STYLE[ratingBand(report.rating)].tone)}
              >
                {t(`report.band.${ratingBand(report.rating)}`)}
              </p>
            </div>
          )}
        </div>

        {report === "pending" && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden /> {t("report.pending")}
          </p>
        )}

        {typeof report === "object" && (
          <>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full", BAND_STYLE[ratingBand(report.rating)].bar)}
                style={{ width: `${report.rating * 10}%` }}
              />
            </div>
            {!report.analysed && (
              <p className="text-xs text-muted-foreground">{t("report.notAnalysed")}</p>
            )}
            {report.summary !== "" && <p className="text-sm leading-relaxed">{report.summary}</p>}
            <ScoreParts parts={report.parts} legit={scenario.legit === true} />
            {record.signals.includes(REPORTED_SIGNAL) && (
              <p className="flex items-center gap-1.5 text-sm">
                <ShieldCheck className="size-4 text-emerald-600" aria-hidden />
                {t("report.reported")}
              </p>
            )}
            <Moments
              title={t("report.good")}
              icon={<CircleCheck className="size-4 text-emerald-600" aria-hidden />}
              moments={report.goodMoves}
            />
            <Moments
              title={t("report.mistakes")}
              icon={<CircleX className="size-4 text-red-600" aria-hidden />}
              moments={report.mistakes}
            />
            {report.doBetter.length > 0 && (
              <section className="space-y-1.5">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                  <Sparkles className="size-4 text-indigo-600" aria-hidden /> {t("report.better")}
                </h3>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {report.doBetter.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}

        {record.transcript.length > 0 && (
          <details className="group rounded-xl bg-muted/50 px-3">
            <summary className="flex cursor-pointer list-none items-center gap-2 py-2.5 text-sm font-medium [&::-webkit-details-marker]:hidden">
              <span className="flex-1">{t("report.transcript")}</span>
              <ChevronDown
                className="size-4 text-muted-foreground transition-transform group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <ol className="space-y-2 pb-3 text-sm">
              {record.transcript.map((turn, i) => (
                <li key={i} className="flex gap-2">
                  <span className="w-12 shrink-0 text-xs leading-5 font-semibold text-muted-foreground">
                    {turn.who === "caller" ? t("report.caller") : t("report.you")}
                  </span>
                  <span className={cn(turn.who === "player" && "text-foreground/80")}>
                    {turn.text}
                  </span>
                </li>
              ))}
            </ol>
          </details>
        )}
      </CardContent>
    </Card>
  );
}

/** The rating, part by part: four rows that add up to the score out of 10. */
function ScoreParts({ parts, legit }: { parts: CallReport["parts"]; legit: boolean }) {
  const t = useT();
  const label = (part: ScorePart) =>
    legit && (part === "pressure" || part === "exit")
      ? t(`callScore.part.${part}.legit`)
      : t(`callScore.part.${part}`);
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold">{t("report.parts")}</h3>
      <ul className="space-y-2">
        {SCORE_PARTS.map((part) => {
          const share = parts[part] / PART_MAX[part];
          return (
            <li key={part} className="space-y-1">
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span>{label(part)}</span>
                <span className="font-semibold tabular-nums">
                  {t("callScore.points")(String(parts[part]), PART_MAX[part])}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full",
                    share >= 0.75 ? "bg-emerald-500" : share >= 0.4 ? "bg-amber-500" : "bg-red-500",
                  )}
                  style={{ width: `${share * 100}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Moments({
  title,
  icon,
  moments,
}: {
  title: string;
  icon: React.ReactNode;
  moments: ReportMoment[];
}) {
  const t = useT();
  if (moments.length === 0) return null;
  return (
    <section className="space-y-1.5">
      <h3 className="flex items-center gap-1.5 text-sm font-semibold">
        {icon} {title}
      </h3>
      <ul className="space-y-2">
        {moments.map((m, i) => (
          <li key={i} className="text-sm">
            {m.quote.trim() !== "" && (
              <blockquote className="border-l-2 pl-2 text-muted-foreground italic">
                “{m.quote}”
              </blockquote>
            )}
            <p className="mt-0.5">{m.key !== undefined ? t(`callScore.move.${m.key}`) : m.why}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
