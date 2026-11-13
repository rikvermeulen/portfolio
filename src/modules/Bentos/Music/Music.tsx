"use client";

import type { MusicProps } from "./Music.types.ts";
import type { AudioBentoDisplay } from "@/components/Audio/AudioBento/index.ts";
import type {
  MusicPlaylist,
  NowPlayingTrack,
  PlaylistTrack,
} from "@/lib/music/types.ts";

import SpotifyAudioBento from "@/components/Audio/SpotifyAudioBento/index.ts";

const SURFACE_CLASS_NAME = "bg-linear-to-b from-ds-music-from to-ds-music-to";

const toTrackDisplay = (track: PlaylistTrack): AudioBentoDisplay => ({
  image: track.albumArtUrl,
  title: track.name,
  subtitle: track.artist,
  alt: track.albumName || "No album",
  explicit: track.explicit,
});

/** The playlist's cover until it plays, then the track the player reports. */
const toPlaylistDisplay = (
  playlist: MusicPlaylist,
  nowPlaying: NowPlayingTrack | null,
): AudioBentoDisplay =>
  nowPlaying
    ? {
        image: nowPlaying.imageUrl ?? playlist.imageUrl,
        title: nowPlaying.name,
        subtitle: nowPlaying.artist,
        alt: nowPlaying.albumName || playlist.name,
      }
    : {
        image: playlist.imageUrl,
        title: playlist.name,
        subtitle: "Playlist",
        alt: playlist.name,
      };

function Music({ sizeKey, source }: MusicProps) {
  if (source.kind === "playlist") {
    return (
      <SpotifyAudioBento
        app="music"
        items={[source.playlist]}
        kind="playlist"
        sizeKey={sizeKey}
        surfaceClassName={SURFACE_CLASS_NAME}
        toDisplay={toPlaylistDisplay}
      />
    );
  }

  return (
    <SpotifyAudioBento
      app="music"
      items={source.tracks}
      kind="track"
      sizeKey={sizeKey}
      surfaceClassName={SURFACE_CLASS_NAME}
      toDisplay={toTrackDisplay}
    />
  );
}

export default Music;
