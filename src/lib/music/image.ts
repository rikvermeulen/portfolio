/** Minimal shape of a Spotify image object (the API returns more fields). */
interface SpotifyImageLike {
  readonly url: string;
  /** Missing/null for some covers (e.g. a custom playlist image). */
  readonly width?: number | null;
}

/**
 * The largest image: `next/image` scales it down to the rendered size, so a
 * smaller source only ever costs sharpness on high-DPI screens. Picks by width
 * because the Web Playback SDK doesn't order album images like the Web API
 * (largest-first); without widths, the first (API order) wins.
 */
export function pickSpotifyImage(
  images: readonly SpotifyImageLike[],
): string | null {
  const [largest] = [...images].sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
  return largest?.url ?? null;
}
