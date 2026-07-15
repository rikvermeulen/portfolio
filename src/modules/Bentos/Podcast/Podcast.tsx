"use client";

import type { PodcastProps } from "./Podcast.types.ts";

import AudioBento from "@/components/Audio/AudioBento/index.ts";
import { useSpotifyPlayer } from "@/hooks/useSpotifyPlayer/index.ts";

const Podcast = ({ sizeKey, episodes }: PodcastProps) => {
  const {
    isPlaying,
    currentIndex,
    volume,
    error,
    togglePlay,
    goToNext,
    goToPrevious,
    setVolume,
  } = useSpotifyPlayer(episodes, "episode");

  const episode = episodes[currentIndex];
  const display = episode
    ? {
        image: episode.imageUrl,
        title: episode.name,
        subtitle: "Podcast",
        alt: episode.name || "No episode",
        explicit: episode.explicit,
      }
    : null;

  return (
    <AudioBento
      app="podcast"
      display={display}
      isPlaying={isPlaying}
      onChangeTrack={(direction) =>
        direction === "next" ? goToNext() : goToPrevious()
      }
      onPlayOrPause={togglePlay}
      onVolumeChange={setVolume}
      playbackError={error}
      sizeKey={sizeKey}
      surfaceClassName="bg-linear-to-b from-ds-podcast-from to-ds-podcast-to"
      volume={volume}
    />
  );
};

export default Podcast;
