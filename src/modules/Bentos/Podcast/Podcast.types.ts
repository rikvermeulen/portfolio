import type { PodcastEpisode } from "@/lib/spotify/types.ts";
import type { WithErrorMessage } from "@/types/index.ts";

export type { PodcastEpisode };

export interface PodcastProps extends WithErrorMessage {
  readonly episodes: readonly PodcastEpisode[];
}
