"use client";

import { useEffect, useId, useRef } from "react";

import type { DisplacementFilter } from "./Glass.types.ts";

import { GLASS_DEFAULTS } from "@/lib/glass/displacementMap.ts";

import { getDisplacementMap } from "./displacementCache.ts";

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
 * - keeps the imperative `backdrop-filter` in sync whenever blur, radius, or
 *   size changes (the React `style` prop alone is not enough once the map is
 *   painted).
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

    const syncBackdrop = (): void => {
      const filter = glassBackdropFilter(paintedRef.current, filterId, blur);
      element.style.backdropFilter = filter;
      element.style.setProperty("-webkit-backdrop-filter", filter);
    };

    const repaint = (): void => {
      const { width, height } = element.getBoundingClientRect();
      if (width < 1 || height < 1) {
        syncBackdrop();
        return;
      }

      const sizeKey = `${Math.round(width)}x${Math.round(height)}`;
      if (sizeKey !== lastSizeRef.current) {
        lastSizeRef.current = sizeKey;

        const url = getDisplacementMap(width, height, params);
        if (url) {
          const feImage = feImageRef.current;
          if (feImage) {
            feImage.setAttribute("href", url);
            feImage.setAttribute("width", String(width));
            feImage.setAttribute("height", String(height));
          }
          paintedRef.current = true;
          element.style.setProperty(
            "--glass-light-r",
            `${Math.round(Math.max(width, height) * 0.72)}px`,
          );
        }
      }

      syncBackdrop();
    };

    repaint();

    const observer = new ResizeObserver(repaint);
    observer.observe(element);
    return () => observer.disconnect();
  }, [rootRef, radius, blur, filterId, enabled]);

  return { feImageRef, filterId, paintedRef };
}
