"use client";

import { motion } from "motion/react";
import { useRef } from "react";
import { useT } from "@/i18n/hooks";
import { cn } from "@/lib/utils";
import { clamp, easeOutCubic } from "../camera";
import { useEngine, WorldNode, type NodeFrame } from "../engine";
import { ProfileSticker, SprayCan } from "../figures/Props";
import { DISPLAY, MONO, OUTLINE } from "../styles";
import { Z } from "../world";
import { SourceTag } from "./Numbers";

const LINES = [
  "landing.pretend.line1",
  "landing.pretend.line2",
  "landing.pretend.line3",
  "landing.pretend.line4",
] as const;

/** Who they pretend to be: outlined lines fill in as you scroll, and a spray can tags FAKE. */
export function Pretenders() {
  const t = useT();
  const engine = useEngine();
  const fillRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const squiggleRef = useRef<SVGPathElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const done = engine.isStatic;

  const fill = ({ d }: NodeFrame) => {
    const arrive = clamp((1.8 - d) / 1.65);
    fillRefs.current.forEach((el, i) => {
      if (!el) return;
      const p = easeOutCubic(clamp(arrive * 1.55 - i * 0.2));
      el.style.clipPath = `inset(-10% ${(1 - p) * 100}% -10% 0)`;
    });
  };

  const spray = ({ d }: NodeFrame) => {
    const p = clamp(((1.5 - d) / 1.35) * 1.3 - 0.3);
    if (squiggleRef.current) squiggleRef.current.style.strokeDashoffset = String(1 - p);
    if (tagRef.current) tagRef.current.style.clipPath = `inset(0 ${(1 - p) * 100}% 0 0)`;
  };

  return (
    <>
      <WorldNode
        spec={{
          z: Z.pretenders,
          x: -420,
          y: -120,
          mx: (vp) => -vp.w * 0.24,
          my: (vp) => -vp.h * 0.3,
        }}
        staticClassName="pb-0"
      >
        <ProfileSticker className="w-[130px] group-data-[layout=wide]/land:w-[200px]" />
      </WorldNode>

      <WorldNode
        spec={{ z: Z.pretenders, x: 40, y: 0, mx: 0, my: (vp) => vp.h * 0.06 }}
        onFrame={fill}
      >
        <div className="w-max">
          <p className={`${MONO} text-[9px] opacity-55`}>{t("landing.pretend.eyebrow")}</p>
          <ul className={`${DISPLAY} mt-2 text-[clamp(38px,5.6vw,78px)] leading-[0.9]`}>
            {LINES.map((key, i) => (
              <li
                key={key}
                className={cn(
                  "relative",
                  i === LINES.length - 1 &&
                    "text-[var(--land-thread)] [--outline:var(--land-thread)]",
                )}
              >
                <span className={OUTLINE}>{t(key)}</span>
                <span
                  ref={(el) => {
                    fillRefs.current[i] = el;
                  }}
                  aria-hidden
                  className="absolute inset-0"
                  style={done ? undefined : { clipPath: "inset(-10% 100% -10% 0)" }}
                >
                  {t(key)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 w-[min(360px,84vw)] text-[12.5px] leading-snug opacity-80">
            {t("landing.pretend.stat")}
          </p>
          <SourceTag id="aser2023" className="mt-2" />
        </div>
      </WorldNode>

      <WorldNode
        spec={{
          z: Z.pretenders - 0.1,
          x: 400,
          y: 70,
          mx: (vp) => vp.w * 0.26,
          my: (vp) => -vp.h * 0.3,
        }}
        onFrame={spray}
        staticClassName="hidden"
      >
        <div className="relative h-[150px] w-[150px] sm:h-[190px] sm:w-[210px]">
          {/* The tag the can sprays: an orange scribble and the word FAKE. */}
          <svg
            viewBox="0 0 120 60"
            className="absolute top-2 left-0 w-[110px] sm:w-[130px]"
            aria-hidden
          >
            <path
              ref={squiggleRef}
              d="M6 40c8-14 14-18 18-8s6 12 12-2 10-20 16-6 4 16 12 4 10-18 18-8 8 10 20 2"
              fill="none"
              stroke="#ec7230"
              strokeWidth="6"
              strokeLinecap="round"
              pathLength={1}
              style={{ strokeDasharray: 1, strokeDashoffset: done ? 0 : 1 }}
            />
          </svg>
          <span
            ref={tagRef}
            className={`${DISPLAY} absolute top-[46px] left-[10px] -rotate-12 text-[34px] leading-none text-[#ec7230] sm:top-[58px] sm:text-[42px]`}
            style={done ? undefined : { clipPath: "inset(0 100% 0 0)" }}
          >
            {t("landing.pretend.tag")}
          </span>
          <motion.div
            className="absolute right-0 bottom-0 w-[54px] origin-bottom sm:w-[64px]"
            animate={{ rotate: [-24, -16, -24] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <SprayCan className="w-full drop-shadow-[0_10px_12px_rgba(0,0,0,0.3)]" />
          </motion.div>
        </div>
      </WorldNode>
    </>
  );
}
