import type {
  PlaylistTrack,
  SpotifyPlaylistItem,
  SpotifyRecentlyPlayedItem,
} from "./types.ts";

import { env } from "@env";

import { fetchPlaylistTracks, fetchRecentlyPlayed } from "./client.ts";

// Today's Top Hits — stable Spotify editorial playlist for testing
const PUBLIC_TEST_PLAYLIST_ID = "37i9dQZF1DXcBWIGoYBM5M";

export interface SpotifyMusicData {
  readonly tracks: readonly PlaylistTrack[];
}

export type SpotifyMusicResult =
  | { readonly ok: true; readonly data: SpotifyMusicData }
  | { readonly ok: false; readonly errorMessage: string };

function toPlaylistTrack(item: SpotifyRecentlyPlayedItem): PlaylistTrack {
  const { track } = item;
  return {
    id: track.id,
    name: track.name,
    artist: track.artists[0]?.name ?? "Unknown artist",
    albumName: track.album.name,
    albumArtUrl:
      track.album.images[1]?.url ?? track.album.images[0]?.url ?? null,
    previewUrl: track.preview_url,
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

function toPlaylistTrackFromPlaylistItem(
  item: SpotifyPlaylistItem,
): PlaylistTrack | null {
  const { track } = item;
  if (!track) {
    return null;
  }
  return {
    id: track.id,
    name: track.name,
    artist: track.artists[0]?.name ?? "Unknown artist",
    albumName: track.album.name,
    albumArtUrl:
      track.album.images[1]?.url ?? track.album.images[0]?.url ?? null,
    previewUrl: track.preview_url,
    explicit: track.explicit,
  };
}

export async function getSpotifyPlaylistResult(
  playlistId = PUBLIC_TEST_PLAYLIST_ID,
): Promise<SpotifyMusicResult> {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = env;

  try {
    const playlist = await fetchPlaylistTracks(
      playlistId,
      SPOTIFY_CLIENT_ID,
      SPOTIFY_CLIENT_SECRET,
    );
    const tracks = playlist.items
      .map(toPlaylistTrackFromPlaylistItem)
      .filter((t): t is PlaylistTrack => t !== null);

    if (tracks.length === 0) {
      return { ok: false, errorMessage: "No tracks found in playlist" };
    }

    return { ok: true, data: { tracks } };
  } catch (error) {
    console.error("[spotify] getSpotifyPlaylistResult failed:", error);
    return { ok: false, errorMessage: "Could not load playlist right now" };
  }
}

export async function getSpotifyMusicResult(): Promise<SpotifyMusicResult> {
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
