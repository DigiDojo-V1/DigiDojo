"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { BIG_BUTTON, CardBack, ScreenCard } from "@/components/home/ScreenCard";
import { DISPLAY, MONO } from "@/components/landing/styles";
import { useT, useText } from "@/i18n/hooks";
import type { LocalizedText, Scenario } from "./schema";

/** Fades the card's parts in one after another. */
const rise = (i: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.05 + i * 0.07, duration: 0.3 },
});

/**
 * The screen before a scenario: one card with the scenario's name, who you are, three short
 * instructions and a big Start button. Never names a red flag.
 */
export function ScenarioIntro({
  title,
  primer,
  backHref,
  onStart,
  onHowToPlay,
}: {
  title: LocalizedText;
  primer: NonNullable<Scenario["primer"]>;
  backHref: string;
  onStart: () => void;
  onHowToPlay: () => void;
}) {
  const t = useT();
  const text = useText();
  const steps = [t("primer.step1"), t("primer.step2"), t("primer.step3")];

  return (
    <ScreenCard>
      <div className="flex items-center justify-between gap-2">
        <CardBack href={backHref} label={t("nav.back")} />
        <button
          type="button"
          onClick={onHowToPlay}
          className={`${MONO} -mr-2 h-8 rounded-full px-3 text-black/55 transition hover:bg-black/5 hover:text-black/80`}
        >
          {t("primer.howToPlay")}
        </button>
      </div>

      <motion.h1
        {...rise(0)}
        className={`${DISPLAY} mt-6 text-[clamp(44px,11vw,72px)] leading-[0.9] md:mt-8`}
      >
        {text(title)}
      </motion.h1>
      <motion.p {...rise(1)} className="mt-4 text-lg leading-relaxed text-black/70">
        {text(primer.setup ?? primer.body)}
      </motion.p>

      <motion.ol {...rise(2)} className="mt-8 flex flex-col gap-3 border-t border-black/10 pt-6">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3 leading-snug text-black/75">
            <span className={`${MONO} w-4 shrink-0 leading-5 text-black/45`}>{i + 1}</span>
            {step}
          </li>
        ))}
      </motion.ol>

      <motion.div {...rise(3)} className="mt-8">
        <button type="button" onClick={onStart} className={BIG_BUTTON}>
          {t("primer.start")} <ArrowRight aria-hidden className="size-5" />
        </button>
      </motion.div>
    </ScreenCard>
  );
}
