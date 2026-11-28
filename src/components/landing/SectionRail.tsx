"use client";

import { useRef, useState } from "react";
import { useT } from "@/i18n/hooks";
import { useFrame } from "./engine";
import { currentSection, SECTIONS, TIMELINE } from "./world";

const TICKS = SECTIONS.map((section) => TIMELINE.zToU(section.z));

/**
 * The right-hand progress rail: a hairline with a tick per section, a blue fill down to a dot,
 * and the current section's number and name riding beside the dot.
 */
export function SectionRail() {
  const t = useT();
  const fillRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef(0);
  const [current, setCurrent] = useState(0);

  useFrame(({ u, camZ }) => {
    const pct = `${(u * 100).toFixed(3)}%`;
    if (fillRef.current) fillRef.current.style.height = pct;
    if (markerRef.current) markerRef.current.style.top = pct;
    const index = currentSection(camZ);
    if (index !== currentRef.current) {
      currentRef.current = index;
      setCurrent(index);
    }
  });

  const section = SECTIONS[current];
  return (
    <aside
      aria-label={t("landing.rail.aria")}
      className="pointer-events-none fixed top-14 right-3 bottom-8 z-30 w-px text-[var(--land-fg)] sm:right-4"
    >
      <div className="absolute inset-0 bg-current opacity-15" />
      {TICKS.map((u, i) => (
        <div
          key={SECTIONS[i].id}
          className="absolute right-0 h-px w-1.5 bg-current opacity-30"
          style={{ top: `${u * 100}%` }}
        />
      ))}
      <div ref={fillRef} className="absolute top-0 left-0 w-px bg-[var(--land-thread)]" />
      <div ref={markerRef} className="absolute left-0">
        <div className="absolute -left-[3px] size-[7px] -translate-y-1/2 rounded-full bg-[var(--land-thread)]" />
        <div
          aria-live="polite"
          className="absolute right-3 hidden -translate-y-1/2 text-right font-mono text-[9px] leading-tight tracking-[0.16em] whitespace-nowrap uppercase sm:block"
        >
          <span className="block opacity-50">{String(current + 1).padStart(2, "0")}</span>
          <span className="block font-medium">{t(section.label)}</span>
        </div>
      </div>
    </aside>
  );
}
