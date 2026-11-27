import { useCallback, useSyncExternalStore } from "react";

/** Tailwind's `lg` breakpoint: from here on, fake apps use their desktop layout. */
export const DESKTOP_QUERY = "(min-width: 1024px)";

function subscribeTo(query: string, onChange: () => void) {
  const list = window.matchMedia(query);
  list.addEventListener("change", onChange);
  return () => list.removeEventListener("change", onChange);
}

/**
 * Whether a media query matches. The server (and the first client render) always says `false`,
 * so the page hydrates as mobile and switches to the wide layout straight after.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback((onChange: () => void) => subscribeTo(query, onChange), [query]);
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** True on desktop-width screens (Tailwind `lg`). Use CSS (`lg:`) instead when only styling changes. */
export function useIsDesktop(): boolean {
  return useMediaQuery(DESKTOP_QUERY);
}
