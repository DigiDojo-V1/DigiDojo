/**
 * The grand entrance into the app home (`/digidojo`), played whenever a landing CTA takes the
 * player there. The landing starts it (an orange circle grows from the button, see
 * `EntranceLink`); the home page finishes it (giant wordmark that flies into the header, then the
 * card builds in, see `Entrance`).
 *
 * The handoff is a module-level flag: client navigation keeps it, so the home page knows it was
 * reached from a CTA. A reload or a direct visit starts with it unset, so those get no entrance.
 */

/** The landing's orange, shared by the handoff circle and the home page's cover. */
export const ENTRANCE_ORANGE = "#ec7230";

let handoff = false;

/** Whether a click on a landing CTA should start the entrance. */
export function shouldStartEntrance(): boolean {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** The landing covered the screen orange; the home page should pick it up. */
export function markHandoff(): void {
  handoff = true;
}

/** Whether the home page should play the entrance. Stable until `finishEntrance()`. */
export function isEntrancePending(): boolean {
  return handoff;
}

/** The entrance played (or was skipped). */
export function finishEntrance(): void {
  handoff = false;
}
