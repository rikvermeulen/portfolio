import type { GlassParams } from "@/lib/glass/displacementMap.ts";

import { paintDisplacementMap } from "@/lib/glass/displacementMap.ts";

/**
 * Shared cache of displacement-map data URLs.
 *
 * A displacement map depends only on the rendered size and corner radius (every
 * other parameter is a constant), so identical-size glass — every icon tile,
 * every tag — would otherwise regenerate the exact same map per instance. We
 * key the result by `size + radius` and paint from a single shared canvas:
 * same pixels, far less per-pixel canvas work, and the browser can share the
 * decoded texture across instances that reference the same data URL.
 *
 * The cache is bounded with simple LRU eviction so resize transitions (which
 * stream many transient sizes) can't grow it without limit.
 */
const MAP_CACHE = new Map<string, string>();
const MAP_CACHE_MAX = 48;
let sharedCanvas: HTMLCanvasElement | null = null;

/**
 * Returns the displacement-map data URL for the given size/params, painting and
 * caching it on first request and reusing it thereafter. Browser-only.
 */
export function getDisplacementMap(
  width: number,
  height: number,
  params: GlassParams,
): string | null {
  const key = `${Math.round(width)}x${Math.round(height)}|${params.radius}`;

  const cached = MAP_CACHE.get(key);
  if (cached !== undefined) {
    // Re-insert to mark as most-recently-used.
    MAP_CACHE.delete(key);
    MAP_CACHE.set(key, cached);
    return cached;
  }

  if (!sharedCanvas) {
    sharedCanvas = document.createElement("canvas");
  }
  const url = paintDisplacementMap(sharedCanvas, width, height, params);
  if (url) {
    if (MAP_CACHE.size >= MAP_CACHE_MAX) {
      const oldest = MAP_CACHE.keys().next().value;
      if (oldest !== undefined) {
        MAP_CACHE.delete(oldest);
      }
    }
    MAP_CACHE.set(key, url);
  }
  return url;
}
