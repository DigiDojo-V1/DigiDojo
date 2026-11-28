/**
 * The landing page's 3D camera, as pure math (no DOM), so it can be unit tested.
 *
 * Space: x right, y down (CSS), z = depth away from the viewer. Depth is measured in units of
 * the perspective distance P, so an object `d` units ahead of the camera is drawn at
 * `scale = 1 / (1 + d)`: full size at d = 0, a third at d = 2, and it swells as it passes
 * (d → −1 is the eye). That is exactly CSS `perspective: P` with `translateZ(-d·P)`.
 */

export type Vec3 = { x: number; y: number; z: number };

export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (t: number) => {
  const c = clamp(t);
  return c * c * (3 - 2 * c);
};
export const easeOutCubic = (t: number) => 1 - (1 - clamp(t)) ** 3;
export const easeInOutCubic = (t: number) => {
  const c = clamp(t);
  return c < 0.5 ? 4 * c * c * c : 1 - (-2 * c + 2) ** 3 / 2;
};

/** Nearest the eye we ever project; closer than this a point is behind the viewer. */
export const NEAR_LIMIT = -0.9;

/** Perspective scale of something `d` depth units ahead of the camera. */
export function perspectiveScale(d: number): number {
  return 1 / (1 + Math.max(d, NEAR_LIMIT));
}

/** Screen position (px) of a world point, for a camera on the z axis looking down +z. */
export function project(
  p: { x: number; y: number },
  d: number,
  viewport: { w: number; h: number },
): { x: number; y: number; scale: number } {
  const scale = perspectiveScale(d);
  return { x: viewport.w / 2 + p.x * scale, y: viewport.h / 2 + p.y * scale, scale };
}

/**
 * How visible a node is at depth `d`: invisible far away, easing in as it approaches,
 * fully visible around its stop, then fading out as it swells past the camera.
 */
export function depthFade(
  d: number,
  { far = 2.4, inEnd = 0.45, outStart = -0.12, outEnd = -0.5 } = {},
): number {
  if (d >= far || d <= outEnd) return 0;
  if (d > inEnd) return smoothstep((far - d) / (far - inEnd)) ** 1.6;
  if (d >= outStart) return 1;
  return smoothstep((d - outEnd) / (outStart - outEnd));
}

// ---------------------------------------------------------------------------------------------
// The thread: a centripetal Catmull-Rom spline through control points, sampled densely once.

export interface Thread {
  /** Samples in curve order (z is non-decreasing for well-formed control points). */
  readonly points: readonly Vec3[];
  /** Index of the first sample with z ≥ the given depth. */
  indexAtZ(z: number): number;
  /** The thread's x/y at depth z (linear between samples). */
  pointAtZ(z: number): Vec3;
}

function catmullRomSegment(p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, steps: number): Vec3[] {
  // Centripetal parameterisation (alpha = 0.5) avoids cusps and self-intersections.
  const knot = (a: Vec3, b: Vec3, t: number) =>
    t + Math.max(Math.hypot(b.x - a.x, b.y - a.y, (b.z - a.z) * 600) ** 0.5, 1e-4);
  const t0 = 0;
  const t1 = knot(p0, p1, t0);
  const t2 = knot(p1, p2, t1);
  const t3 = knot(p2, p3, t2);
  const out: Vec3[] = [];
  const mix = (a: Vec3, b: Vec3, ta: number, tb: number, t: number): Vec3 => {
    const wa = (tb - t) / (tb - ta);
    const wb = (t - ta) / (tb - ta);
    return { x: a.x * wa + b.x * wb, y: a.y * wa + b.y * wb, z: a.z * wa + b.z * wb };
  };
  for (let i = 0; i < steps; i++) {
    const t = t1 + ((t2 - t1) * i) / steps;
    const a1 = mix(p0, p1, t0, t1, t);
    const a2 = mix(p1, p2, t1, t2, t);
    const a3 = mix(p2, p3, t2, t3, t);
    const b1 = mix(a1, a2, t0, t2, t);
    const b2 = mix(a2, a3, t1, t3, t);
    out.push(mix(b1, b2, t1, t2, t));
  }
  return out;
}

export function buildThread(control: readonly Vec3[], stepsPerSegment = 48): Thread {
  if (control.length < 2) throw new Error("A thread needs at least two control points");
  const first = control[0];
  const last = control[control.length - 1];
  const padded = [
    { x: first.x, y: first.y, z: first.z - 0.5 },
    ...control,
    { x: last.x, y: last.y, z: last.z + 0.5 },
  ];
  const points: Vec3[] = [];
  for (let i = 1; i < padded.length - 2; i++) {
    points.push(
      ...catmullRomSegment(padded[i - 1], padded[i], padded[i + 1], padded[i + 2], stepsPerSegment),
    );
  }
  points.push({ ...last });
  // Guard against tiny z overshoots so lookups by depth stay valid.
  for (let i = 1; i < points.length; i++) {
    if (points[i].z < points[i - 1].z) points[i] = { ...points[i], z: points[i - 1].z };
  }

  const indexAtZ = (z: number) => {
    let lo = 0;
    let hi = points.length - 1;
    if (z <= points[0].z) return 0;
    if (z > points[hi].z) return hi;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (points[mid].z < z) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };
  const pointAtZ = (z: number): Vec3 => {
    const i = indexAtZ(z);
    if (i === 0) return { ...points[0], z };
    const a = points[i - 1];
    const b = points[i];
    const t = b.z === a.z ? 0 : clamp((z - a.z) / (b.z - a.z));
    return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), z };
  };
  return { points, indexAtZ, pointAtZ };
}

// ---------------------------------------------------------------------------------------------
// The scroll timeline: scroll progress u ∈ [0, 1] → camera depth, slowing down at each stop.

export interface Stop {
  /** Camera depth where the section sits at full size. */
  z: number;
  /** Scroll length spent resting here, in viewport heights. */
  hold: number;
}

export interface Timeline {
  /** Total scroll length in viewport heights. */
  readonly units: number;
  /** Camera depth for scroll progress u. */
  uToZ(u: number): number;
  /** Scroll progress that brings the camera to depth z (inverse of uToZ). */
  zToU(z: number): number;
}

/** Monotone cubic (Fritsch–Carlson) interpolation through increasing x and non-decreasing y. */
export function monotoneCubic(xs: readonly number[], ys: readonly number[]): (x: number) => number {
  const n = xs.length;
  if (n !== ys.length || n < 2)
    throw new Error("monotoneCubic needs matching arrays of length ≥ 2");
  const dx: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(xs[i + 1] - xs[i]);
    slope.push((ys[i + 1] - ys[i]) / dx[i]);
  }
  const m: number[] = [slope[0]];
  for (let i = 1; i < n - 1; i++) {
    m.push(slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2);
  }
  m.push(slope[n - 2]);
  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / slope[i];
    const b = m[i + 1] / slope[i];
    const h = a * a + b * b;
    if (h > 9) {
      const t = 3 / Math.sqrt(h);
      m[i] = t * a * slope[i];
      m[i + 1] = t * b * slope[i];
    }
  }
  return (x: number) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (i < n - 2 && x > xs[i + 1]) i++;
    const h = dx[i];
    const t = (x - xs[i]) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      (2 * t3 - 3 * t2 + 1) * ys[i] +
      (t3 - 2 * t2 + t) * h * m[i] +
      (-2 * t3 + 3 * t2) * ys[i + 1] +
      (t3 - t2) * h * m[i + 1]
    );
  };
}

/**
 * Builds the scroll → depth map. Each stop gets `hold` viewport heights during which the camera
 * only drifts by `drift`, and travel between stops costs `travelPerUnit` viewport heights per
 * depth unit. A monotone cubic through those keyframes eases in and out of every stop.
 */
export function buildTimeline(
  stops: readonly Stop[],
  { travelPerUnit = 0.32, drift = 0.06 } = {},
): Timeline {
  if (stops.length < 2) throw new Error("A timeline needs at least two stops");
  const us: number[] = [];
  const zs: number[] = [];
  let u = 0;
  stops.forEach((stop, i) => {
    const isFirst = i === 0;
    const isLast = i === stops.length - 1;
    if (!isFirst) u += (stop.z - drift - (zs[zs.length - 1] ?? 0)) * travelPerUnit;
    const zIn = isFirst ? stop.z : stop.z - drift;
    const zOut = isLast ? stop.z : stop.z + drift;
    us.push(u);
    zs.push(zIn);
    u += stop.hold;
    us.push(u);
    zs.push(zOut);
  });
  const units = u;
  const norm = us.map((v) => v / units);
  const uToZ = monotoneCubic(norm, zs);
  const zToU = (z: number) => {
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (uToZ(mid) < z) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  };
  return { units, uToZ, zToU };
}

// ---------------------------------------------------------------------------------------------
// Number formatting for the count-ups (Indian digit grouping).

export function formatIndian(n: number): string {
  return Math.round(n).toLocaleString("en-IN");
}
