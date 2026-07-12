"use client";

import type { PodcastProps } from "./Podcast.types.ts";

import AudioBento from "@/components/AudioBento/index.ts";
import { bentoBoxSizes } from "@/components/Bento/index.ts";
import { useSpotifyPodcastPlayer } from "@/hooks/useSpotifyPodcastPlayer/index.ts";

const Podcast = ({ episodes }: PodcastProps) => {
  const {
    isPlaying,
    currentIndex,
    volume,
    error,
    togglePlay,
    goToNext,
    goToPrevious,
    setVolume,
  } = useSpotifyPodcastPlayer(episodes);

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
      sizes={bentoBoxSizes.podcast}
      volume={volume}
      className="bg-linear-to-b from-ds-podcast-from to-ds-podcast-to"
    />
  );
};

export default Podcast;
