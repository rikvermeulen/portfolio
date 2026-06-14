import type { MusicProps } from "./Music.types.ts";

export const mockMusicProps = {
  tracks: [
    {
      id: "mock-1",
      name: "Creepin'",
      artist: "Metro Boomin",
      albumName: "HEROES & VILLAINS",
      albumArtUrl:
        "https://i.scdn.co/image/ab67616d00001e0267d6c6a76afe5b0c9a0cc2f0",
      previewUrl: "https://p.scdn.co/mp3-preview/mock",
      explicit: true,
    },
    {
      id: "mock-2",
      name: "Rich Flex",
      artist: "Drake",
      albumName: "Her Loss",
      albumArtUrl:
        "https://i.scdn.co/image/ab67616d00001e02e8e4e8f9b6b5e3b8e6b5e3b8",
      previewUrl: "https://p.scdn.co/mp3-preview/mock2",
      explicit: true,
    },
    {
      id: "mock-3",
      name: "Flowers",
      artist: "Miley Cyrus",
      albumName: "Endless Summer Vacation",
      albumArtUrl: null,
      previewUrl: "https://p.scdn.co/mp3-preview/mock3",
      explicit: false,
    },
  ],
} satisfies MusicProps;

export const mockMusicPropsEmpty = {
  tracks: [],
  errorMessage: "Could not load the playlist right now",
} satisfies MusicProps;
