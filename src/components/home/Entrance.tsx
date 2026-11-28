"use client";

import { animate, stagger, type AnimationPlaybackControlsWithThen } from "motion/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { DISPLAY, MONO } from "@/components/landing/styles";
import { useT } from "@/i18n/hooks";
import { ENTRANCE_ORANGE, finishEntrance, isEntrancePending } from "@/lib/entrance";

const OUT = [0.22, 1, 0.36, 1] as const;
const IN_OUT = [0.76, 0, 0.24, 1] as const;

const noSubscribe = () => () => {};
const notOnServer = () => false;

/**
 * The arrival on the app home from a landing CTA. The page opens under the landing's orange, the
 * giant DIGIDOJO wordmark rises letter by letter, then the orange lifts away while the wordmark
 * flies into the header and the card builds in.
 *
 * It finds what it reveals by data attributes, so the home page stays plain markup:
 * `data-entrance-wordmark` (the header wordmark it lands on), `data-entrance-card` (the big card),
 * `data-enter` (card contents, revealed in DOM order) and `data-enter-late` (header and footer
 * bits, revealed last).
 */
export function Entrance() {
  const pending = useSyncExternalStore(noSubscribe, isEntrancePending, notOnServer);
  const [done, setDone] = useState(false);
  const onDone = useCallback(() => setDone(true), []);
  if (!pending || done) return null;
  return <EntranceOverlay onDone={onDone} />;
}

/** What the entrance reveals, found on the home page by data attribute. */
interface Targets {
  wordmark: HTMLElement | null;
  card: HTMLElement | null;
  /** The card's contents, in the slide on show (the others are inert and off to the side). */
  items: HTMLElement[];
  late: HTMLElement[];
}

function findTargets(): Targets {
  const card = document.querySelector<HTMLElement>("[data-entrance-card]");
  const items = card
    ? Array.from(card.querySelectorAll<HTMLElement>("[data-enter]")).filter(
        (el) => el.closest("[inert]") === null,
      )
    : [];
  return {
    wordmark: document.querySelector<HTMLElement>("[data-entrance-wordmark]"),
    card,
    items,
    late: Array.from(document.querySelectorAll<HTMLElement>("[data-enter-late]")),
  };
}

function allOf({ wordmark, card, items, late }: Targets): HTMLElement[] {
  return [wordmark, card, ...items, ...late].filter((el): el is HTMLElement => el !== null);
}

/** Hand the elements back to their own styles. */
function release(els: HTMLElement[]) {
  for (const el of els) {
    el.style.opacity = "";
    el.style.transform = "";
  }
}

function EntranceOverlay({ onDone }: { onDone: () => void }) {
  const t = useT();
  const title = t("home.title");
  const rootRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const welcomeRef = useRef<HTMLParagraphElement>(null);
  const skipButtonRef = useRef<HTMLButtonElement>(null);
  const targetsRef = useRef<Targets | null>(null);
  const skipRef = useRef<() => void>(() => {});

  // The page arrives under the orange: hide everything we'll reveal before the first paint.
  useLayoutEffect(() => {
    const targets = findTargets();
    targetsRef.current = targets;
    const els = allOf(targets);
    for (const el of els) el.style.opacity = "0";
    return () => release(els);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const cover = coverRef.current;
    const word = wordRef.current;
    const welcome = welcomeRef.current;
    const skip = skipButtonRef.current;
    const targets = targetsRef.current;
    if (!root || !cover || !word || !welcome || !skip || !targets) return;

    let cancelled = false;
    const running: AnimationPlaybackControlsWithThen[] = [];
    /** Remembers an animation (so skip and unmount can end it) and returns its finish. */
    const track = (controls: AnimationPlaybackControlsWithThen): Promise<unknown> => {
      running.push(controls);
      return controls.finished;
    };
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const finish = () => {
      release(allOf(targets));
      finishEntrance();
      onDone();
    };

    skipRef.current = () => {
      if (cancelled) return;
      cancelled = true;
      running.forEach((c) => c.complete());
      finish();
    };

    async function run() {
      if (!root || !cover || !word || !welcome || !skip || !targets) return;

      // 1. The wordmark rises letter by letter, then the welcome line.
      track(
        animate(
          word.querySelectorAll("[data-letter]"),
          { y: ["110%", "0%"] },
          { duration: 0.7, ease: OUT, delay: stagger(0.05, { startDelay: 0.1 }) },
        ),
      );
      await track(
        animate(welcome, { opacity: [0, 1], y: [8, 0] }, { duration: 0.5, delay: 0.45, ease: OUT }),
      );
      await wait(250);
      if (cancelled) return;

      // 2. The orange lifts, the wordmark flies into the header, the card builds in.
      root.style.pointerEvents = "none";
      const flights: Promise<unknown>[] = [];
      const { wordmark } = targets;
      if (wordmark) {
        const from = word.getBoundingClientRect();
        const to = wordmark.getBoundingClientRect();
        const flight = track(
          animate(
            word,
            {
              x: to.left + to.width / 2 - (from.left + from.width / 2),
              y: to.top + to.height / 2 - (from.top + from.height / 2),
              scale: to.width / from.width,
            },
            { duration: 0.9, ease: IN_OUT },
          ),
        ).then(() => {
          // Landed: swap to the real one, so there's only ever one wordmark on screen.
          wordmark.style.opacity = "";
          word.style.visibility = "hidden";
        });
        flights.push(flight);
      } else {
        flights.push(track(animate(word, { opacity: 0 }, { duration: 0.4 })));
      }
      track(animate([welcome, skip], { opacity: 0 }, { duration: 0.2 }));
      flights.push(track(animate(cover, { y: "-100%" }, { duration: 0.85, ease: IN_OUT })));
      flights.push(...buildPage(targets, track, 0.3));

      await Promise.all(flights);
      if (cancelled) return;
      cancelled = true;
      finish();
    }

    void run();

    return () => {
      cancelled = true;
      running.forEach((c) => c.stop());
    };
  }, [onDone]);

  // Any key or tap skips to the end.
  useEffect(() => {
    const onKey = () => skipRef.current();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] overflow-hidden"
      onPointerDown={() => skipRef.current()}
    >
      <div
        ref={coverRef}
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundColor: ENTRANCE_ORANGE }}
      />

      <div
        aria-hidden
        className="absolute inset-0 flex flex-col items-center justify-center gap-5 text-[#121212]"
      >
        <span
          ref={wordRef}
          className={`${DISPLAY} inline-flex overflow-hidden text-[clamp(72px,19vw,260px)] leading-none tracking-[0.06em]`}
        >
          {Array.from(title).map((letter, i) => (
            <span
              key={i}
              data-letter
              className="inline-block"
              style={{ transform: "translateY(110%)" }}
            >
              {letter}
            </span>
          ))}
        </span>
        <p ref={welcomeRef} className={`${MONO} text-black/70`} style={{ opacity: 0 }}>
          {t("home.entranceWelcome")}
        </p>
      </div>

      <button
        ref={skipButtonRef}
        type="button"
        onClick={() => skipRef.current()}
        className={`${MONO} absolute right-5 bottom-5 rounded-full px-4 py-2 text-black/60 ring-1 ring-black/20 transition hover:text-black`}
      >
        {t("home.entranceSkip")}
      </button>
    </div>
  );
}

/** Starts the card build-in after `delay` seconds; returns each animation's finish. */
function buildPage(
  { card, items, late }: Targets,
  track: (c: AnimationPlaybackControlsWithThen) => Promise<unknown>,
  delay: number,
): Promise<unknown>[] {
  const out: Promise<unknown>[] = [];
  if (card) {
    out.push(
      track(
        animate(
          card,
          { opacity: [0, 1], y: [56, 0], scale: [0.97, 1] },
          { duration: 0.9, ease: OUT, delay },
        ),
      ),
    );
  }
  if (items.length > 0) {
    out.push(
      track(
        animate(
          items,
          { opacity: [0, 1], y: [18, 0] },
          { duration: 0.6, ease: OUT, delay: stagger(0.06, { startDelay: delay + 0.25 }) },
        ),
      ),
    );
  }
  if (late.length > 0) {
    out.push(
      track(
        animate(
          late,
          { opacity: [0, 1] },
          { duration: 0.5, delay: stagger(0.08, { startDelay: delay + 0.6 }) },
        ),
      ),
    );
  }
  return out;
}
