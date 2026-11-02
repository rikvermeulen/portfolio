"use client";

import type { SpotifyAudioBentoProps } from "./SpotifyAudioBento.types.ts";
import type { SpotifyPlayable } from "@/hooks/useSpotifyPlayer/index.ts";

import AudioBento from "@/components/Audio/AudioBento/index.ts";
import { useSpotifyPlayer } from "@/hooks/useSpotifyPlayer/index.ts";

/** Wires the shared Spotify player to the presentational AudioBento (Music, Podcast). */
function SpotifyAudioBento<T extends SpotifyPlayable>({
  items,
  kind,
  toDisplay,
  ...bentoProps
}: SpotifyAudioBentoProps<T>) {
  const player = useSpotifyPlayer(items, kind);
  const item = items[player.currentIndex];

  const handleChangeTrack = (direction: "previous" | "next") =>
    direction === "next" ? player.goToNext() : player.goToPrevious();

  return (
    <AudioBento
      {...bentoProps}
      display={item ? toDisplay(item, player.nowPlaying) : null}
      isPlaying={player.isPlaying}
      onChangeTrack={handleChangeTrack}
      onPlayOrPause={player.togglePlay}
      onVolumeChange={player.setVolume}
      playbackError={player.error}
      volume={player.volume}
    />
  );
}

export default SpotifyAudioBento;
