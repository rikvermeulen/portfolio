/** Minimal shape of a Spotify image object (the API returns more fields). */
interface SpotifyImageLike {
  readonly url: string;
}

/**
 * Spotify returns images largest-first. Index 1 is the ~300px variant we
 * prefer for tiles; fall back to the largest, then to `null`.
 */
export function pickSpotifyImage(
  images: readonly SpotifyImageLike[],
): string | null {
  return images[1]?.url ?? images[0]?.url ?? null;
}
