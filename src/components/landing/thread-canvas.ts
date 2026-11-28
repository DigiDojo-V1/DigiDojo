import { clamp, lerp, NEAR_LIMIT, perspectiveScale, smoothstep } from "./camera";
import type { Viewport } from "./engine";
import { STAR_FIELD, THREAD, THREAD_HEAD } from "./world";

/** Draws the blue thread, its lead dot and the starfield onto the overlay canvas. */

const THREAD_RGB = "47, 59, 224";
const THREAD_RGB_NIGHT = "104, 114, 255";

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  twinkle: number;
}

/** Deterministic pseudo-random numbers, so the sky is the same on every visit. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STARS: Star[] = (() => {
  const rand = mulberry32(1930);
  return Array.from({ length: STAR_FIELD.count }, () => ({
    x: (rand() - 0.5) * 3400,
    y: (rand() - 0.5) * 2000,
    z: lerp(STAR_FIELD.zFrom, STAR_FIELD.zTo, rand()),
    size: 0.6 + rand() * 1.4,
    twinkle: rand() * Math.PI * 2,
  }));
})();

export interface ThreadDrawState {
  camZ: number;
  vp: Viewport;
  /** 0 → 1 while the thread draws itself in on first load. */
  drawIn: number;
  /** 0 = paper, 1 = night. */
  night: number;
  now: number;
}

export function drawScene(ctx: CanvasRenderingContext2D, state: ThreadDrawState) {
  const { camZ, vp, night, now } = state;
  ctx.clearRect(0, 0, vp.w, vp.h);
  if (night > 0.01) drawStars(ctx, state);

  const zNear = camZ + NEAR_LIMIT + 0.02;
  const zHead = camZ + THREAD_HEAD;
  const zEnd = lerp(zNear, zHead, state.drawIn);
  const points = THREAD.points;
  let i = Math.max(1, THREAD.indexAtZ(zNear));
  const rgb = night > 0.5 ? THREAD_RGB_NIGHT : THREAD_RGB;

  ctx.lineCap = "round";
  let prev = projectPoint(points[i - 1], camZ, vp);
  for (; i < points.length && points[i].z <= zEnd; i++) {
    const next = projectPoint(points[i], camZ, vp);
    const d = points[i].z - camZ;
    // Darker and thicker close up, fading into the distance (the video's fog).
    const alpha = d <= 0 ? 0.95 : lerp(0.95, 0.2, smoothstep(d / THREAD_HEAD));
    const width = clamp(1.25 * next.scale, 0.9, 5);
    ctx.strokeStyle = `rgba(${rgb}, ${alpha})`;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(next.x, next.y);
    ctx.stroke();
    prev = next;
  }

  // The lead dot at the head of the thread, with a faint halo that breathes.
  if (state.drawIn >= 1) {
    const head = THREAD.pointAtZ(zHead);
    const p = projectPoint(head, camZ, vp);
    const pulse = 0.5 + 0.5 * Math.sin(now / 650);
    ctx.fillStyle = `rgba(${rgb}, ${0.12 + 0.1 * pulse})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 7 + 2 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(${rgb}, 0.95)`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function projectPoint(p: { x: number; y: number; z: number }, camZ: number, vp: Viewport) {
  const scale = perspectiveScale(p.z - camZ);
  return { x: vp.w / 2 + p.x * vp.sx * scale, y: vp.h / 2 + p.y * vp.sy * scale, scale };
}

function drawStars(ctx: CanvasRenderingContext2D, { camZ, vp, night, now }: ThreadDrawState) {
  for (const star of STARS) {
    const d = star.z - camZ;
    if (d < -0.85 || d > 3) continue;
    const scale = perspectiveScale(d);
    const x = vp.w / 2 + star.x * scale;
    const y = vp.h / 2 + star.y * scale;
    if (x < -10 || x > vp.w + 10 || y < -10 || y > vp.h + 10) continue;
    const fadeIn = smoothstep((3 - d) / 1.6);
    const fadeOut = smoothstep((d + 0.85) / 0.4);
    const twinkle = 0.75 + 0.25 * Math.sin(now / 900 + star.twinkle);
    const alpha = night * fadeIn * fadeOut * twinkle * 0.85;
    ctx.fillStyle = `rgba(236, 233, 226, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, Math.min(star.size * scale, 3.2), 0, Math.PI * 2);
    ctx.fill();
  }
}
