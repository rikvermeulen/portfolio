"use client";

import type { PodcastProps } from "./Podcast.types.ts";
import type { AudioBentoDisplay } from "@/components/Audio/AudioBento/index.ts";
import type { PodcastEpisode } from "@/lib/music/types.ts";

import SpotifyAudioBento from "@/components/Audio/SpotifyAudioBento/index.ts";

const toDisplay = (episode: PodcastEpisode): AudioBentoDisplay => ({
  image: episode.imageUrl,
  title: episode.name,
  subtitle: "Podcast",
  alt: episode.name || "No episode",
  explicit: episode.explicit,
});

function Podcast({ sizeKey, episodes }: PodcastProps) {
  return (
    <SpotifyAudioBento
      app="podcast"
      items={episodes}
      kind="episode"
      sizeKey={sizeKey}
      surfaceClassName="bg-linear-to-b from-ds-podcast-from to-ds-podcast-to"
      toDisplay={toDisplay}
    />
  );
}

export default Podcast;
