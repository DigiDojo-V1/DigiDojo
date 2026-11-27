"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import {
  ChevronLeft,
  CircleHelp,
  Crosshair,
  MessageCircleQuestion,
  Scale,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT, useText } from "@/i18n/hooks";
import { LanguageToggle } from "@/i18n/LanguageToggle";
import type { Scenario } from "./schema";

/** Fades the intro's sections in one after another. */
const rise = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.06 + i * 0.08, duration: 0.3 },
});

/**
 * The screen before a scenario: your situation, the trick, questions to ask yourself (easy
 * scenarios only), and what you're aiming for. Never names a red flag.
 */
export function ScenarioIntro({
  primer,
  backHref,
  onStart,
  onHowToPlay,
}: {
  primer: NonNullable<Scenario["primer"]>;
  backHref: string;
  onStart: () => void;
  onHowToPlay: () => void;
}) {
  const t = useT();
  const text = useText();
  let i = 0;

  return (
    <main className="flex flex-1 flex-col p-4 md:rounded-lg md:bg-white md:p-6 md:ring-1 md:ring-black/10">
      <div className="flex h-9 items-center justify-between gap-2">
        <Link
          href={backHref}
          aria-label={t("nav.backToDojo")}
          className="-ml-1.5 rounded-full p-1.5 hover:bg-muted"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onHowToPlay}
            className="flex h-8 items-center gap-1 rounded-full border px-3 text-xs font-medium hover:bg-muted"
          >
            <CircleHelp className="size-3.5" aria-hidden /> {t("primer.howToPlay")}
          </button>
          <LanguageToggle />
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-3 py-4">
        {primer.setup !== undefined && (
          <motion.section {...rise(i++)} className="rounded-2xl bg-muted p-4">
            <Eyebrow icon={<User className="size-4" />}>{t("primer.setup")}</Eyebrow>
            <p className="mt-2 leading-relaxed">{text(primer.setup)}</p>
          </motion.section>
        )}

        <motion.section {...rise(i++)} className="rounded-2xl border p-4">
          <Eyebrow icon={<Sparkles className="size-4" />}>{t("primer.eyebrow")}</Eyebrow>
          <h1 className="mt-1.5 text-xl font-bold tracking-tight">{text(primer.title)}</h1>
          <p className="mt-2 leading-relaxed text-muted-foreground">{text(primer.body)}</p>
        </motion.section>

        {primer.watchFor !== undefined && (
          <motion.section {...rise(i++)} className="rounded-2xl border p-4">
            <Eyebrow icon={<MessageCircleQuestion className="size-4" />}>
              {t("primer.watchFor")}
            </Eyebrow>
            <ul className="mt-2 flex flex-col gap-2">
              {primer.watchFor.map((question, k) => (
                <li key={k} className="flex gap-2 leading-snug">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground text-[11px] font-bold text-background">
                    {k + 1}
                  </span>
                  {text(question)}
                </li>
              ))}
            </ul>
          </motion.section>
        )}

        <motion.section {...rise(i++)}>
          <Eyebrow>{t("primer.goals")}</Eyebrow>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <Goal icon={<Crosshair className="size-4" />} label={t("primer.goalSpot")} />
            <Goal icon={<Scale className="size-4" />} label={t("primer.goalCalm")} />
            <Goal icon={<ShieldCheck className="size-4" />} label={t("primer.goalDecide")} />
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {t("primer.someGenuine")}
          </p>
        </motion.section>

        <motion.div {...rise(i++)}>
          <Button size="lg" className="mt-1 h-11 w-full" onClick={onStart}>
            {t("primer.start")}
          </Button>
        </motion.div>
      </div>
    </main>
  );
}

function Eyebrow({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
      {icon}
      {children}
    </p>
  );
}

function Goal({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-center text-xs leading-tight font-medium">
      <span aria-hidden>{icon}</span>
      {label}
    </div>
  );
}
