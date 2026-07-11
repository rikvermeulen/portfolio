"use client";

import type { PodcastProps } from "./Podcast.types.ts";

import AudioBento from "@/components/AudioBento/index.ts";
import { bentoBoxSizes } from "@/components/Bento/index.ts";

const Podcast = ({ episodes, errorMessage }: PodcastProps) => (
  <AudioBento
    errorMessage={errorMessage}
    getDisplay={(episode) => ({
      image: episode.imageUrl,
      title: episode.name,
      subtitle: "Podcast",
      alt: episode.name || "No episode",
      explicit: episode.explicit,
    })}
    icon="/images/icons/podcast.png"
    items={episodes}
    sizes={bentoBoxSizes.podcast}
    uriType="episode"
    className="bg-linear-to-b from-ds-podcast-from to-ds-podcast-to"
  />
);

export default Podcast;
