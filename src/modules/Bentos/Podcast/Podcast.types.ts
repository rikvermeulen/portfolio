import type { PodcastEpisode } from "@/lib/spotify/types.ts";

export type { PodcastEpisode };

export interface PodcastProps {
  readonly episodes: readonly PodcastEpisode[];
  readonly errorMessage?: string;
}
