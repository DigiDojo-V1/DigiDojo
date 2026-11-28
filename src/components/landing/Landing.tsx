"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useSyncExternalStore, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { clamp, depthFade, easeOutCubic, lerp, perspectiveScale, smoothstep } from "./camera";
import {
  EngineProvider,
  resolveOffset,
  type Frame,
  type LandingEngine,
  type RegisteredNode,
  type Viewport,
} from "./engine";
import { landingFontVars } from "./fonts";
import { LandingHeader } from "./LandingHeader";
import { SectionRail } from "./SectionRail";
import { Dojos } from "./sections/Dojos";
import { EnterDojo } from "./sections/EnterDojo";
import { Finale } from "./sections/Finale";
import { Hero } from "./sections/Hero";
import { Numbers } from "./sections/Numbers";
import { Pretenders } from "./sections/Pretenders";
import { ScamWave } from "./sections/ScamWave";
import { Tactics } from "./sections/Tactics";
import { Why } from "./sections/Why";
import { drawScene } from "./thread-canvas";
import { NIGHT_BANDS, NIGHT_RAMP, TIMELINE } from "./world";

export const PAPER = [232, 228, 222] as const;
export const NIGHT = [14, 15, 16] as const;
const INK = [18, 18, 18] as const;
const CHALK = [236, 233, 226] as const;

const mix = (a: readonly number[], b: readonly number[], t: number) =>
  `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], t))).join(", ")})`;

function nightAt(camZ: number): number {
  let night = 0;
  for (const [from, to] of NIGHT_BANDS) {
    const rise = smoothstep((camZ - (from - NIGHT_RAMP)) / NIGHT_RAMP);
    const fall = 1 - smoothstep((camZ - to) / NIGHT_RAMP);
    night = Math.max(night, Math.min(rise, fall));
  }
  return night;
}

function measure(): Viewport {
  const w = window.innerWidth;
  const h = window.innerHeight;
  // Narrow or portrait screens (phones, tablets upright) stack side-by-side layouts.
  const mobile = w < 900 || w / h < 0.85;
  return { w, h, sx: clamp(w / 1280, 0.3, 1.25), sy: clamp(h / 800, 0.7, 1.2), mobile };
}

function updateNode(node: RegisteredNode, frame: Frame) {
  const { spec, el } = node;
  const { vp } = frame;
  const d = spec.z - frame.camZ;
  const opacity = (spec.fade ?? depthFade)(d);
  const scale = perspectiveScale(d);
  if (el) {
    if (opacity < 0.005) {
      if (node.visible) {
        el.style.visibility = "hidden";
        el.style.setProperty("--pe", "none");
        node.visible = false;
      }
    } else {
      const x =
        (vp.mobile ? resolveOffset(spec.mx, vp, 1) : undefined) ??
        resolveOffset(spec.x, vp, vp.sx) ??
        0;
      const y =
        (vp.mobile ? resolveOffset(spec.my, vp, 1) : undefined) ??
        resolveOffset(spec.y, vp, vp.sy) ??
        0;
      if (!node.visible) {
        el.style.visibility = "visible";
        node.visible = true;
      }
      el.style.transform = `translate3d(${x * scale}px, ${y * scale}px, 0) scale(${scale})`;
      el.style.opacity = opacity.toFixed(3);
      el.style.setProperty("--pe", opacity > 0.6 ? "auto" : "none");
    }
  }
  node.onFrame?.({ ...frame, d, scale, opacity });
}

/**
 * The landing page: a camera flying through a 3D world as you scroll. Sections are HTML
 * nodes at different depths; a canvas on top draws the blue thread and the stars.
 * With reduced motion it renders the same sections as a normal page.
 */
export function Landing() {
  const reduced = useReducedMotion();
  // False during SSR and hydration, so the server HTML and first client render match.
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const isStatic = hydrated && reduced === true;
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef(new Map<string, RegisteredNode>());
  const listenersRef = useRef(new Set<(frame: Frame) => void>());
  const lenisRef = useRef<Lenis | null>(null);

  const engine = useMemo<LandingEngine>(
    () => ({
      isStatic,
      register(id, node) {
        nodesRef.current.set(id, node);
        return () => {
          nodesRef.current.delete(id);
        };
      },
      listen(fn) {
        listenersRef.current.add(fn);
        return () => {
          listenersRef.current.delete(fn);
        };
      },
      scrollToZ(z, opts) {
        const lenis = lenisRef.current;
        if (!lenis) return;
        lenis.scrollTo(TIMELINE.zToU(z) * lenis.limit, {
          immediate: opts?.immediate,
          duration: 2.2,
          force: true,
        });
      },
      lock(locked) {
        const lenis = lenisRef.current;
        if (locked) lenis?.stop();
        else lenis?.start();
      },
    }),
    [isStatic],
  );

  useEffect(() => {
    if (isStatic) return;
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!root || !canvas || !ctx) return;

    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.8, touchMultiplier: 1.4 });
    lenisRef.current = lenis;

    let vp = measure();
    const resize = () => {
      vp = measure();
      root.dataset.layout = vp.mobile ? "stacked" : "wide";
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(vp.w * dpr);
      canvas.height = Math.round(vp.h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const start = performance.now();
    let lastNight = -1;
    let raf = 0;
    const tick = (now: number) => {
      lenis.raf(now);
      const u = lenis.limit > 0 ? clamp(lenis.scroll / lenis.limit) : 0;
      const camZ = TIMELINE.uToZ(u);
      const frame: Frame = { camZ, u, vp, now };

      for (const node of nodesRef.current.values()) updateNode(node, frame);

      const night = nightAt(camZ);
      if (Math.abs(night - lastNight) > 0.002) {
        root.style.setProperty("--land-bg", mix(PAPER, NIGHT, night));
        root.style.setProperty("--land-fg", mix(INK, CHALK, night));
        root.style.setProperty("--land-night", night.toFixed(3));
        lastNight = night;
      }

      drawScene(ctx, {
        camZ,
        vp,
        drawIn: easeOutCubic((now - start - 300) / 1500),
        night,
        now,
      });
      for (const fn of listenersRef.current) fn(frame);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [isStatic]);

  const rootStyle = {
    "--land-bg": mix(PAPER, NIGHT, 0),
    "--land-fg": mix(INK, CHALK, 0),
    "--land-night": "0",
    "--land-thread": "#2f3be0",
    "--land-orange": "#ec7230",
  } as CSSProperties;

  const sections = (
    <>
      <Hero />
      <Why />
      <Numbers />
      <ScamWave />
      <Pretenders />
      <Tactics />
      <Dojos />
      <EnterDojo />
      <Finale />
    </>
  );

  return (
    <EngineProvider value={engine}>
      <div
        ref={rootRef}
        className={cn(
          landingFontVars,
          "group/land relative min-h-dvh bg-[var(--land-bg)] text-[var(--land-fg)] antialiased",
        )}
        style={rootStyle}
      >
        <LandingHeader />
        {isStatic ? (
          <main className="pt-16">{sections}</main>
        ) : (
          <>
            {/* The scroll distance the camera travels; the stage itself stays fixed. */}
            <div aria-hidden style={{ height: `${(TIMELINE.units + 1) * 100}vh` }} />
            <main className="fixed inset-0 overflow-hidden">
              {sections}
              <canvas
                ref={canvasRef}
                aria-hidden
                className="pointer-events-none absolute inset-0 z-10 h-full w-full"
              />
            </main>
            <SectionRail />
          </>
        )}
      </div>
    </EngineProvider>
  );
}
