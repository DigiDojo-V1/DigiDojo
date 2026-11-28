import type { UiKey } from "@/i18n/ui";
import { buildThread, buildTimeline, type Stop, type Vec3 } from "./camera";

/**
 * The landing page as a scene. Depths are in perspective units (see camera.ts); x/y are px at
 * the 1280 × 800 design size, offsets from the screen centre, scaled down on smaller screens.
 */

/** Depth of every section (where the camera rests to show it at full size). */
export const Z = {
  hero: 0,
  why: 3.2,
  numbers: 6.6,
  wave: 10,
  years: [12.2, 14, 15.8, 17.6, 19.4] as const,
  pretenders: 22.4,
  tactics: 25.6,
  dojosTitle: 29,
  dojos: [31, 32.8, 34.6, 36.4] as const,
  app: 39.6,
  finale: 42.6,
} as const;

/** How long (viewport heights of scroll) the camera rests at each stop. */
const STOPS: readonly Stop[] = [
  { z: Z.hero, hold: 0.45 },
  { z: Z.why, hold: 0.8 },
  { z: Z.numbers, hold: 1 },
  { z: Z.wave, hold: 0.9 },
  ...Z.years.map((z) => ({ z, hold: 0.45 })),
  { z: Z.pretenders, hold: 0.9 },
  { z: Z.tactics, hold: 0.8 },
  { z: Z.dojosTitle, hold: 0.4 },
  ...Z.dojos.map((z) => ({ z, hold: 0.45 })),
  { z: Z.app, hold: 1.3 },
  { z: Z.finale, hold: 0.7 },
];

export const TIMELINE = buildTimeline(STOPS);

/** UI string keys of the section names (all plain strings). */
type SectionLabel = Extract<UiKey, `landing.section.${string}`>;

export interface RailSection {
  id: string;
  label: SectionLabel;
  /** Depth where this section starts counting as current on the rail. */
  z: number;
}

/** The right-hand rail and the menu, in order. */
export const SECTIONS: readonly RailSection[] = [
  { id: "home", label: "landing.section.home", z: Z.hero },
  { id: "why", label: "landing.section.why", z: Z.why },
  { id: "numbers", label: "landing.section.numbers", z: Z.numbers },
  { id: "wave", label: "landing.section.wave", z: Z.wave },
  { id: "learn", label: "landing.section.learn", z: Z.tactics },
  { id: "dojos", label: "landing.section.dojos", z: Z.dojosTitle },
  { id: "app", label: "landing.section.app", z: Z.app },
  { id: "help", label: "landing.section.help", z: Z.finale },
];

/** Index of the section the camera is in: the last one whose start it has passed halfway to. */
export function currentSection(camZ: number): number {
  let index = 0;
  for (let i = 1; i < SECTIONS.length; i++) {
    const midway = (SECTIONS[i - 1].z + SECTIONS[i].z) / 2;
    if (camZ >= Math.max(midway, SECTIONS[i].z - 1.4)) index = i;
  }
  return index;
}

/** Where the background turns night, as [start, end] depths with a soft ramp at each side. */
export const NIGHT_BANDS: readonly (readonly [number, number])[] = [
  [5.1, 7.7],
  [24.1, 27.1],
];
export const NIGHT_RAMP = 0.55;

/** The starfield behind "What you'll spot". */
export const STAR_FIELD = { zFrom: 23.6, zTo: 28, count: 420 } as const;

/** The lead dot sits this far ahead of the camera; the thread is drawn up to it. */
export const THREAD_HEAD = 1.05;

const p = (z: number, x: number, y: number): Vec3 => ({ x, y, z });

/** Control points of the blue thread, in depth order. */
export const THREAD = buildThread([
  p(-1.4, 1300, 140),
  p(-0.7, 800, 60),
  // Hero: passes under the end of the name, loops out to the left and climbs away.
  p(0, 520, 34),
  p(0.35, -120, 96),
  p(0.75, -520, 92),
  p(1.1, -470, 30),
  p(1.5, -150, -70),
  p(2, 250, -170),
  // Why: arcs over the phone and heading, hooks down on the right.
  p(2.6, -260, -230),
  p(3.1, -40, -268),
  p(3.5, 360, -250),
  p(3.9, 560, -130),
  p(4.3, 380, 40),
  p(4.9, 0, 80),
  // By the numbers: a wide loop sweeping under the figures.
  p(5.6, 520, -60),
  p(6.2, 720, 150),
  p(6.7, 160, 280),
  p(7.1, -520, 250),
  p(7.5, -600, 110),
  p(8, -320, 40),
  // The scam wave: rises from bottom-left to a point under the title…
  p(8.8, -680, 420),
  p(9.4, -420, 330),
  p(10, -40, 210),
  p(10.4, 60, 110),
  p(10.8, 0, 72),
  // …then drops straight down the timeline.
  p(11.6, -10, 74),
  p(13.4, 6, 72),
  p(15.2, -8, 74),
  p(17, 8, 72),
  p(18.8, -4, 74),
  p(20.2, 0, 72),
  // Who they pretend to be: sweeps up to the top right.
  p(20.9, -420, 330),
  p(21.6, -260, 240),
  p(22.3, 240, -40),
  p(22.8, 470, -190),
  p(23.2, 400, -210),
  // What you'll spot: a long diagonal across the night sky.
  p(24, 820, -260),
  p(24.8, 900, -210),
  p(25.6, 640, -120),
  p(26.3, -120, 70),
  p(26.9, -560, 160),
  p(27.4, -300, 110),
  // The dojos: loops swinging between the cards.
  p(28.2, 420, -320),
  p(29, 560, -60),
  p(29.6, 120, 260),
  p(30.4, -520, 240),
  p(31.2, -420, -200),
  p(32, 360, -380),
  p(32.6, 520, 120),
  p(33.4, -120, 340),
  p(34.2, -560, -80),
  p(35, -60, -360),
  p(35.8, 560, -120),
  p(36.6, 300, 260),
  p(37.4, -380, 200),
  // DigiDojo: a straight run into the orange disc.
  p(38.2, -820, 300),
  p(38.9, -380, 140),
  p(39.6, -60, 20),
  p(40.2, 260, -70),
  p(40.8, 520, -140),
  // Finale: in from the right to a point beside the title.
  p(41.6, 980, -260),
  p(42.3, 640, -150),
  p(42.9, 300, -70),
  p(43.8, 260, -60),
]);
