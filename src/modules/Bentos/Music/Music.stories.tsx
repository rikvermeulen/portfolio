import type { MusicProps } from "./Music.types.ts";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BentoEmptyState } from "@/components/Bento/index.ts";
import { SpotifyConnectionProvider } from "@/contexts/SpotifyConnectionContext/index.ts";

import Music from "./Music.tsx";

const mockMusicProps = {
  sizeKey: "music",
  source: {
    kind: "tracks",
    tracks: [
      {
        id: "mock-1",
        name: "Creepin'",
        artist: "Metro Boomin",
        albumName: "HEROES & VILLAINS",
        albumArtUrl:
          "https://i.scdn.co/image/ab67616d00001e0267d6c6a76afe5b0c9a0cc2f0",
        explicit: true,
      },
      {
        id: "mock-2",
        name: "Flowers",
        artist: "Miley Cyrus",
        albumName: "Endless Summer Vacation",
        albumArtUrl: null,
        explicit: false,
      },
    ],
  },
} satisfies MusicProps;

const mockPlaylistProps = {
  sizeKey: "music",
  source: {
    kind: "playlist",
    playlist: { id: "2e2ELvxFRAZZSZTncX7zJg", name: "R&B", imageUrl: null },
  },
} satisfies MusicProps;

const meta = {
  component: Music,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100 p-10">
        <div className="size-80">
          <SpotifyConnectionProvider>
            <Story />
          </SpotifyConnectionProvider>
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof Music>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: mockMusicProps,
};

/** Plays a whole playlist (also one owned by another account); add `?spotify-mock` to simulate playback. */
export const Playlist: Story = {
  args: mockPlaylistProps,
};

export const Unavailable: Story = {
  args: mockMusicProps,
  render: () => (
    <BentoEmptyState
      message="Could not load the playlist right now"
      sizeKey="music"
    />
  ),
};
