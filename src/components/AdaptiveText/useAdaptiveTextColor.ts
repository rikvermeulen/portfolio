import { useLayoutEffect } from "react";

import {
  backdropLuminance,
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

/**
 * Drives an element's text color from the luminance of the solid backdrop
 * behind it, choosing one uniform, accessible color (not a per-pixel gradient).
 *
 * Written straight to `element.style.color` — never React state — so it costs
 * no render (this codebase updates visual state imperatively to avoid
 * whole-tree re-renders).
 *
 * A ~8/sec **poll** re-samples the backdrop. The toast stack reflows through
 * react-aria's View Transitions (a toast slides over a new part of the backdrop
 * as others are added/removed); scroll / Resize- / MutationObserver all fired
 * unreliably against that, so a cheap poll (memoized, early-exit sampling) for
 * the toast's short life is what reliably catches the change.
 *
 * The new color is applied **instantly** on change — no cross-fade. A gradual
 * fade made the text visibly drift between colors a beat after the toast
 * appeared; swapping in one step keeps the decision invisible.
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

    let lastColor = "";
    const apply = () => {
      const color = pickContrastColor(backdropLuminance(el, ignore), {
        light,
        dark,
      });
      if (color === lastColor) {
        return; // decision unchanged — nothing to repaint
      }
      lastColor = color;
      el.style.color = color;
    };

    let timer = 0;
    const tick = () => {
      apply();
      timer = window.setTimeout(tick, SAMPLE_INTERVAL);
    };
    apply(); // synchronous first paint — no wrong-color flash
    timer = window.setTimeout(tick, SAMPLE_INTERVAL);

    return () => {
      clearTimeout(timer);
    };
  }, [ref, light, dark]);
};
