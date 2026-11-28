"use client";

import { useT } from "@/i18n/hooks";
import { WorldNode, type NodeSpec } from "../engine";
import { DISPLAY, MONO, NUMERALS, STATIC_NIGHT } from "../styles";
import { Z } from "../world";

/** The scam tactics the dojos teach, scattered through the night sky at different depths. */
const WORDS: { key: Parameters<ReturnType<typeof useT>>[0]; spec: NodeSpec; size: string }[] = [
  {
    key: "tactic.urgency.label",
    spec: { z: Z.tactics + 0.05, x: -380, y: -40, mx: -70, my: (vp) => -vp.h * 0.12 },
    size: "text-[clamp(24px,3.2vw,44px)]",
  },
  {
    key: "tactic.authority.label",
    spec: { z: Z.tactics + 0.5, x: 260, y: -140, mx: 70, my: (vp) => -vp.h * 0.2 },
    size: "text-[clamp(22px,2.6vw,36px)]",
  },
  {
    key: "tactic.social-proof.label",
    spec: { z: Z.tactics + 0.25, x: -60, y: 10, mx: -20, my: (vp) => -vp.h * 0.02 },
    size: "text-[clamp(18px,1.9vw,26px)]",
  },
  {
    key: "tactic.pay-to-earn.label",
    spec: { z: Z.tactics - 0.06, x: 330, y: 120, mx: 60, my: (vp) => vp.h * 0.1 },
    size: "text-[clamp(24px,3vw,42px)]",
  },
  {
    key: "tactic.too-good-to-be-true.label",
    spec: { z: Z.tactics - 0.1, x: -330, y: 200, mx: -10, my: (vp) => vp.h * 0.22 },
    size: "text-[clamp(26px,3.6vw,50px)]",
  },
  {
    key: "tactic.small-win-first.label",
    spec: { z: Z.tactics + 0.7, x: 90, y: 270, mx: 40, my: (vp) => vp.h * 0.33 },
    size: "text-[clamp(20px,2.2vw,30px)]",
  },
];

/** 05 What you'll spot. */
export function Tactics() {
  const t = useT();
  return (
    <>
      <WorldNode
        spec={{ z: Z.tactics + 0.12, y: -235, my: (vp) => -vp.h * 0.34 }}
        anchor="learn"
        staticClassName={STATIC_NIGHT}
      >
        <div className="text-center">
          <h2 className={`${DISPLAY} text-[clamp(48px,6vw,84px)] leading-none`}>
            {t("landing.learn.title")}
          </h2>
          <p className={`${MONO} mt-2 text-[9px] opacity-55`}>{t("landing.learn.caption")}</p>
        </div>
      </WorldNode>
      {WORDS.map((word) => (
        <WorldNode key={word.key} spec={word.spec} staticClassName={`${STATIC_NIGHT} py-6`}>
          <p
            className={`${NUMERALS} ${word.size} leading-none font-normal tracking-wide uppercase`}
          >
            {t(word.key) as string}
          </p>
        </WorldNode>
      ))}
    </>
  );
}
