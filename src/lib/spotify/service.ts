import type {
  PlaylistTrack,
  SpotifyMusicData,
  SpotifyRecentlyPlayedItem,
} from "./types.ts";
import type { Result } from "@/types/index.ts";

import { env } from "@env";

import { fetchRecentlyPlayed } from "./client.ts";
import { pickSpotifyImage } from "./utils.ts";

function toPlaylistTrack(item: SpotifyRecentlyPlayedItem): PlaylistTrack {
  const { track } = item;
  return {
    id: track.id,
    name: track.name,
    artist: track.artists[0]?.name ?? "Unknown artist",
    albumName: track.album.name,
    albumArtUrl: pickSpotifyImage(track.album.images),
    explicit: track.explicit,
  };
}

function deduplicateByTrackId(
  items: readonly SpotifyRecentlyPlayedItem[],
): SpotifyRecentlyPlayedItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.track.id)) {
      return false;
    }
    seen.add(item.track.id);
    return true;
  });
}

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
