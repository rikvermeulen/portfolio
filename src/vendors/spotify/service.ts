import type { SpotifyMusicData } from "@/lib/music/types.ts";
import type { Result } from "@/types/index.ts";

import { deduplicateByTrackId, toPlaylistTrack } from "@/lib/music/mappers.ts";
import { env } from "@env";

import { fetchRecentlyPlayed } from "./client.ts";

export async function getSpotifyMusicResult(): Promise<
  Result<SpotifyMusicData>
> {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } =
    env;

  if (!SPOTIFY_REFRESH_TOKEN) {
    return { ok: false, errorMessage: "Spotify is not configured" };
  }

  try {
    const recentlyPlayed = await fetchRecentlyPlayed(
      SPOTIFY_CLIENT_ID,
      SPOTIFY_CLIENT_SECRET,
      SPOTIFY_REFRESH_TOKEN,
    );

    const tracks = deduplicateByTrackId(recentlyPlayed.items).map(
      toPlaylistTrack,
    );

    if (tracks.length === 0) {
      return { ok: false, errorMessage: "No recent tracks found" };
    }

    return { ok: true, data: { tracks } };
  } catch (error) {
    console.error("[spotify] getSpotifyMusicResult failed:", error);
    return { ok: false, errorMessage: "Could not load your music right now" };
  }
}
