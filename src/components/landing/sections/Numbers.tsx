"use client";

import { useRef } from "react";
import { useT } from "@/i18n/hooks";
import { cn } from "@/lib/utils";
import { clamp, easeOutCubic, formatIndian } from "../camera";
import { WorldNode, type NodeFrame, type NodeSpec } from "../engine";
import { FIGURES, SOURCES, type SourceId } from "../sources";
import { MONO, NUMERALS, STATIC_NIGHT } from "../styles";
import { Z } from "../world";

/** A small "Source: …" link under a figure. */
export function SourceTag({ id, className }: { id: SourceId; className?: string }) {
  const t = useT();
  const source = SOURCES[id];
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noreferrer"
      title={source.title}
      className={cn(`${MONO} inline-block text-[8px] opacity-45 hover:opacity-90`, className)}
    >
      {t("landing.source")(source.short)} ↗
    </a>
  );
}

interface Stat {
  key: string;
  spec: NodeSpec;
  label: string;
  render: (progress: number) => { value: string; unit: string };
  source: SourceId;
  size: string;
}

/** 03 By the numbers: three figures at different depths that count up as you arrive. */
export function Numbers() {
  const t = useT();
  const valueRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  const stats: Stat[] = [
    {
      key: "lost",
      spec: { z: Z.numbers, x: -290, y: -40, mx: 0, my: (vp) => -vp.h * 0.27 },
      label: t("landing.numbers.lost.label"),
      render: (p) => ({
        value: `₹${formatIndian(FIGURES.lostCrore2025 * p)}`,
        unit: t("landing.numbers.lost.unit"),
      }),
      source: "mha2026",
      size: "text-[clamp(64px,10.5vw,150px)]",
    },
    {
      key: "complaints",
      spec: { z: Z.numbers + 0.32, x: 330, y: -150, mx: 0, my: 0 },
      label: t("landing.numbers.complaints.label"),
      render: (p) => ({
        value: formatIndian((FIGURES.complaints2025 / 100000) * p),
        unit: t("landing.numbers.complaints.unit"),
      }),
      source: "mha2026",
      size: "text-[clamp(64px,8.5vw,124px)]",
    },
    {
      key: "report",
      spec: { z: Z.numbers + 0.14, x: 60, y: 175, mx: 0, my: (vp) => vp.h * 0.27 },
      label: t("landing.numbers.report.label"),
      render: (p) => ({ value: `${Math.round(FIGURES.canReportPct * p)}%`, unit: "" }),
      source: "nsoCms2025",
      size: "text-[clamp(72px,12vw,176px)]",
    },
  ];

  const countUp = (key: string, render: Stat["render"]) => (frame: NodeFrame) => {
    const el = valueRefs.current[key];
    if (!el) return;
    const progress = easeOutCubic(clamp((2.1 - frame.d) / 2));
    const { value } = render(progress);
    if (el.textContent !== value) el.textContent = value;
  };

  return (
    <>
      {stats.map((stat, i) => {
        const final = stat.render(1);
        return (
          <WorldNode
            key={stat.key}
            spec={stat.spec}
            onFrame={countUp(stat.key, stat.render)}
            anchor={i === 0 ? "numbers" : undefined}
            staticClassName={STATIC_NIGHT}
          >
            <figure className="w-max">
              <figcaption className={`${MONO} max-w-[260px] text-[9px] leading-relaxed opacity-60`}>
                {stat.label}
              </figcaption>
              <p className={`${NUMERALS} ${stat.size} mt-1 leading-[0.9] font-light tabular-nums`}>
                <span
                  ref={(el) => {
                    valueRefs.current[stat.key] = el;
                  }}
                >
                  {final.value}
                </span>
                {final.unit && (
                  <span className="ml-[0.18em] text-[0.42em] font-normal">{final.unit}</span>
                )}
              </p>
              <SourceTag id={stat.source} className="mt-3" />
            </figure>
          </WorldNode>
        );
      })}
    </>
  );
}
