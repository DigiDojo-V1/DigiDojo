"use client";

import { motion } from "motion/react";
import { useRef } from "react";
import { useT } from "@/i18n/hooks";
import { clamp, depthFade } from "../camera";
import { WorldNode, type NodeFrame } from "../engine";
import { DISPLAY, MONO } from "../styles";
import { Z } from "../world";

const uiFade = (d: number) => depthFade(d, { outStart: -0.04, outEnd: -0.28 });

function Letters({ word, offset }: { word: string; offset: number }) {
  return (
    <>
      {[...word].map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, y: "0.18em", filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            delay: 0.15 + (offset + i) * 0.055,
            duration: 0.8,
            ease: [0.2, 0.7, 0.2, 1],
          }}
        >
          {char}
        </motion.span>
      ))}
    </>
  );
}

/** 01 Home: the giant name that splits apart as the camera flies between its words. */
export function Hero() {
  const t = useT();
  const leftRef = useRef<HTMLSpanElement>(null);
  const rightRef = useRef<HTMLSpanElement>(null);
  const word1 = t("landing.hero.word1");
  const word2 = t("landing.hero.word2");

  const split = ({ d, vp, scale }: NodeFrame) => {
    const passed = clamp(-d / 0.42);
    const offset = (passed ** 1.6 * vp.w * 0.36) / scale;
    if (leftRef.current) leftRef.current.style.transform = `translateX(${-offset}px)`;
    if (rightRef.current) rightRef.current.style.transform = `translateX(${offset}px)`;
  };

  return (
    <>
      <WorldNode
        spec={{ z: Z.hero, y: -16, my: -30 }}
        onFrame={split}
        anchor="home"
        staticClassName="pt-24 pb-4"
      >
        <h1
          aria-label={`${word1}${word2}`}
          className={`${DISPLAY} flex gap-[0.2em] text-[min(23vw,33vh)] leading-[0.8] tracking-[0.005em]`}
        >
          <span ref={leftRef} aria-hidden className="flex will-change-transform">
            <Letters word={word1} offset={0} />
          </span>
          <span ref={rightRef} aria-hidden className="flex will-change-transform">
            <Letters word={word2} offset={word1.length} />
          </span>
        </h1>
      </WorldNode>

      <WorldNode
        spec={{
          z: Z.hero,
          x: (vp) => -vp.w / 2 + (vp.mobile ? 20 : 56),
          y: (vp) => vp.h / 2 - (vp.mobile ? 72 : 60),
          fade: uiFade,
        }}
        align="bottom-left"
        staticClassName="pt-0"
      >
        <motion.div
          className="w-[min(300px,72vw)]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          <p className={`${MONO} text-[9px] opacity-55`}>{t("landing.hero.eyebrow")}</p>
          <p className="mt-2 text-[13px] leading-[1.45]">{t("landing.hero.blurb")}</p>
        </motion.div>
      </WorldNode>

      <WorldNode
        spec={{
          z: Z.hero,
          x: (vp) => vp.w / 2 - (vp.mobile ? 28 : 64),
          y: (vp) => vp.h / 2 - (vp.mobile ? 28 : 60),
          fade: uiFade,
        }}
        align="bottom-right"
        staticClassName="hidden"
      >
        <motion.div
          className={`${MONO} flex items-center gap-3 text-[9px]`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <motion.span
            className="block h-6 w-px origin-top bg-current"
            animate={{ scaleY: [0, 1, 1], originY: [0, 0, 1], opacity: [1, 1, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
          {t("landing.hero.scroll")}
        </motion.div>
      </WorldNode>
    </>
  );
}
