"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { DISPLAY, MONO } from "@/components/landing/styles";
import { isComingSoon, useDojoSummaries, type DojoSummary } from "@/components/layout/chrome-data";
import { DojoProgress } from "@/components/progress/DojoProgress";
import { BIG_CARD, CARD_PAD as PAD, HomeShell } from "./HomeShell";
import { useT, useText } from "@/i18n/hooks";
import { dojoHref } from "@/lib/routes";
import { cn } from "@/lib/utils";

/** sessionStorage key for the last dojo shown. */
const SLIDE_KEY = "digidojo-home-slide";

/**
 * The app's home screen: a wordmark row, one big rounded card holding a carousel of dojos (one per
 * slide), and the helpline underneath. Each slide has the dojo's name, the three how-it-works steps,
 * a Start button and a progress bar. Lg screens keep an empty `art` area on the right of each slide
 * for illustrations.
 */
export function HomeCarousel() {
  const t = useT();
  const dojos = useDojoSummaries();
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  /** Where a button or key press is heading, so a second press during the scroll goes one further. */
  const targetRef = useRef<number | null>(null);

  const clampIndex = useCallback(
    (index: number) => Math.max(0, Math.min(dojos.length - 1, index)),
    [dojos.length],
  );

  const scrollToSlide = useCallback((index: number, behavior: ScrollBehavior) => {
    const slide = slideRefs.current[index];
    trackRef.current?.scrollTo({ left: slide?.offsetLeft ?? 0, behavior });
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const clamped = clampIndex(index);
      targetRef.current = clamped;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      scrollToSlide(clamped, reduce ? "auto" : "smooth");
    },
    [clampIndex, scrollToSlide],
  );

  const step = (delta: number) => goTo((targetRef.current ?? active) + delta);

  // The slide nearest the scroll position is the active one, however it got there (swipe,
  // trackpad, buttons). Remembered for the tab, so coming back from a dojo lands on the same one.
  const onScroll = () => {
    const track = trackRef.current;
    if (track === null || track.clientWidth === 0) return;
    const index = clampIndex(Math.round(track.scrollLeft / track.clientWidth));
    if (targetRef.current === index) targetRef.current = null;
    if (index === active) return;
    setActive(index);
    try {
      sessionStorage.setItem(SLIDE_KEY, String(index));
    } catch {
      // Storage blocked: the carousel just starts on the first dojo next time.
    }
  };

  /** The player took over (swipe, trackpad, wheel): forget any button/key target. */
  const dropTarget = () => {
    targetRef.current = null;
  };

  // Before first paint, so coming back doesn't flash the first dojo.
  useLayoutEffect(() => {
    let saved = 0;
    try {
      saved = Number(sessionStorage.getItem(SLIDE_KEY) ?? 0);
    } catch {
      return;
    }
    if (Number.isInteger(saved) && saved > 0) scrollToSlide(clampIndex(saved), "auto");
  }, [clampIndex, scrollToSlide]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    }
  };

  return (
    <HomeShell>
      <section
        aria-roledescription="carousel"
        aria-label={t("home.carousel")}
        className={cn(BIG_CARD, "relative flex min-h-[560px] flex-1 flex-col overflow-hidden")}
      >
        <div
          ref={trackRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onScroll={onScroll}
          onPointerDown={dropTarget}
          onTouchStart={dropTarget}
          onWheel={dropTarget}
          className="relative flex flex-1 snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto overscroll-x-contain focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-black/40 [&::-webkit-scrollbar]:hidden"
        >
          {dojos.map((dojo, i) => (
            <DojoSlide
              key={dojo.id}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              dojo={dojo}
              index={i}
              total={dojos.length}
              active={i === active}
            />
          ))}
        </div>

        <CarouselControls dojos={dojos} active={active} goTo={goTo} step={step} />
      </section>
    </HomeShell>
  );
}

/** One dojo: counter, name, tagline, steps, Start, and the progress bar along the bottom. */
function DojoSlide({
  ref,
  dojo,
  index,
  total,
  active,
}: {
  ref: (el: HTMLDivElement | null) => void;
  dojo: DojoSummary;
  index: number;
  total: number;
  active: boolean;
}) {
  const t = useT();
  const text = useText();
  const soon = isComingSoon(dojo.scenarioKeys);
  const steps = [t("chrome.how1"), t("chrome.how2"), t("chrome.how3")];

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      aria-label={t("home.slide")(index + 1, total)}
      inert={!active}
      className="flex w-full shrink-0 snap-center snap-always flex-col"
    >
      <div className={cn(PAD, "flex flex-1 flex-col pt-6 md:pt-8 lg:pt-10")}>
        {/* Counter, top left. The carousel controls sit top right on phones. */}
        <p className={`${MONO} flex h-10 items-center text-black/55`}>
          {t("home.counter")(index + 1, total)}
          <span className="hidden sm:inline">&nbsp;· {t("dojo.eyebrow")(dojo.order)}</span>
        </p>

        <div className="grid flex-1 gap-10 lg:grid-cols-2">
          <div className="flex flex-col justify-center py-4">
            <h2 className={`${DISPLAY} text-[clamp(56px,min(11vw,16dvh),160px)] leading-[0.85]`}>
              {text(dojo.name)}
            </h2>
            <p className="mt-4 max-w-md text-base text-black/70 md:text-lg">{text(dojo.tagline)}</p>
            {!soon && (
              <p className={`${MONO} mt-3 text-black/50`}>
                {t("home.scenarioCount")(dojo.scenarioKeys.length)}
              </p>
            )}

            <ol className="mt-6 max-w-sm space-y-2.5 md:mt-8">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm leading-snug text-black/70">
                  <span className={`${MONO} w-4 shrink-0 leading-5 text-black/45`}>{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Reserved for the dojo's illustration. Empty for now. */}
          <div data-slot="art" aria-hidden className="hidden lg:block" />
        </div>

        <div className="flex items-center pt-2 pb-6 md:pb-8">
          {soon ? (
            <span
              className={`${MONO} inline-flex h-12 w-full items-center justify-center rounded-full ring-1 ring-black/20 md:w-auto md:px-7`}
            >
              {t("home.comingSoon")}
            </span>
          ) : (
            <Link
              href={dojoHref(dojo.id)}
              className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#121212] px-7 text-sm font-semibold text-[#ece9e2] transition hover:bg-black active:scale-[0.98] md:w-auto"
            >
              {t("home.start")}
              <ArrowRight aria-hidden className="size-4 transition group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Status bar: this dojo's scenarios done. */}
      <div className={cn(PAD, "flex h-14 items-center border-t border-black/10")}>
        {!soon && (
          <div className="flex-1">
            <DojoProgress
              scenarioKeys={dojo.scenarioKeys}
              className="[&_[data-slot=progress-track]]:bg-black/10"
            />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Prev / dots / next. One set for the whole carousel, laid over the slides: top right on phones
 * (beside the counter, dots only: phones swipe), bottom right from tablets up (level with Start,
 * above the status bar).
 */
function CarouselControls({
  dojos,
  active,
  goTo,
  step,
}: {
  dojos: readonly DojoSummary[];
  active: number;
  goTo: (index: number) => void;
  step: (delta: number) => void;
}) {
  const t = useT();
  const text = useText();
  const arrow =
    "hidden size-10 items-center justify-center rounded-full sm:flex ring-1 ring-black/15 transition hover:bg-black/5 disabled:pointer-events-none disabled:opacity-30";

  return (
    <div
      className={cn(
        "absolute top-6 right-5 flex h-10 items-center gap-2",
        // 56px status bar + 32px bottom padding = Start's bottom edge; h-12 row matches Start.
        "md:top-auto md:right-8 md:bottom-[88px] md:h-12 lg:right-10",
      )}
    >
      <button
        type="button"
        onClick={() => step(-1)}
        disabled={active === 0}
        aria-label={t("home.prev")}
        className={arrow}
      >
        <ChevronLeft aria-hidden className="size-5" />
      </button>
      <div className="flex items-center gap-1 px-1">
        {dojos.map((dojo, i) => (
          <button
            key={dojo.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={t("home.goTo")(text(dojo.name))}
            aria-current={i === active ? "true" : undefined}
            className="flex size-6 items-center justify-center"
          >
            <span
              aria-hidden
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === active ? "w-5 bg-[#121212]" : "w-1.5 bg-black/25",
              )}
            />
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => step(1)}
        disabled={active === dojos.length - 1}
        aria-label={t("home.next")}
        className={arrow}
      >
        <ChevronRight aria-hidden className="size-5" />
      </button>
    </div>
  );
}
