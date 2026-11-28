import { describe, expect, it } from "vitest";
import {
  buildThread,
  buildTimeline,
  depthFade,
  formatIndian,
  monotoneCubic,
  perspectiveScale,
  project,
} from "@/components/landing/camera";
import { currentSection, SECTIONS, THREAD, TIMELINE, Z } from "@/components/landing/world";

describe("perspective", () => {
  it("matches CSS perspective: scale = P / (P + depth)", () => {
    const P = 1200;
    for (const depthPx of [-600, -300, 0, 600, 2400, 6000]) {
      expect(perspectiveScale(depthPx / P)).toBeCloseTo(P / (P + depthPx), 10);
    }
  });

  it("projects towards the vanishing point as things get further away", () => {
    const viewport = { w: 1280, h: 800 };
    const near = project({ x: 400, y: 200 }, 0, viewport);
    const far = project({ x: 400, y: 200 }, 2, viewport);
    expect(near).toMatchObject({ x: 1040, y: 600, scale: 1 });
    expect(far.x).toBeCloseTo(640 + 400 / 3);
    expect(far.y).toBeCloseTo(400 + 200 / 3);
  });

  it("never projects points behind the eye", () => {
    expect(Number.isFinite(perspectiveScale(-1))).toBe(true);
    expect(perspectiveScale(-5)).toBe(perspectiveScale(-0.9));
  });
});

describe("depthFade", () => {
  it("is invisible far away and long past, fully visible at the stop", () => {
    expect(depthFade(3)).toBe(0);
    expect(depthFade(0)).toBe(1);
    expect(depthFade(-0.6)).toBe(0);
  });

  it("rises as a node approaches and falls as it passes", () => {
    const approach = [2.2, 1.6, 1, 0.5].map((d) => depthFade(d));
    const passing = [-0.15, -0.25, -0.35, -0.45].map((d) => depthFade(d));
    expect(approach).toEqual([...approach].sort((a, b) => a - b));
    expect(passing).toEqual([...passing].sort((a, b) => b - a));
  });
});

describe("monotoneCubic", () => {
  it("passes through its points and never overshoots", () => {
    const f = monotoneCubic([0, 1, 2, 3], [0, 0.1, 5, 5.2]);
    expect(f(1)).toBeCloseTo(0.1);
    expect(f(2)).toBeCloseTo(5);
    let previous = -Infinity;
    for (let x = 0; x <= 3; x += 0.01) {
      const y = f(x);
      expect(y).toBeGreaterThanOrEqual(previous - 1e-9);
      expect(y).toBeLessThanOrEqual(5.2 + 1e-9);
      previous = y;
    }
  });
});

describe("timeline", () => {
  const timeline = buildTimeline([
    { z: 0, hold: 0.5 },
    { z: 3, hold: 1 },
    { z: 6, hold: 0.5 },
  ]);

  it("starts at the first stop and ends at the last", () => {
    expect(timeline.uToZ(0)).toBe(0);
    expect(timeline.uToZ(1)).toBe(6);
  });

  it("is monotonic", () => {
    let previous = -Infinity;
    for (let u = 0; u <= 1; u += 0.001) {
      const z = timeline.uToZ(u);
      expect(z).toBeGreaterThanOrEqual(previous - 1e-9);
      previous = z;
    }
  });

  it("slows down at stops: the camera barely moves while resting", () => {
    const uStop = timeline.zToU(3);
    const resting = timeline.uToZ(uStop + 0.02) - timeline.uToZ(uStop - 0.02);
    const travelling = timeline.uToZ(0.32) - timeline.uToZ(0.28);
    expect(resting).toBeLessThan(travelling / 2);
  });

  it("inverts with zToU", () => {
    for (const z of [0.5, 2.9, 3, 4.4, 5.9]) {
      expect(timeline.uToZ(timeline.zToU(z))).toBeCloseTo(z, 4);
    }
  });

  it("the landing timeline reaches every section", () => {
    for (const section of SECTIONS) {
      const u = TIMELINE.zToU(section.z);
      expect(TIMELINE.uToZ(u)).toBeCloseTo(section.z, 3);
    }
    expect(TIMELINE.uToZ(1)).toBe(Z.finale);
  });
});

describe("thread", () => {
  it("is continuous: no big jumps between samples", () => {
    for (let i = 1; i < THREAD.points.length; i++) {
      const a = THREAD.points[i - 1];
      const b = THREAD.points[i];
      expect(Math.hypot(b.x - a.x, b.y - a.y)).toBeLessThan(120);
      expect(b.z).toBeGreaterThanOrEqual(a.z);
    }
  });

  it("passes through its control points", () => {
    const thread = buildThread([
      { x: 0, y: 0, z: 0 },
      { x: 100, y: 50, z: 1 },
      { x: 0, y: 100, z: 2 },
    ]);
    const mid = thread.pointAtZ(1);
    expect(mid.x).toBeCloseTo(100, 0);
    expect(mid.y).toBeCloseTo(50, 0);
  });
});

describe("rail", () => {
  it("names each section once the camera reaches it", () => {
    SECTIONS.forEach((section, i) => {
      expect(currentSection(section.z)).toBe(i);
    });
    expect(currentSection(-1)).toBe(0);
  });
});

describe("formatIndian", () => {
  it("uses Indian digit grouping", () => {
    expect(formatIndian(22495)).toBe("22,495");
    expect(formatIndian(2402579)).toBe("24,02,579");
    expect(formatIndian(6582.4)).toBe("6,582");
  });
});
