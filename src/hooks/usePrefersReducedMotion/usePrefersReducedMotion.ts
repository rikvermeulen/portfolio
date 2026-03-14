"use client";

import { useSyncExternalStore } from "react";

/**
 * Server snapshot for useSyncExternalStore. Returns false so SSR/hydration
 * never assumes reduced motion until the client runs.
 * @internal Exported for testing.
 */
export function getServerSnapshot(): boolean {
  return false;
}

function subscribe(callback: () => void): () => void {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

/**
 * Custom hook to detect whether the user prefers reduced motion based on the
 * `(prefers-reduced-motion: reduce)` media query.
 *
 * This hook listens to the user's system settings and dynamically updates
 * if the preference changes.
 *
 * @returns {boolean} `true` if the user prefers reduced motion, `false` otherwise.
 *
 * @example
 * const prefersReducedMotion = usePrefersReducedMotion();
 * console.log(prefersReducedMotion ? "Reduced motion preferred" : "Default motion settings");
 */
export const usePrefersReducedMotion = (): boolean => {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    getServerSnapshot,
  );
};
