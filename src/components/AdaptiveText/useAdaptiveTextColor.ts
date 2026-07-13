import { useLayoutEffect } from "react";

import {
  backdropLuminance,
  parseRgb,
  pickContrastColor,
} from "@/utils/backdropContrast/index.ts";

export interface AdaptiveColors {
  /** Foreground used over dark backdrops. */
  light?: string;
  /** Foreground used over light backdrops. */
  dark?: string;
}

/** Minimum ms between backdrop samples — the backdrop changes far slower than
 *  60fps, so ~8/sec keeps the poll cheap. */
const SAMPLE_INTERVAL = 120;

/** Duration of the color cross-fade. */
const FADE_MS = 240;

/** Ease-out cubic — quick to move, gentle to settle. */
const ease = (t: number): number => 1 - (1 - t) ** 3;

const rgbStr = (r: number, g: number, b: number): string =>
  `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;

/**
 * Drives an element's text color from the luminance of the solid backdrop
 * behind it, choosing one uniform, accessible color (not a per-pixel gradient)
 * and cross-fading to it.
 *
 * Written straight to `element.style.color` — never React state — so it costs
 * no render (this codebase updates visual state imperatively to avoid
 * whole-tree re-renders). Two independent loops:
 *
 * - A ~8/sec **poll** re-samples the backdrop. The toast stack reflows through
 *   react-aria's View Transitions (a toast slides over a new part of the
 *   backdrop as others are added/removed); scroll / Resize- / MutationObserver
 *   all fired unreliably against that, so a cheap poll (memoized, early-exit
 *   sampling) for the toast's short life is what reliably catches the change.
 * - A `requestAnimationFrame` **fade** paced by real elapsed time animates
 *   between colors. It is not a CSS `color` transition: that runs on the main
 *   thread and, on this busy dashboard, stalls mid-fade into a muddy gray. A
 *   time-based fade always reaches its target — dropped frames only coarsen it.
 */
export const useAdaptiveTextColor = (
  ref: React.RefObject<HTMLElement | null>,
  colors: AdaptiveColors = {},
): void => {
  const { light, dark } = colors;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    // The overlay to exclude (the ToastRegion) never changes — resolve once by
    // walking to the nearest fixed-positioned ancestor.
    let ignore: Element | null = el.parentElement;
    while (ignore && getComputedStyle(ignore).position !== "fixed") {
      ignore = ignore.parentElement;
    }

    // --- rAF cross-fade -----------------------------------------------------
    let fadeId = 0;
    let fadeStart = 0;
    let from = { r: 0, g: 0, b: 0 };
    let to = from;
    const fade = () => {
      const e = ease(Math.min(1, (performance.now() - fadeStart) / FADE_MS));
      const r = from.r + (to.r - from.r) * e;
      const g = from.g + (to.g - from.g) * e;
      const b = from.b + (to.b - from.b) * e;
      el.style.color = rgbStr(r, g, b);
      fadeId = e < 1 ? requestAnimationFrame(fade) : 0;
    };

    let lastColor = "";
    let firstRun = true;
    const apply = () => {
      const color = pickContrastColor(backdropLuminance(el, ignore), {
        light,
        dark,
      });
      if (color === lastColor) {
        return; // decision unchanged — leave any in-flight fade to finish
      }
      lastColor = color;
      const target = parseRgb(color) ?? { r: 0, g: 0, b: 0 };

      if (firstRun) {
        firstRun = false;
        el.style.color = rgbStr(target.r, target.g, target.b); // instant first paint
        return;
      }
      from = parseRgb(getComputedStyle(el).color) ?? target;
      to = target;
      fadeStart = performance.now();
      if (!fadeId) {
        fadeId = requestAnimationFrame(fade);
      }
    };

    // --- poll ---------------------------------------------------------------
    let timer = 0;
    const tick = () => {
      apply();
      timer = window.setTimeout(tick, SAMPLE_INTERVAL);
    };
    apply(); // synchronous first paint — no wrong-color flash
    timer = window.setTimeout(tick, SAMPLE_INTERVAL);

    return () => {
      clearTimeout(timer);
      if (fadeId) {
        cancelAnimationFrame(fadeId);
      }
    };
  }, [ref, light, dark]);
};
