"use client";

import { useEffect, useId, useRef } from "react";

import { GLASS_DEFAULTS } from "@/lib/glass/displacementMap.ts";

import { getDisplacementMap } from "./displacementCache.ts";

export interface DisplacementFilter {
  /** Ref to attach to the filter's `<feImage>`; its href is driven imperatively. */
  readonly feImageRef: React.RefObject<SVGFEImageElement | null>;
  /** Stable per-instance `<filter>` id to reference from `backdrop-filter`. */
  readonly filterId: string;
  /**
   * `true` once the first map has been painted. This is a **ref**, read during
   * render only to pick the correct `backdrop-filter` on any *incidental*
   * re-render — the first reveal itself is written imperatively (see below), so
   * it never schedules a React re-render of its own.
   */
  readonly paintedRef: React.RefObject<boolean>;
}

/**
 * Builds the composed `backdrop-filter` string for a glass element. When the
 * displacement filter isn't painted (or is skipped for sub-pixel glass, see
 * `Glass`), the element keeps a plain `saturate`/`blur` backdrop — the same
 * backdrop pop at a fraction of the compositor cost of the displacement graph.
 */
export function glassBackdropFilter(
  painted: boolean,
  filterId: string,
  blur: number,
): string {
  const blurPart = blur > 0 ? `blur(${blur}px) ` : "";
  return painted
    ? `url(#${filterId}) ${blurPart}saturate(180%)`
    : `${blurPart}saturate(180%)`;
}

/**
 * Owns the displacement-filter lifecycle for a glass element:
 *
 * - watches the element's size with a `ResizeObserver`,
 * - (re)paints the cached displacement map and writes it straight onto the
 *   `<feImage>` via a ref — so a resize updates the glass with **no** React
 *   re-render,
 * - on the first paint, swaps the `backdrop-filter` from the plain-blur
 *   fallback to the displacement filter by writing it straight onto the
 *   element's style (again, no re-render) and marks `paintedRef` so an
 *   incidental re-render keeps the upgraded filter.
 *
 * The element pixel size is rounded for the cache key, so jitter that nets the
 * same rounded size is a no-op.
 */
export function useDisplacementFilter(
  rootRef: React.RefObject<HTMLDivElement | null>,
  radius: number,
  blur: number,
  enabled: boolean,
): DisplacementFilter {
  const feImageRef = useRef<SVGFEImageElement>(null);
  const baseId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const filterId = `glass-${baseId}`;
  const lastSizeRef = useRef<string>("");
  const paintedRef = useRef(false);

  useEffect(() => {
    // Sub-pixel glass skips the displacement filter entirely (see `Glass`): no
    // map painting, no ResizeObserver, no `<feImage>` writes.
    const element = rootRef.current;
    if (!element || !enabled || typeof ResizeObserver === "undefined") {
      return;
    }

    const params = { ...GLASS_DEFAULTS, radius };

    // Reset the size cache whenever this effect re-runs (i.e. `radius` changed):
    // the map depends on `radius`, so the next repaint must proceed even if the
    // element's pixel size is unchanged.
    lastSizeRef.current = "";

    const repaint = (): void => {
      const { width, height } = element.getBoundingClientRect();
      if (width < 1 || height < 1) {
        return;
      }
      const sizeKey = `${Math.round(width)}x${Math.round(height)}`;
      if (sizeKey === lastSizeRef.current) {
        return;
      }
      lastSizeRef.current = sizeKey;

      const url = getDisplacementMap(width, height, params);
      if (!url) {
        return;
      }

      // Write the new map straight onto the filter's <feImage> — no setState,
      // so a resize updates the glass without a React re-render.
      const feImage = feImageRef.current;
      if (feImage) {
        feImage.setAttribute("href", url);
        feImage.setAttribute("width", String(width));
        feImage.setAttribute("height", String(height));
      }
      // Hotspot radius scales with the element so the gathered light reads as a
      // soft pool rather than a fixed dot on large or small glass alike.
      element.style.setProperty(
        "--glass-light-r",
        `${Math.round(Math.max(width, height) * 0.72)}px`,
      );
      // One-time reveal: swap the plain-blur fallback for the displacement
      // filter now that a map exists. Written straight onto the element's style
      // instead of via setState — like the resize path above, revealing the
      // refraction must not cost a React re-render (this fires once per glass
      // instance on mount; ~30 instances × a re-render each was the bulk of the
      // load-time render churn react-scan reports).
      if (!paintedRef.current) {
        paintedRef.current = true;
        const filter = glassBackdropFilter(true, filterId, blur);
        if (filter) {
          element.style.backdropFilter = filter;
          element.style.setProperty("-webkit-backdrop-filter", filter);
        }
      }
    };

    repaint();

    const observer = new ResizeObserver(repaint);
    observer.observe(element);
    return () => observer.disconnect();
  }, [rootRef, radius, blur, filterId, enabled]);

  return { feImageRef, filterId, paintedRef };
}
