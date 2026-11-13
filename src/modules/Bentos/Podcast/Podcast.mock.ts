import type { PodcastProps } from "./Podcast.types.ts";

export const mockPodcastProps = {
  sizeKey: "podcast",
  episodes: [
    {
      id: "mock-1",
      name: "Episode 1: Getting Started",
      showName: "Developer Tea",
      imageUrl:
        "https://i.scdn.co/image/ab67616d00001e0267d6c6a76afe5b0c9a0cc2f0",
      explicit: false,
    },
    {
      id: "mock-2",
      name: "Episode 2: Going Deeper",
      showName: "Syntax",
      imageUrl:
        "https://i.scdn.co/image/ab67616d00001e0267d6c6a76afe5b0c9a0cc2f0",
      explicit: false,
    },
  ],
} satisfies PodcastProps;
