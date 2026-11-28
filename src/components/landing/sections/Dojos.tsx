"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useDojoSummaries } from "@/components/layout/chrome-data";
import { useT, useText } from "@/i18n/hooks";
import { dojoHref } from "@/lib/routes";
import { clamp, easeOutCubic } from "../camera";
import { WorldNode, type NodeFrame } from "../engine";
import { DISPLAY, MONO, NUMERALS } from "../styles";
import { Z } from "../world";

/** Dojos whose only scenario is the scaffold placeholder have nothing to show yet. */
const isComingSoon = (scenarioKeys: readonly string[]) =>
  scenarioKeys.length === 0 || scenarioKeys.every((key) => key.endsWith("/coming-soon"));

/** Card positions along the looping thread, alternating sides like the reference. */
const CARD_PLACES = [
  { x: -250, y: -30 },
  { x: 270, y: -70 },
  { x: -180, y: 30 },
  { x: 300, y: -20 },
];

function DojosTitle() {
  const t = useT();
  const tiltRef = useRef<HTMLDivElement>(null);
  const onFrame = ({ d }: NodeFrame) => {
    const tilt = 1 - easeOutCubic(clamp((2 - d) / 1.7));
    if (tiltRef.current) {
      tiltRef.current.style.transform =
        tilt < 0.001 ? "" : `rotate(${4 * tilt}deg) skewY(${3 * tilt}deg)`;
    }
  };
  return (
    <WorldNode
      spec={{ z: Z.dojosTitle, x: -40, y: -20, mx: 0, my: -20 }}
      onFrame={onFrame}
      anchor="dojos"
    >
      <div ref={tiltRef} className="origin-left">
        <h2 className={`${DISPLAY} text-[clamp(72px,10vw,150px)] leading-[0.86]`}>
          <span className="block">{t("landing.dojos.title1")}</span>
          <span className="block pl-[1.6em]">{t("landing.dojos.title2")}</span>
        </h2>
        <p className={`${MONO} mt-6 text-[9px] opacity-50`}>{t("landing.dojos.caption")}</p>
      </div>
    </WorldNode>
  );
}

/** 06 Dojos: the title, then one card per dojo along the thread. */
export function Dojos() {
  const t = useT();
  const text = useText();
  const dojos = useDojoSummaries();

  return (
    <>
      <DojosTitle />
      {dojos.slice(0, Z.dojos.length).map((dojo, i) => {
        const name = text(dojo.name);
        const soon = isComingSoon(dojo.scenarioKeys);
        return (
          <WorldNode key={dojo.id} spec={{ z: Z.dojos[i], ...CARD_PLACES[i], mx: 0, my: -10 }}>
            <Link href={dojoHref(dojo.id)} className="group block w-[min(380px,82vw)]">
              <div className="relative aspect-[16/10] overflow-hidden bg-black/10">
                {soon ? (
                  <div className="absolute inset-0 flex flex-col justify-between bg-[#121212] p-4 text-[#ece9e2]">
                    <span className={`${MONO} text-[8px] opacity-60`}>
                      {t("landing.dojos.soon")}
                    </span>
                    <span className={`${DISPLAY} text-[56px] leading-[0.85] opacity-90`}>
                      {name}
                    </span>
                  </div>
                ) : (
                  <Image
                    src={`/landing/dojo-${dojo.id}.jpg`}
                    alt={t("landing.dojos.imageAlt")(name)}
                    fill
                    sizes="(max-width: 768px) 82vw, 380px"
                    className="object-cover object-top transition duration-500 group-hover:scale-[1.03]"
                  />
                )}
              </div>
              <p className={`${MONO} mt-3 text-[8px] opacity-55`}>
                {String(i + 1).padStart(2, "0")} / {String(dojos.length).padStart(2, "0")}
              </p>
              <h3 className={`${NUMERALS} mt-1 text-[30px] leading-none font-normal uppercase`}>
                {name}
              </h3>
              <p className="mt-1 text-[12px] opacity-60">{text(dojo.tagline)}</p>
              <span
                className={`${MONO} mt-3 inline-flex items-center gap-2 text-[8px] opacity-80 group-hover:opacity-100`}
              >
                {t("landing.dojos.enter")}
                <ArrowRight className="size-3.5 text-[var(--land-thread)] transition group-hover:translate-x-1" />
              </span>
            </Link>
          </WorldNode>
        );
      })}
    </>
  );
}
