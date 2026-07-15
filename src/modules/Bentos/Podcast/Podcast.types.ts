import type { BentoSizedProps } from "@/components/Bento/index.ts";
import type { PodcastEpisode } from "@/lib/music/types.ts";

export type { PodcastEpisode };

export interface PodcastProps extends BentoSizedProps {
  readonly episodes: readonly PodcastEpisode[];
}
