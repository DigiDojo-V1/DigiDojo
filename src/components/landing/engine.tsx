"use client";

import {
  createContext,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

/**
 * The landing page's frame loop talks to its pieces through this context. Nothing here causes
 * React renders per frame: nodes register a DOM element and an optional per-frame callback,
 * and the loop in Landing.tsx writes transforms straight to the DOM.
 */

export interface Viewport {
  w: number;
  h: number;
  /** Horizontal / vertical scale applied to design-size offsets (1 at 1280 × 800). */
  sx: number;
  sy: number;
  /** Narrow or portrait screens stack side-by-side layouts (root gets data-layout="stacked"). */
  mobile: boolean;
}

export interface Frame {
  /** Camera depth. */
  camZ: number;
  /** Scroll progress 0–1. */
  u: number;
  vp: Viewport;
  /** rAF timestamp (ms). */
  now: number;
}

export interface NodeFrame extends Frame {
  /** This node's depth ahead of the camera. */
  d: number;
  scale: number;
  opacity: number;
}

type Offset = number | ((vp: Viewport) => number);

export interface NodeSpec {
  z: number;
  /** Design-size offset from the screen centre (scaled by vp.sx / vp.sy). Functions get raw px. */
  x?: Offset;
  y?: Offset;
  /** Replacements on narrow screens (raw px). */
  mx?: Offset;
  my?: Offset;
  /** Visibility by depth; defaults to depthFade. */
  fade?: (d: number) => number;
}

export interface RegisteredNode {
  spec: NodeSpec;
  el: HTMLElement | null;
  onFrame?: (frame: NodeFrame) => void;
  visible: boolean;
}

export interface LandingEngine {
  /** Reduced motion: nodes flow as a normal page and the loop doesn't run. */
  isStatic: boolean;
  register(id: string, node: RegisteredNode): () => void;
  /** Per-frame listeners that aren't nodes (rail, background, overlays). */
  listen(fn: (frame: Frame) => void): () => void;
  /** Scroll so the camera rests at depth z. */
  scrollToZ(z: number, opts?: { immediate?: boolean }): void;
  /** Pause scrolling while an overlay (menu, sources) is open. */
  lock(locked: boolean): void;
}

const EngineContext = createContext<LandingEngine | null>(null);

export const EngineProvider = EngineContext.Provider;

export function useEngine(): LandingEngine {
  const engine = useContext(EngineContext);
  if (!engine) throw new Error("useEngine must be used inside <Landing>");
  return engine;
}

/** Subscribe to every frame. The callback may change between renders. */
export function useFrame(fn: (frame: Frame) => void) {
  const engine = useEngine();
  const fnRef = useRef(fn);
  useLayoutEffect(() => {
    fnRef.current = fn;
  });
  useLayoutEffect(() => engine.listen((frame) => fnRef.current(frame)), [engine]);
}

export function resolveOffset(
  value: Offset | undefined,
  vp: Viewport,
  scale: number,
): number | undefined {
  if (value === undefined) return undefined;
  return typeof value === "function" ? value(vp) : value * scale;
}

const ALIGN = {
  center: "-translate-x-1/2 -translate-y-1/2",
  "bottom-left": "-translate-y-full",
  "bottom-right": "-translate-x-full -translate-y-full",
  "top-left": "",
} as const;

/**
 * Something placed in the 3D world. Its children are laid out at design size and the loop
 * scales and moves the whole node with the camera.
 */
export function WorldNode({
  spec,
  onFrame,
  align = "center",
  className,
  style,
  staticClassName,
  anchor,
  children,
}: {
  spec: NodeSpec;
  onFrame?: (frame: NodeFrame) => void;
  align?: keyof typeof ALIGN;
  className?: string;
  style?: CSSProperties;
  /** Classes for the reduced-motion page, where nodes flow one after another. */
  staticClassName?: string;
  /** Section id, so the menu can jump here on the reduced-motion page. */
  anchor?: string;
  children: ReactNode;
}) {
  const engine = useEngine();
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const specRef = useRef(spec);
  const onFrameRef = useRef(onFrame);
  useLayoutEffect(() => {
    specRef.current = spec;
    onFrameRef.current = onFrame;
  });

  useLayoutEffect(() => {
    if (engine.isStatic) return;
    const node: RegisteredNode = {
      get spec() {
        return specRef.current;
      },
      el: ref.current,
      onFrame: (frame) => onFrameRef.current?.(frame),
      visible: false,
    };
    return engine.register(id, node);
  }, [engine, id]);

  if (engine.isStatic) {
    return (
      <div
        id={anchor ? `land-${anchor}` : undefined}
        className={cn("relative flex justify-center px-5 py-16", staticClassName)}
        style={style}
      >
        <div className={className}>{children}</div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute top-1/2 left-1/2 h-0 w-0 will-change-transform"
      style={{ opacity: 0, visibility: "hidden" }}
      // Keyboard users tabbing to a link inside a node fly the camera there.
      onFocusCapture={() => engine.scrollToZ(specRef.current.z)}
    >
      <div
        className={cn(
          "[pointer-events:var(--pe,none)] absolute top-0 left-0 w-max",
          ALIGN[align],
          className,
        )}
        style={style}
      >
        {children}
      </div>
    </div>
  );
}
