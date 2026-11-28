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
import {
  ENTRANCE_ORANGE,
  PENDING_ATTR,
  finishEntrance,
  readEntrancePlan,
  type EntrancePlan,
} from "@/lib/entrance";

const OUT = [0.22, 1, 0.36, 1] as const;
const IN_OUT = [0.76, 0, 0.24, 1] as const;

const noSubscribe = () => () => {};
const serverPlan = (): EntrancePlan => "none";

/**
 * The first-ever arrival on the app home. Orange covers the screen (picked up from the landing's
 * CTA, or grown here on a direct visit), the giant DIGIDOJO wordmark rises letter by letter, then
 * the orange lifts away while the wordmark flies into the header and the card builds in.
 *
 * It finds what it reveals by data attributes, so the home page stays plain markup:
 * `data-entrance-wordmark` (the header wordmark it lands on), `data-entrance-card` (the big card),
 * `data-enter` (card contents, revealed in DOM order) and `data-enter-late` (header and footer
 * bits, revealed last). While the entrance runs, `<html data-entrance="pending">` hides them.
 */
export function Entrance() {
  const plan = useSyncExternalStore(noSubscribe, readEntrancePlan, serverPlan);
  const [done, setDone] = useState(false);
  const onDone = useCallback(() => setDone(true), []);
  if (plan === "none" || done) return null;
  return <EntranceOverlay plan={plan} onDone={onDone} />;
}

function EntranceOverlay({ plan, onDone }: { plan: "covered" | "grow"; onDone: () => void }) {
  const t = useT();
  const title = t("home.title");
  const rootRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const welcomeRef = useRef<HTMLParagraphElement>(null);
  const skipButtonRef = useRef<HTMLButtonElement>(null);
  const skipRef = useRef<() => void>(() => {});

  // Coming from the landing, the page is already under orange: hide what we'll reveal before the
  // first paint.
  useLayoutEffect(() => {
    if (plan !== "covered") return;
    document.documentElement.setAttribute(PENDING_ATTR, "pending");
    return () => document.documentElement.removeAttribute(PENDING_ATTR);
  }, [plan]);

  useEffect(() => {
    const html = document.documentElement;
    const root = rootRef.current;
    const cover = coverRef.current;
    const word = wordRef.current;
    const welcome = welcomeRef.current;
    const skip = skipButtonRef.current;
    if (!root || !cover || !word || !welcome || !skip) return;

    let cancelled = false;
    const running: AnimationPlaybackControlsWithThen[] = [];
    /** Remembers an animation (so skip and unmount can end it) and returns its finish. */
    const track = (controls: AnimationPlaybackControlsWithThen): Promise<unknown> => {
      running.push(controls);
      return controls.finished;
    };
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const finish = () => {
      html.removeAttribute(PENDING_ATTR);
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
      if (!root || !cover || !word || !welcome || !skip) return;

      // 1. Direct visit: grow the orange from the centre, like the landing's disc.
      if (plan === "grow") {
        const r = Math.hypot(window.innerWidth / 2, window.innerHeight / 2) + 4;
        await track(
          animate(
            cover,
            { clipPath: ["circle(0px at 50% 50%)", `circle(${r}px at 50% 50%)`] },
            { duration: 0.6, ease: [0.7, 0, 0.84, 0] },
          ),
        );
        if (cancelled) return;
        html.setAttribute(PENDING_ATTR, "pending");
        track(animate(skip, { opacity: 1 }, { duration: 0.3 }));
      }

      // 2. The wordmark rises letter by letter, then the welcome line.
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

      // 3. The orange lifts, the wordmark flies into the header, the card builds in.
      root.style.pointerEvents = "none";
      const flights: Promise<unknown>[] = [];
      const target = document.querySelector("[data-entrance-wordmark]");
      if (target) {
        const from = word.getBoundingClientRect();
        const to = target.getBoundingClientRect();
        flights.push(
          track(
            animate(
              word,
              {
                x: to.left + to.width / 2 - (from.left + from.width / 2),
                y: to.top + to.height / 2 - (from.top + from.height / 2),
                scale: to.width / from.width,
              },
              { duration: 0.9, ease: IN_OUT },
            ),
          ),
        );
      } else {
        flights.push(track(animate(word, { opacity: 0 }, { duration: 0.4 })));
      }
      track(animate([welcome, skip], { opacity: 0 }, { duration: 0.2 }));
      flights.push(track(animate(cover, { y: "-100%" }, { duration: 0.85, ease: IN_OUT })));
      flights.push(...buildPage(track, 0.3));

      await Promise.all(flights);
      if (cancelled) return;
      cancelled = true;
      finish();
    }

    void run();

    return () => {
      cancelled = true;
      running.forEach((c) => c.stop());
      html.removeAttribute(PENDING_ATTR);
    };
  }, [plan, onDone]);

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
        style={{
          backgroundColor: ENTRANCE_ORANGE,
          clipPath: plan === "grow" ? "circle(0px at 50% 50%)" : undefined,
        }}
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
        style={{ opacity: plan === "grow" ? 0 : undefined }}
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
  track: (c: AnimationPlaybackControlsWithThen) => Promise<unknown>,
  delay: number,
): Promise<unknown>[] {
  const out: Promise<unknown>[] = [];
  const card = document.querySelector("[data-entrance-card]");
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
    // Only the slide on show; the others are inert and off to the side.
    const items = Array.from(card.querySelectorAll("[data-enter]")).filter(
      (el) => el.closest("[inert]") === null,
    );
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
  }
  const late = document.querySelectorAll("[data-enter-late]");
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
