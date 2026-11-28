"use client";

import { Check, Copy, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useT } from "@/i18n/hooks";
import { APP_HOME } from "@/lib/routes";
import { clamp, easeOutCubic, lerp } from "../camera";
import { useEngine, WorldNode, type NodeFrame } from "../engine";
import { Parachutist } from "../figures/Props";
import { SOURCES } from "../sources";
import { DISPLAY, MONO, NUMERALS } from "../styles";
import { Z } from "../world";

/** Timings of the parachute drop, in seconds. */
const FALL = 0.9;
const CANOPY_OPEN = [0.45, 0.85] as const;
const DROP = 0.5;

/** A bouncy landing for dropped letters. */
const easeOutBack = (t: number) => {
  const c = clamp(t);
  const k = 1.70158;
  return 1 + (k + 1) * (c - 1) ** 3 + k * (c - 1) ** 2;
};

interface Slot {
  x: number;
  y: number;
}

/** "DON'T TAKE THE BAIT": a parachutist drifts across and drops each letter into place. */
function DropTitle() {
  const t = useT();
  const engine = useEngine();
  const title = t("landing.finale.title");
  const chars = [...title];
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const figureRef = useRef<HTMLDivElement>(null);
  const canopyRef = useRef<SVGGElement>(null);
  const state = useRef<{ playing: boolean; t0: number; slots: Slot[]; height: number }>({
    playing: false,
    t0: 0,
    slots: [],
    height: 0,
  });

  const hideAll = () => {
    letterRefs.current.forEach((el) => {
      if (el) el.style.opacity = "0";
    });
    if (figureRef.current) figureRef.current.style.opacity = "0";
  };

  const onFrame = ({ d, now }: NodeFrame) => {
    const s = state.current;
    if (!s.playing && d < 0.55) {
      s.playing = true;
      s.t0 = now;
      s.slots = letterRefs.current.map((el) =>
        el
          ? { x: el.offsetLeft + el.offsetWidth / 2, y: el.offsetTop + el.offsetHeight / 2 }
          : { x: 0, y: 0 },
      );
      s.height = letterRefs.current[0]?.offsetHeight ?? 100;
    } else if (s.playing && d > 1.3) {
      s.playing = false;
    }
    if (!s.playing) return hideAll();

    const tau = (now - s.t0) / 1000;
    const visible = s.slots.filter((_, i) => chars[i].trim() !== "");
    const x0 = (visible[0]?.x ?? 0) - 30;
    const x1 = (visible[visible.length - 1]?.x ?? 0) + 40;
    const drift = Math.max(2.2, visible.length * 0.15);
    const restY = -s.height * 1.15;
    const startY = -s.height * 4.5;

    const figureAt = (time: number) => {
      if (time < FALL) return { x: x0, y: lerp(startY, restY, easeOutCubic(time / FALL)) };
      const k = (time - FALL) / drift;
      if (k <= 1) return { x: lerp(x0, x1, k), y: restY + Math.sin(time * 3) * 5 };
      const after = time - FALL - drift;
      return { x: x1 + after * 120, y: restY + Math.sin(time * 3) * 5 - after * 90 };
    };

    const fig = figureAt(tau);
    const figure = figureRef.current;
    if (figure) {
      const leaving = clamp((tau - FALL - drift) / 1.2);
      figure.style.opacity = String(1 - leaving);
      figure.style.transform = `translate3d(${fig.x - 32}px, ${fig.y - 62}px, 0)`;
    }
    if (canopyRef.current) {
      const open = easeOutCubic((tau - CANOPY_OPEN[0]) / (CANOPY_OPEN[1] - CANOPY_OPEN[0]));
      canopyRef.current.style.transform = `scale(${0.08 + 0.92 * open}, ${0.2 + 0.8 * open})`;
    }

    const dropAt = (slot: Slot) => FALL + drift * clamp((slot.x - x0) / (x1 - x0));
    let rank = 0;
    chars.forEach((char, i) => {
      const el = letterRefs.current[i];
      const slot = s.slots[i];
      if (!el || !slot || char.trim() === "") return;
      const tDrop = dropAt(slot);
      el.style.opacity = "1";
      if (tau < tDrop) {
        // Still hanging on the string under the figure.
        const x = fig.x - slot.x;
        const y = fig.y + 8 + rank * 15 - slot.y;
        rank++;
        el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(90deg) scale(0.34)`;
        return;
      }
      const from = figureAt(tDrop);
      const q = (tau - tDrop) / DROP;
      const x = lerp(from.x - slot.x, 0, easeOutCubic(q));
      const y = lerp(from.y + 8 - slot.y, 0, easeOutBack(q));
      const rotate = 90 * (1 - easeOutCubic(q));
      const scale = lerp(0.34, 1, easeOutCubic(q));
      el.style.transform =
        q >= 1 ? "" : `translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg) scale(${scale})`;
    });
  };

  return (
    <WorldNode
      spec={{ z: Z.finale, y: -70, my: (vp) => -vp.h * 0.12 }}
      onFrame={onFrame}
      anchor="help"
      staticClassName="pb-0"
    >
      <h2
        aria-label={title}
        className={`${DISPLAY} relative text-[clamp(52px,8.4vw,128px)] leading-[0.9] whitespace-nowrap`}
      >
        {chars.map((char, i) => (
          <span
            key={i}
            aria-hidden
            ref={(el) => {
              letterRefs.current[i] = el;
            }}
            className="inline-block whitespace-pre will-change-transform"
            style={engine.isStatic ? undefined : { opacity: 0 }}
          >
            {char}
          </span>
        ))}
        {!engine.isStatic && <Parachutist ref={figureRef} canopyRef={canopyRef} />}
      </h2>
    </WorldNode>
  );
}

function SourcesPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT();
  const engine = useEngine();
  useEffect(() => {
    engine.lock(open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, engine]);
  // Portalled to <body> so it sits above the header, outside the fixed stage.
  const isClient = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal
          aria-label={t("landing.sources.title")}
          className="fixed inset-0 z-40 overflow-y-auto bg-[#e8e4de] px-5 pt-4 pb-10 text-[#121212] sm:px-10"
          initial={{ clipPath: "inset(100% 0 0 0)" }}
          animate={{ clipPath: "inset(0% 0 0 0)" }}
          exit={{ clipPath: "inset(100% 0 0 0)" }}
          transition={{ duration: 0.55, ease: [0.7, 0, 0.2, 1] }}
        >
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className={`${MONO} flex items-center gap-2`}
              autoFocus
            >
              {t("landing.menu.close")}
              <X className="size-4" />
            </button>
          </div>
          <div className="mx-auto mt-10 max-w-2xl">
            <h2 className={`${DISPLAY} text-[clamp(48px,8vw,96px)] leading-none`}>
              {t("landing.sources.title")}
            </h2>
            <p className="mt-4 text-sm opacity-70">{t("landing.sources.intro")}</p>
            <ol className="mt-8 flex flex-col gap-6">
              {Object.values(SOURCES).map((source, i) => (
                <li key={source.id} className="flex gap-4">
                  <span className="font-mono text-xs opacity-50">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-[14px] leading-snug">{source.title}</p>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block font-mono text-[11px] break-all text-[#2f3be0] underline-offset-2 hover:underline"
                    >
                      {source.url}
                    </a>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/** 08 1930: the parachute title, the helpline and the footer. */
export function Finale() {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const number = t("landing.finale.number");
  const closeSources = useCallback(() => setSourcesOpen(false), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(number);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked; the number is on screen anyway.
    }
  };

  return (
    <>
      <DropTitle />

      <WorldNode spec={{ z: Z.finale, y: 70, my: (vp) => vp.h * 0.04 }} staticClassName="pt-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <p className={`${NUMERALS} text-[clamp(24px,2.8vw,36px)] leading-none`}>
              {t("landing.finale.help")} <strong className="font-medium">{number}</strong>
            </p>
            <button
              type="button"
              onClick={copy}
              className={`${MONO} inline-flex items-center gap-1.5 rounded-full border border-current/50 px-3 py-1.5 text-[8px] transition hover:border-current`}
            >
              {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
              {copied ? t("landing.finale.copied") : t("landing.finale.copy")}
            </button>
          </div>
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noreferrer"
            className="text-[12px] underline-offset-2 opacity-60 hover:underline"
          >
            {t("landing.finale.report")}
          </a>
        </div>
      </WorldNode>

      <WorldNode
        spec={{ z: Z.finale, y: (vp) => vp.h / 2 - (vp.w < 640 ? 62 : 34) }}
        align="center"
        staticClassName="pt-4 pb-10"
      >
        <nav
          className={`${MONO} flex w-[min(92vw,820px)] flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[8px] opacity-60`}
        >
          <button
            type="button"
            onClick={() => setSourcesOpen(true)}
            className="uppercase hover:opacity-100"
          >
            {t("landing.footer.sources")}
          </button>
          <Link href={APP_HOME} className="hover:opacity-100">
            {t("landing.footer.openApp")}
          </Link>
          <span>{t("landing.footer.simulation")}</span>
          <span>{t("landing.footer.copyright")}</span>
        </nav>
      </WorldNode>

      <SourcesPanel open={sourcesOpen} onClose={closeSources} />
    </>
  );
}
