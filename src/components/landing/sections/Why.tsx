"use client";

import { useRef } from "react";
import { useT } from "@/i18n/hooks";
import { clamp, easeOutCubic } from "../camera";
import { WorldNode, type NodeFrame } from "../engine";
import { LinkedInPhone } from "../figures/LinkedInPhone";
import { DISPLAY, MONO } from "../styles";
import { Z } from "../world";

/** Each line starts bent in 3D at its own angle and settles flat as the camera arrives. */
const WARPS = [
  { ry: -38, rx: 10, skew: -8, x: 60 },
  { ry: -26, rx: -6, skew: 7, x: 40 },
  { ry: -34, rx: 8, skew: -10, x: 70 },
  { ry: -20, rx: 12, skew: 5, x: 30 },
];

/** 02 Why: an iPhone with a LinkedIn DM beside "ONE TAP FROM A SCAM". */
export function Why() {
  const t = useT();
  const lineRefs = useRef<(HTMLElement | null)[]>([]);

  const warp = ({ d }: NodeFrame) => {
    const arrive = clamp(1 - (d - 0.08) / 1.5);
    WARPS.forEach((w, i) => {
      const el = lineRefs.current[i];
      if (!el) return;
      const k = 1 - easeOutCubic(clamp(arrive * 1.35 - i * 0.12));
      el.style.transform =
        k < 0.001
          ? ""
          : `translateX(${w.x * k}px) rotateY(${w.ry * k}deg) rotateX(${w.rx * k}deg) skewY(${w.skew * k}deg)`;
    });
  };

  return (
    <>
      <WorldNode
        spec={{ z: Z.why, x: -270, y: 10, mx: 0, my: (vp) => -vp.h * 0.2 }}
        anchor="why"
        staticClassName="pb-0"
      >
        <LinkedInPhone className="w-[min(17vh,175px)] group-data-[layout=wide]/land:w-[min(280px,36vh)]" />
      </WorldNode>

      <WorldNode spec={{ z: Z.why, x: 190, y: -6, mx: 0, my: (vp) => vp.h * 0.2 }} onFrame={warp}>
        <div className="w-[min(340px,84vw)] [perspective:700px]">
          <p
            ref={(el) => {
              lineRefs.current[0] = el;
            }}
            className={`${MONO} text-[9px] opacity-55`}
          >
            {t("landing.why.eyebrow")}
          </p>
          <h2 className={`${DISPLAY} mt-2 text-[clamp(44px,6vw,80px)] leading-[0.88]`}>
            <span
              ref={(el) => {
                lineRefs.current[1] = el;
              }}
              className="block origin-left"
            >
              {t("landing.why.title1")}
            </span>
            <span
              ref={(el) => {
                lineRefs.current[2] = el;
              }}
              className="block origin-left"
            >
              {t("landing.why.title2")}
            </span>
          </h2>
          <p
            ref={(el) => {
              lineRefs.current[3] = el;
            }}
            className="mt-4 origin-left text-[13px] leading-[1.55] sm:text-[14px]"
          >
            {t("landing.why.body")}
          </p>
        </div>
      </WorldNode>
    </>
  );
}
