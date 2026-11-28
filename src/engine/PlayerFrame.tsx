"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Flag, LogOut, MousePointerClick } from "lucide-react";
import { useT } from "@/i18n/hooks";
import { LanguageToggle } from "@/i18n/LanguageToggle";
import { useIsDesktop } from "@/lib/useMediaQuery";
import { PanelSlotContext } from "@/shells/panel-slot";
import { SimulationBadge } from "@/shells/SimulationBadge";
import { useRunStore } from "./store";

/**
 * The frame around a fake app while playing.
 * - Phones: a 420 px column, as before (640 px on tablets). Choices sit under the app.
 * - Desktop: the app fills the screen in its desktop layout, with the Dojo panel docked on the
 *   right: the Simulation label, language, instructions, flag count, choices and exit.
 */
export function PlayerFrame({
  title,
  backHref,
  children,
}: {
  /** Scenario title, in the player's language. */
  title: string;
  backHref: string;
  children: ReactNode;
}) {
  const desktop = useIsDesktop();
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  return (
    <PanelSlotContext.Provider value={desktop ? slot : null}>
      <div className="min-h-dvh lg:flex lg:h-dvh lg:overflow-hidden">
        <div className="relative mx-auto flex min-h-dvh w-full max-w-[420px] flex-col bg-background shadow-xl md:max-w-[640px] lg:h-dvh lg:min-h-0 lg:max-w-none lg:min-w-0 lg:flex-1 lg:shadow-none">
          {children}
        </div>
        {desktop && <DojoPanelAside title={title} backHref={backHref} slotRef={setSlot} />}
      </div>
    </PanelSlotContext.Provider>
  );
}

/** Width of the docked panel, shared with overlays that must leave it uncovered. */
export const PANEL_WIDTH_CLASS = "w-[340px]";

function DojoPanelAside({
  title,
  backHref,
  slotRef,
}: {
  title: string;
  backHref: string;
  slotRef: (el: HTMLElement | null) => void;
}) {
  const t = useT();
  const flagCount = useRunStore((s) => Object.keys(s.flags).length);

  return (
    <aside
      aria-label={t("panel.label")}
      className={`relative z-[60] flex h-dvh ${PANEL_WIDTH_CLASS} shrink-0 flex-col border-l border-black/10 bg-white`}
    >
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-black/5 bg-neutral-100 px-4">
        <SimulationBadge />
        <LanguageToggle />
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t("panel.label")}
          </p>
          <h2 className="mt-0.5 text-lg leading-snug font-semibold">{title}</h2>
        </div>
        <div className="flex gap-2.5 rounded-lg bg-neutral-100 p-3 text-sm leading-snug text-neutral-700">
          <MousePointerClick className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>{t("panel.instructions")}</p>
        </div>
        <p
          className="flex items-center gap-1.5 self-start rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200"
          aria-live="polite"
        >
          <Flag className="size-3 fill-red-500" aria-hidden /> {t("panel.flagged")(flagCount)}
        </p>
        {/* Choices and triage labels render here through <DojoPanel>. */}
        <div ref={slotRef} className="peer flex flex-col gap-3" />
        <p className="hidden text-sm text-muted-foreground italic peer-empty:block">
          {t("panel.waiting")}
        </p>
      </div>
      <div className="shrink-0 border-t border-black/10 p-3">
        <Link
          href={backHref}
          className="flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100"
        >
          <LogOut className="size-4" aria-hidden /> {t("panel.exit")}
        </Link>
      </div>
    </aside>
  );
}
