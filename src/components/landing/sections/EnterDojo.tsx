"use client";

import { Play, Volume2 } from "lucide-react";
import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { useT } from "@/i18n/hooks";
import { cn } from "@/lib/utils";
import { APP_HOME } from "@/lib/routes";
import { clamp, easeInOutCubic, perspectiveScale, smoothstep } from "../camera";
import { useEngine, useFrame } from "../engine";
import { MONO, SERIF } from "../styles";
import { THREAD, Z } from "../world";

/** Where the orange disc appears on the thread, how fast it grows, and when it leaves. */
const APPEAR = Z.app - 3;
const COVERED = Z.app - 0.16;
const EXIT_FROM = Z.app + 0.12;
const EXIT_LENGTH = 1.35;
const MIN_RADIUS = 2.5;

function Player() {
  const t = useT();
  const barRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  return (
    <figure
      aria-label={t("landing.app.videoLabel")}
      className="overflow-hidden rounded-md bg-[#1a1a1a] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.55)]"
    >
      <video
        className="block aspect-[16/10] w-full bg-[#efeeeb] object-cover object-top"
        src="/landing/demo.webm"
        poster="/landing/demo-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (barRef.current && v.duration) {
            barRef.current.style.width = `${(v.currentTime / v.duration) * 100}%`;
          }
          if (timeRef.current && v.duration) {
            timeRef.current.textContent = `${fmt(v.currentTime)} / ${fmt(v.duration)}`;
          }
        }}
      />
      <figcaption className="flex items-center gap-3 px-3 py-2 text-white/80">
        <Play className="size-3 fill-current" />
        <div className="relative h-0.5 flex-1 rounded bg-white/20">
          <div ref={barRef} className="absolute inset-y-0 left-0 rounded bg-white" />
        </div>
        <span ref={timeRef} className="font-mono text-[9px] tabular-nums">
          0:00 / 0:12
        </span>
        <Volume2 className="size-3" />
      </figcaption>
    </figure>
  );
}

function Content() {
  const t = useT();
  return (
    <div className="mx-auto grid h-full w-full max-w-[1320px] content-center items-center gap-8 px-5 py-20 text-[#121212] sm:px-14 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.25fr)] md:gap-14">
      <div>
        <div className="flex items-center gap-3">
          <span
            className={`${MONO} rounded-full bg-[#121212] px-2.5 py-1 text-[8px] text-[#ec7230]`}
          >
            {t("landing.app.pill")}
          </span>
          <span className={`${SERIF} text-[28px] leading-none sm:text-[34px]`}>
            {t("landing.app.wordmark")}
          </span>
        </div>
        <h2 className={`${SERIF} mt-5 text-[clamp(36px,4.4vw,60px)] leading-[0.98]`}>
          {t("landing.app.headlineA")} <em className="italic">{t("landing.app.headlineEm")}</em>{" "}
          {t("landing.app.headlineB")}
        </h2>
        <p className="mt-5 max-w-[400px] text-[13.5px] leading-[1.55]">{t("landing.app.body")}</p>
        <p className={`${MONO} mt-4 text-[8px] opacity-70`}>{t("landing.app.meta")}</p>
        <Link
          href={APP_HOME}
          className="group mt-6 inline-flex items-center gap-3 rounded-full bg-[#121212] px-6 py-3.5 text-[14px] font-medium text-[#ece9e2] transition hover:gap-4"
        >
          {t("landing.app.cta")}
          <span aria-hidden className="h-px w-4 bg-current transition-all group-hover:w-6" />
        </Link>
      </div>
      <Player />
    </div>
  );
}

/**
 * 07 DigiDojo: an orange dot appears on the thread, grows until it floods the screen, shows
 * the app and its call to action, then shrinks into a card and drifts away.
 */
export function EnterDojo() {
  const engine = useEngine();
  const layerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoActive = useRef(false);

  useFrame(({ camZ, vp }) => {
    const layer = layerRef.current;
    const content = contentRef.current;
    if (!layer || !content) return;

    const exit = clamp((camZ - EXIT_FROM) / EXIT_LENGTH);
    const visible = camZ >= APPEAR && exit < 1;
    layer.style.visibility = visible ? "visible" : "hidden";
    if (!visible) return;

    // The disc sits on the thread; follow its projected centre while it grows.
    const anchor = THREAD.pointAtZ(Z.app);
    const scale = perspectiveScale(Math.max(Z.app - camZ, 0.15));
    const cx = vp.w / 2 + anchor.x * vp.sx * scale;
    const cy = vp.h / 2 + anchor.y * vp.sy * scale;
    const cover = Math.hypot(Math.max(cx, vp.w - cx), Math.max(cy, vp.h - cy)) + 4;
    const grow = clamp((camZ - APPEAR) / (COVERED - APPEAR));
    // Exponential growth reads as a dot rushing at you, like the reference.
    const radius = MIN_RADIUS * (cover / MIN_RADIUS) ** grow;

    if (exit <= 0) {
      layer.style.clipPath = grow >= 1 ? "none" : `circle(${radius}px at ${cx}px ${cy}px)`;
      layer.style.transform = "";
      layer.style.borderRadius = "0px";
      layer.style.boxShadow = "none";
      layer.style.opacity = "1";
    } else {
      const e = easeInOutCubic(exit);
      layer.style.clipPath = "none";
      layer.style.transform = `translate3d(0, ${-4 * e}vh, 0) scale(${1 - 0.72 * e})`;
      layer.style.borderRadius = `${Math.min(1, exit * 6) * 18}px`;
      layer.style.boxShadow = "0 40px 90px -30px rgba(0,0,0,0.45)";
      layer.style.opacity = String(1 - smoothstep((exit - 0.45) / 0.55));
    }

    const show = smoothstep((camZ - (COVERED - 0.08)) / 0.14);
    content.style.opacity = show.toFixed(3);
    const interactive = show > 0.9 && exit < 0.2;
    layer.style.pointerEvents = interactive ? "auto" : "none";

    const video = content.querySelector("video");
    const shouldPlay = show > 0.5 && exit < 0.8;
    if (video && shouldPlay !== videoActive.current) {
      videoActive.current = shouldPlay;
      if (shouldPlay) void video.play().catch(() => undefined);
      else video.pause();
    }
  });

  if (engine.isStatic) {
    return (
      <section id="land-app" className="bg-[#ec7230]">
        <Content />
      </section>
    );
  }

  return (
    <Layer layerRef={layerRef}>
      <div ref={contentRef} className="h-full overflow-y-auto" style={{ opacity: 0 }}>
        <Content />
      </div>
    </Layer>
  );
}

function Layer({
  layerRef,
  children,
}: {
  layerRef: React.RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  return (
    <div
      ref={layerRef}
      className={cn("absolute inset-0 z-20 origin-center bg-[#ec7230] will-change-transform")}
      style={{ visibility: "hidden", clipPath: "circle(0px at 50% 50%)", pointerEvents: "none" }}
    >
      {children}
    </div>
  );
}
