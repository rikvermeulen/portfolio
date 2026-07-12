"use client";

import type { MusicProps } from "./Music.types.ts";

import AudioBento from "@/components/AudioBento/index.ts";
import { bentoBoxSizes } from "@/components/Bento/index.ts";
import { useSpotifyMusicPlayer } from "@/hooks/useSpotifyMusicPlayer/index.ts";

const Music = ({ tracks, errorMessage }: MusicProps) => {
  const {
    isPlaying,
    currentIndex,
    volume,
    error,
    togglePlay,
    goToNext,
    goToPrevious,
    setVolume,
  } = useSpotifyMusicPlayer(tracks);

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
      display={display}
      errorMessage={errorMessage}
      icon="/images/icons/music.png"
      isPlaying={isPlaying}
      onChangeTrack={(direction) =>
        direction === "next" ? goToNext() : goToPrevious()
      }
      onPlayOrPause={togglePlay}
      onVolumeChange={setVolume}
      playbackError={error}
      sizes={bentoBoxSizes.music}
      volume={volume}
      className="bg-linear-to-b from-ds-music-from to-ds-music-to"
    />
  );
};

export default Music;
