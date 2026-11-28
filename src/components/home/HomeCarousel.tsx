"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { DISPLAY, MONO } from "@/components/landing/styles";
import { isComingSoon, useDojoSummaries, type DojoSummary } from "@/components/layout/chrome-data";
import { DojoProgress } from "@/components/progress/DojoProgress";
import { dojoArt } from "@/dojos/art";
import { GRAIN_BACKGROUND } from "./art";
import { BIG_CARD, CARD_PAD as PAD, HomeShell } from "./HomeShell";
import { useT, useText } from "@/i18n/hooks";
import { dojoHref } from "@/lib/routes";
import { cn } from "@/lib/utils";

/** sessionStorage key for the last dojo shown. */
const SLIDE_KEY = "digidojo-home-slide";

/**
 * The app's home screen: a wordmark row, one big rounded card holding a carousel of dojos (one per
 * slide), and the helpline underneath. Each slide has the dojo's name, the three how-it-works steps,
 * a Start button and a progress bar. A dojo with art (`src/dojos/art.ts`) also gets its animated
 * illustration, its own card colour and a grain overlay.
 */
export function HomeCarousel() {
  const t = useT();
  const dojos = useDojoSummaries();
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  /** Where a button or key press is heading (a track position), so a second press goes one further. */
  const targetRef = useRef<number | null>(null);
  /** A finger is on the track: never move the strip under it. */
  const touchingRef = useRef(false);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // The carousel loops: the track is [copy of the last dojo, ...dojos, copy of the first]. Going
  // past either end lands on a copy, which is then swapped for the real slide it shows, so the strip
  // reads as endless. With one dojo there is nothing to loop.
  const count = dojos.length;
  const loop = count > 1;
  const offset = loop ? 1 : 0;
  const slides = loop
    ? [
        { dojo: dojos[count - 1], index: count - 1, copy: true },
        ...dojos.map((dojo, index) => ({ dojo, index, copy: false })),
        { dojo: dojos[0], index: 0, copy: true },
      ]
    : dojos.map((dojo, index) => ({ dojo, index, copy: false }));
  const last = slides.length - 1;

  const clampPosition = useCallback(
    (position: number) => Math.max(0, Math.min(last, position)),
    [last],
  );

  const scrollToSlide = useCallback((position: number, behavior: ScrollBehavior) => {
    const slide = slideRefs.current[position];
    trackRef.current?.scrollTo({ left: slide?.offsetLeft ?? 0, behavior });
  }, []);

  const scrollToPosition = useCallback(
    (position: number) => {
      const clamped = clampPosition(position);
      targetRef.current = clamped;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      scrollToSlide(clamped, reduce ? "auto" : "smooth");
    },
    [clampPosition, scrollToSlide],
  );

  /** Show dojo `index` (0-based). */
  const goTo = (index: number) => scrollToPosition(index + offset);

  const step = (delta: number) => {
    const track = trackRef.current;
    if (track === null || track.clientWidth === 0) return;
    const width = track.clientWidth;
    let to = (targetRef.current ?? Math.round(track.scrollLeft / width)) + delta;
    if (loop && (to < 0 || to > last)) {
      // Pressed again while heading onto a copy: hop one lap (the view doesn't change) and go on.
      const lap = to < 0 ? count : -count;
      track.scrollTo({ left: track.scrollLeft + lap * width, behavior: "instant" });
      to += lap;
    }
    scrollToPosition(to);
  };

  /** Resting on a copy: swap in the real slide it shows. Identical pixels, so nothing visibly moves. */
  const wrapIfOnCopy = () => {
    const track = trackRef.current;
    if (!loop || track === null || touchingRef.current || track.clientWidth === 0) return;
    const width = track.clientWidth;
    let lap = 0;
    if (Math.abs(track.scrollLeft) < 1) lap = count;
    else if (Math.abs(track.scrollLeft - last * width) < 1) lap = -count;
    if (lap === 0) return;
    targetRef.current = null;
    track.scrollTo({ left: track.scrollLeft + lap * width, behavior: "instant" });
  };

  /** Check for a copy once scrolling stops (scrollend isn't everywhere, so also after a pause). */
  const settleSoon = () => {
    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(wrapIfOnCopy, 120);
  };

  useEffect(() => () => clearTimeout(settleTimer.current), []);

  // The slide nearest the scroll position is the active one, however it got there (swipe,
  // trackpad, buttons). Remembered for the tab, so coming back from a dojo lands on the same one.
  const onScroll = () => {
    settleSoon();
    const track = trackRef.current;
    if (track === null || track.clientWidth === 0) return;
    const position = clampPosition(Math.round(track.scrollLeft / track.clientWidth));
    if (targetRef.current === position) targetRef.current = null;
    const index = slides[position].index;
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

  const onTouchStart = () => {
    touchingRef.current = true;
    dropTarget();
  };

  const onTouchEnd = () => {
    touchingRef.current = false;
    settleSoon();
  };

  // Before first paint, so coming back doesn't flash the first dojo (or, looping, the copy).
  useLayoutEffect(() => {
    let saved = 0;
    try {
      saved = Number(sessionStorage.getItem(SLIDE_KEY) ?? 0);
    } catch {
      // Storage blocked: start on the first dojo.
    }
    const index = Number.isInteger(saved) && saved > 0 && saved < count ? saved : 0;
    if (index + offset > 0) scrollToSlide(index + offset, "auto");
  }, [count, offset, scrollToSlide]);

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
        data-entrance-card
        className={cn(BIG_CARD, "relative flex min-h-[560px] flex-1 flex-col overflow-hidden")}
      >
        <div
          ref={trackRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onScroll={onScroll}
          onScrollEnd={wrapIfOnCopy}
          onPointerDown={dropTarget}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
          onWheel={dropTarget}
          className="relative flex flex-1 snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto overscroll-x-contain focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-black/40 [&::-webkit-scrollbar]:hidden"
        >
          {slides.map(({ dojo, index, copy }, position) => (
            <DojoSlide
              key={copy ? `copy-${position}` : dojo.id}
              ref={(el) => {
                slideRefs.current[position] = el;
              }}
              dojo={dojo}
              index={index}
              total={count}
              active={index === active}
              copy={copy}
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
  copy,
}: {
  ref: (el: HTMLDivElement | null) => void;
  dojo: DojoSummary;
  index: number;
  total: number;
  /** This dojo is the one shown: its art plays (a copy's too, so the swap is seamless). */
  active: boolean;
  /** A loop copy at either end of the track: seen mid-swipe only, hidden from assistive tech. */
  copy: boolean;
}) {
  const t = useT();
  const text = useText();
  const soon = isComingSoon(dojo.scenarioKeys);
  const steps = [t("chrome.how1"), t("chrome.how2"), t("chrome.how3")];
  const art = dojoArt(dojo.id);

  return (
    <div
      ref={ref}
      role={copy ? undefined : "group"}
      aria-roledescription={copy ? undefined : "slide"}
      aria-label={copy ? undefined : t("home.slide")(index + 1, total)}
      aria-hidden={copy || undefined}
      inert={copy || !active}
      className="relative flex w-full shrink-0 snap-center snap-always flex-col"
      style={art && { backgroundColor: art.background }}
    >
      <div className={cn(PAD, "relative flex flex-1 flex-col pt-6 md:pt-8 lg:pt-10")}>
        {/* Counter, top left. The carousel controls sit top right on phones. */}
        <p data-enter className={`${MONO} flex h-10 items-center text-black/55`}>
          {t("home.counter")(index + 1, total)}
          <span className="hidden sm:inline">&nbsp;· {t("dojo.eyebrow")(dojo.order)}</span>
        </p>

        {/*
          The dojo's illustration. Phones and tablets: full-bleed, filling the space between the
          counter and the name. Lg: the right half of the slide, from the card's top edge down to
          the Start row (h-12 + pt-2 + pb-8 = 88px), so the carousel controls never sit on it.
        */}
        {art && (
          <div
            aria-hidden
            data-enter
            className="relative -mx-5 max-h-[330px] min-h-[150px] flex-1 overflow-hidden md:-mx-8 md:max-h-[480px] lg:absolute lg:top-0 lg:right-0 lg:bottom-[88px] lg:mx-0 lg:max-h-none lg:w-[54%]"
          >
            <art.Scene paused={!active} className="absolute inset-0 size-full" />
          </div>
        )}

        <div className={cn("relative grid gap-10 lg:flex-1 lg:grid-cols-2", !art && "flex-1")}>
          <div className="flex flex-col justify-center py-4">
            <h2
              data-enter
              className={`${DISPLAY} text-[clamp(56px,min(11vw,16dvh),160px)] leading-[0.85]`}
            >
              {text(dojo.name)}
            </h2>
            <p data-enter className="mt-4 max-w-md text-base text-black/70 md:text-lg">
              {text(dojo.tagline)}
            </p>
            {!soon && (
              <p data-enter className={`${MONO} mt-3 text-black/50`}>
                {t("home.scenarioCount")(dojo.scenarioKeys.length)}
              </p>
            )}

            <ol className="mt-6 max-w-sm space-y-2.5 md:mt-8">
              {steps.map((step, i) => (
                <li key={i} data-enter className="flex gap-3 text-sm leading-snug text-black/70">
                  <span className={`${MONO} w-4 shrink-0 leading-5 text-black/45`}>{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Keeps the copy in the left half on lg; the illustration sits over this side. */}
          <div aria-hidden className="hidden lg:block" />
        </div>

        <div data-enter className="flex items-center pt-2 pb-6 md:pb-8">
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
      <div data-enter className={cn(PAD, "flex h-14 items-center border-t border-black/10")}>
        {!soon && (
          <div className="flex-1">
            <DojoProgress
              scenarioKeys={dojo.scenarioKeys}
              className="[&_[data-slot=progress-track]]:bg-black/10"
            />
          </div>
        )}
      </div>

      {/* Grain over the whole slide, so the flat vector art reads like the printed source. */}
      {art && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.16] mix-blend-multiply"
          style={{ backgroundImage: GRAIN_BACKGROUND }}
        />
      )}
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
      data-enter
      className={cn(
        "absolute top-6 right-5 flex h-10 items-center gap-2",
        // 56px status bar + 32px bottom padding = Start's bottom edge; h-12 row matches Start.
        "md:top-auto md:right-8 md:bottom-[88px] md:h-12 lg:right-10",
      )}
    >
      <button type="button" onClick={() => step(-1)} aria-label={t("home.prev")} className={arrow}>
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
      <button type="button" onClick={() => step(1)} aria-label={t("home.next")} className={arrow}>
        <ChevronRight aria-hidden className="size-5" />
      </button>
    </div>
  );
}
