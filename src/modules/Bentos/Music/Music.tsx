"use client";

import type { MusicProps } from "./Music.types.ts";

import AudioBento from "@/components/Audio/AudioBento/index.ts";
import { useSpotifyPlayer } from "@/hooks/useSpotifyPlayer/index.ts";

const Music = ({ sizeKey, tracks }: MusicProps) => {
  const {
    isPlaying,
    currentIndex,
    volume,
    error,
    togglePlay,
    goToNext,
    goToPrevious,
    setVolume,
  } = useSpotifyPlayer(tracks, "track");

  const track = tracks[currentIndex];
  const display = track
    ? {
        image: track.albumArtUrl,
        title: track.name,
        subtitle: track.artist,
        alt: track.albumName || "No album",
        explicit: track.explicit,
      }
    : null;

  return (
    <AudioBento
      app="music"
      display={display}
      isPlaying={isPlaying}
      onChangeTrack={(direction) =>
        direction === "next" ? goToNext() : goToPrevious()
      }
      onPlayOrPause={togglePlay}
      onVolumeChange={setVolume}
      playbackError={error}
      sizeKey={sizeKey}
      surfaceClassName="bg-linear-to-b from-ds-music-from to-ds-music-to"
      volume={volume}
    />
  );
};

export default Music;
