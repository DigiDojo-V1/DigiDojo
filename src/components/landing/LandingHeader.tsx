"use client";

import { ArrowRight, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useT } from "@/i18n/hooks";
import { APP_HOME } from "@/lib/routes";
import { useEngine } from "./engine";
import { SECTIONS } from "./world";

const DISPLAY = "font-[family-name:var(--font-land-display)]";
const MONO = "font-mono text-[10px] tracking-[0.18em] uppercase";

/** Top bar: wordmark on the left, MENU on the right, and the full-screen section menu. */
export function LandingHeader() {
  const t = useT();
  const engine = useEngine();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    engine.lock(open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, engine]);

  const go = (z: number) => {
    setOpen(false);
    engine.scrollToZ(z);
    if (engine.isStatic) {
      // No camera on the reduced-motion page: jump to the section's heading instead.
      document.getElementById(`land-${SECTIONS.find((s) => s.z === z)?.id}`)?.scrollIntoView();
    }
  };

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-center justify-between px-4 py-4 text-[var(--land-fg)] sm:px-5">
        <button
          type="button"
          onClick={() => go(SECTIONS[0].z)}
          className={`${DISPLAY} pointer-events-auto text-lg leading-none tracking-[0.06em] uppercase`}
        >
          {t("landing.brand")}
        </button>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          className={`${MONO} pointer-events-auto flex items-center gap-2.5`}
        >
          {t("landing.menu")}
          <span aria-hidden className="flex w-5 flex-col gap-[5px]">
            <span className="h-px w-full bg-current" />
            <span className="h-px w-full bg-current" />
          </span>
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <motion.nav
            aria-label={t("landing.menu")}
            className="fixed inset-0 z-40 flex flex-col bg-[#e8e4de] px-5 pt-4 pb-8 text-[#121212] sm:px-10"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.55, ease: [0.7, 0, 0.2, 1] }}
          >
            <div className="flex items-center justify-between">
              <span className={`${DISPLAY} text-lg tracking-[0.06em] uppercase`}>
                {t("landing.brand")}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className={`${MONO} flex items-center gap-2`}
                autoFocus
              >
                {t("landing.menu.close")}
                <X className="size-4" />
              </button>
            </div>
            <ol className="mt-auto flex flex-col gap-1 sm:gap-0">
              {SECTIONS.map((section, i) => (
                <motion.li
                  key={section.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.04, duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
                >
                  <button
                    type="button"
                    onClick={() => go(section.z)}
                    className="group flex items-baseline gap-4 text-left"
                  >
                    <span className="w-8 font-mono text-xs text-[#121212]/50">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`${DISPLAY} text-[clamp(2.4rem,8vh,5rem)] leading-[0.95] uppercase transition-colors group-hover:text-[#2f3be0]`}
                    >
                      {t(section.label)}
                    </span>
                  </button>
                </motion.li>
              ))}
            </ol>
            <Link
              href={APP_HOME}
              className={`${MONO} mt-8 inline-flex items-center gap-2 self-start rounded-full bg-[#121212] px-5 py-3 text-[#e8e4de]`}
            >
              {t("landing.menu.openApp")}
              <ArrowRight className="size-3.5" />
            </Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
