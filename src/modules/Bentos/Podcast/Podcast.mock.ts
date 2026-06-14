import type { PodcastProps } from "./Podcast.types.ts";

export const mockPodcastProps = {
  episodes: [
    {
      id: "mock-1",
      name: "Episode 1: Getting Started",
      previewUrl: "https://p.scdn.co/mp3-preview/mock1",
      imageUrl:
        "https://i.scdn.co/image/ab67616d00001e0267d6c6a76afe5b0c9a0cc2f0",
      explicit: false,
    },
    {
      id: "mock-2",
      name: "Episode 2: Going Deeper",
      previewUrl: "https://p.scdn.co/mp3-preview/mock2",
      imageUrl:
        "https://i.scdn.co/image/ab67616d00001e0267d6c6a76afe5b0c9a0cc2f0",
      explicit: false,
    },
  ],
} satisfies PodcastProps;

export const mockPodcastPropsEmpty = {
  episodes: [],
  errorMessage: "Could not load episodes right now",
} satisfies PodcastProps;
