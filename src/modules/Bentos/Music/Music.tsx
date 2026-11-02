"use client";

import type { MusicProps } from "./Music.types.ts";
import type { AudioBentoDisplay } from "@/components/Audio/AudioBento/index.ts";
import type { PlaylistTrack } from "@/lib/music/types.ts";

import SpotifyAudioBento from "@/components/Audio/SpotifyAudioBento/index.ts";

const toDisplay = (track: PlaylistTrack): AudioBentoDisplay => ({
  image: track.albumArtUrl,
  title: track.name,
  subtitle: track.artist,
  alt: track.albumName || "No album",
  explicit: track.explicit,
});

function Music({ sizeKey, tracks }: MusicProps) {
  return (
    <SpotifyAudioBento
      app="music"
      items={tracks}
      kind="track"
      sizeKey={sizeKey}
      surfaceClassName="bg-linear-to-b from-ds-music-from to-ds-music-to"
      toDisplay={toDisplay}
    />
  );
}

export default Music;
