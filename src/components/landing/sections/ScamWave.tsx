"use client";

import {
  Banknote,
  MessageCircleWarning,
  Siren,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { useT } from "@/i18n/hooks";
import { clamp, depthFade, easeOutCubic } from "../camera";
import { useEngine, WorldNode, type NodeFrame } from "../engine";
import { StickFigure, type Pose } from "../figures/StickFigure";
import { FIGURES } from "../sources";
import { DISPLAY, MONO, NUMERALS, OUTLINE } from "../styles";
import { Z } from "../world";
import { SourceTag } from "./Numbers";

const RUN_SECONDS = 2.6;
const yearFade = (d: number) => depthFade(d, { far: 1.55, inEnd: 0.35 });

/** "THE SCAM WAVE": a runner crosses the outlined word and fills it in behind them. */
function WaveTitle() {
  const t = useT();
  const engine = useEngine();
  const run = useMotionValue(engine.isStatic ? 1 : 0);
  const fillClip = useTransform(run, (p) => `inset(-10% ${(1 - p) * 100}% -10% 0)`);
  const runnerLeft = useTransform(run, (p) => `${p * 100}%`);
  const [pose, setPose] = useState<Pose | null>(engine.isStatic ? null : "run");
  const stateRef = useRef<"idle" | "running" | "done">("idle");
  const tiltRef = useRef<HTMLDivElement>(null);

  const onFrame = ({ d }: NodeFrame) => {
    const tilt = 1 - easeOutCubic(clamp((1.9 - d) / 1.6));
    if (tiltRef.current) {
      tiltRef.current.style.transform =
        tilt < 0.001
          ? ""
          : `rotate(${5 * tilt}deg) skewY(${3 * tilt}deg) translateY(${40 * tilt}px)`;
    }
    if (stateRef.current === "idle" && d < 0.55) {
      stateRef.current = "running";
      setPose("run");
      animate(run, 1, { duration: RUN_SECONDS, ease: "linear" }).then(() => {
        if (stateRef.current !== "running") return;
        stateRef.current = "done";
        setPose("cheer");
      });
    } else if (stateRef.current !== "idle" && d > 1.7) {
      // Out of sight again: reset so it plays next time.
      stateRef.current = "idle";
      run.stop();
      run.set(0);
      setPose("run");
    }
  };

  const title = t("landing.wave.title");
  return (
    <WorldNode spec={{ z: Z.wave, y: -30, my: -40 }} onFrame={onFrame} anchor="wave">
      <div ref={tiltRef} className="origin-left">
        <h2 className={`${DISPLAY} relative text-[clamp(64px,12vw,170px)] leading-[0.85]`}>
          <span className={OUTLINE}>{title}</span>
          <motion.span aria-hidden className="absolute inset-0" style={{ clipPath: fillClip }}>
            {title}
          </motion.span>
          {pose && (
            <motion.span
              aria-hidden
              className="absolute bottom-[calc(100%-0.08em)] w-[0.34em] -translate-x-1/2"
              style={{ left: runnerLeft }}
            >
              <StickFigure pose={pose} className="w-full" />
            </motion.span>
          )}
        </h2>
        <p
          className={`${DISPLAY} mt-3 ml-[48%] text-[clamp(26px,3.4vw,46px)] leading-none sm:mt-4`}
        >
          {t("landing.wave.subtitle")}
        </p>
      </div>
    </WorldNode>
  );
}

const YEAR_TAGS = {
  2021: "landing.year.2021",
  2022: "landing.year.2022",
  2023: "landing.year.2023",
  2024: "landing.year.2024",
  2025: "landing.year.2025",
} as const;

const YEAR_ICONS: Record<number, LucideIcon> = {
  2021: MessageCircleWarning,
  2022: Banknote,
  2023: Users,
  2024: TrendingUp,
  2025: Siren,
};

function Poll() {
  const t = useT();
  const [answer, setAnswer] = useState<"yes" | "no" | null>(null);
  return (
    <div className="mt-3">
      <div className="flex items-center gap-2">
        {(
          [
            ["yes", ThumbsUp, "landing.year.pollYes"],
            ["no", ThumbsDown, "landing.year.pollNo"],
          ] as const
        ).map(([value, Icon, label]) => (
          <button
            key={value}
            type="button"
            aria-label={t(label)}
            aria-pressed={answer === value}
            onClick={() => setAnswer(value)}
            className="flex size-7 items-center justify-center rounded-full border border-current/40 transition hover:border-current aria-pressed:bg-[var(--land-thread)] aria-pressed:text-white"
          >
            <Icon className="size-3.5" />
          </button>
        ))}
        <span className={`${MONO} max-w-[170px] text-[8px] leading-relaxed opacity-60`}>
          {answer ? t("landing.year.pollThanks") : t("landing.year.poll")}
        </span>
      </div>
    </div>
  );
}

function YearEntry({ index }: { index: number }) {
  const t = useT();
  const entry = FIGURES.years[index];
  const Icon = YEAR_ICONS[entry.year];
  const yearFirst = index % 2 === 0;
  const lakh = (entry.complaints / 100000).toFixed(1);
  const crore = entry.crore.toLocaleString("en-IN");

  const year = (
    <p className={`${NUMERALS} text-[clamp(72px,9vw,124px)] leading-none font-light tabular-nums`}>
      {entry.year}
    </p>
  );
  const detail = (
    <div className="w-[min(250px,80vw)]">
      <p className={`${MONO} text-[8px] opacity-55`}>{t(YEAR_TAGS[entry.year])}</p>
      <div className="mt-2 flex items-start gap-3">
        <span className="relative mt-0.5 flex size-10 shrink-0 items-center justify-center">
          <span className="absolute top-0 left-1 size-6 rounded-full bg-[var(--land-orange)] opacity-80" />
          <Icon className="relative size-7" strokeWidth={1.4} />
        </span>
        <p className="text-[12.5px] leading-snug">{t("landing.year.body")(lakh, crore)}</p>
      </div>
      {entry.year === 2025 && <Poll />}
      <SourceTag id="mha2026" className="mt-2" />
    </div>
  );

  return (
    <WorldNode spec={{ z: Z.years[index], y: -10, my: 0, fade: yearFade }}>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-[min(220px,16vw)]">
        {yearFirst ? year : <div className="order-2 sm:order-1">{detail}</div>}
        {yearFirst ? detail : <div className="order-1 sm:order-2">{year}</div>}
      </div>
    </WorldNode>
  );
}

/** 04 So far: the title, then 2021 → 2025 down the vertical thread. */
export function ScamWave() {
  return (
    <>
      <WaveTitle />
      {FIGURES.years.map((entry, i) => (
        <YearEntry key={entry.year} index={i} />
      ))}
    </>
  );
}
