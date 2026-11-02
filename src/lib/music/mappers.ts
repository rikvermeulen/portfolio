import type {
  MusicPlaylist,
  NowPlayingTrack,
  PlaylistTrack,
  PodcastEpisode,
} from "./types.ts";
import type {
  SpotifyEpisode,
  SpotifyPlaylist,
  SpotifyRecentlyPlayedItem,
} from "@/vendors/spotify/types.ts";
import type { WebPlaybackTrack } from "@/vendors/spotify/webPlayback.ts";

import { pickSpotifyImage } from "./image.ts";

/** Map a Spotify recently-played item to the domain track shape. */
export function toPlaylistTrack(
  item: SpotifyRecentlyPlayedItem,
): PlaylistTrack {
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

/** Drop repeat plays of the same track, keeping first occurrence order. */
export function deduplicateByTrackId(
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

/** Map a Spotify show episode to the domain podcast-episode shape. */
export function toPodcastEpisode(episode: SpotifyEpisode): PodcastEpisode {
  return {
    id: episode.id,
    name: episode.name,
    imageUrl: pickSpotifyImage(episode.images),
    explicit: episode.explicit,
  };
}

/** Map Spotify playlist metadata to the domain playlist shape. */
export function toMusicPlaylist(playlist: SpotifyPlaylist): MusicPlaylist {
  return {
    id: playlist.id,
    name: playlist.name,
    imageUrl: pickSpotifyImage(playlist.images),
  };
}

/** Map the SDK's current track to the domain shape; `null` when nothing is loaded. */
export function toNowPlayingTrack(
  track: WebPlaybackTrack | undefined,
): NowPlayingTrack | null {
  if (!track?.uri) {
    return null;
  }
  return {
    uri: track.uri,
    name: track.name ?? "",
    artist: track.artists?.[0]?.name ?? "Unknown artist",
    albumName: track.album?.name ?? "",
    imageUrl: pickSpotifyImage(track.album?.images ?? []),
  };
}
