/**
 * The once-ever grand entrance into the app home (`/digidojo`). The landing page's CTAs start it
 * (an orange circle grows from the button, see `EntranceLink`); the home page finishes it (giant
 * wordmark, flies into the header, the card builds in, see `Entrance`).
 *
 * Two storage flags: `ENTERED_KEY` (localStorage) means it has played in this browser, so it never
 * plays again; `HANDOFF_KEY` (sessionStorage) means the landing already covered the screen orange,
 * so the home page starts covered instead of growing its own circle.
 */

const ENTERED_KEY = "digidojo-entered";
const HANDOFF_KEY = "digidojo-entrance-handoff";

/** The landing's orange, shared by the handoff circle and the home page's cover. */
export const ENTRANCE_ORANGE = "#ec7230";

/** Set on `<html>` while the entrance is covering the page, so the parts it reveals start hidden. */
export const PENDING_ATTR = "data-entrance";

/** How the home page should open: no entrance, already covered by the landing, or grow a cover. */
export type EntrancePlan = "none" | "covered" | "grow";

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function hasEntered(): boolean {
  try {
    return localStorage.getItem(ENTERED_KEY) !== null;
  } catch {
    // Storage blocked: we can't remember it played, so don't play it at all.
    return true;
  }
}

/** Whether a click on a landing CTA should start the entrance. */
export function shouldStartEntrance(): boolean {
  return !prefersReducedMotion() && !hasEntered();
}

/** The landing covered the screen; tell the home page to start covered. */
export function markHandoff(): void {
  try {
    sessionStorage.setItem(HANDOFF_KEY, "1");
  } catch {
    // The home page will grow its own cover instead.
  }
}

/** What the home page should do. Stable until `finishEntrance()`, so it's safe as a snapshot. */
export function readEntrancePlan(): EntrancePlan {
  if (prefersReducedMotion() || hasEntered()) return "none";
  try {
    return sessionStorage.getItem(HANDOFF_KEY) === "1" ? "covered" : "grow";
  } catch {
    return "grow";
  }
}

/** The entrance played (or was skipped): never again in this browser. */
export function finishEntrance(): void {
  try {
    localStorage.setItem(ENTERED_KEY, "1");
    sessionStorage.removeItem(HANDOFF_KEY);
  } catch {
    // Nothing to remember it in; `hasEntered()` already treats that as played.
  }
}
