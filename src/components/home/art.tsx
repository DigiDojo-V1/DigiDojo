/**
 * Shared pieces for the animated dojo illustrations on the home carousel. Each dojo's scene lives
 * in its own folder (`src/dojos/<dojo-id>/art/`) and is listed in `src/dojos/art.ts`.
 */

/** One traced shape: SVG path data and its fill colour. */
export type ArtPath = readonly [d: string, fill: string];

/** What the carousel passes to every dojo scene. */
export interface DojoArtProps {
  /** Stop the loops, e.g. while the slide is off-screen. */
  paused?: boolean;
  className?: string;
}

/** A list of traced shapes, drawn in order. */
export function ArtPaths({ paths }: { paths: readonly ArtPath[] }) {
  return paths.map(([d, fill], i) => <path key={i} d={d} fill={fill} />);
}

/**
 * Film grain laid over a slide that has art, so flat vector shapes get the printed texture of the
 * source illustrations. Tiled SVG noise; use with `mix-blend-mode: multiply`.
 */
export const GRAIN_BACKGROUND =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -1.6 1.15'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
