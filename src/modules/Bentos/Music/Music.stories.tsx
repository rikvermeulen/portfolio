import type { MusicProps } from "./Music.types.ts";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BentoEmptyState } from "@/components/Bento/index.ts";

import Music from "./Music.tsx";

const mockMusicProps = {
  sizeKey: "music",
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
} satisfies MusicProps;

const meta = {
  title: "Modules/Bentos/Music",
  component: Music,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100 p-10">
        <div className="size-80">
          <Story />
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

export const Unavailable: Story = {
  args: mockMusicProps,
  render: () => (
    <BentoEmptyState
      message="Could not load the playlist right now"
      sizeKey="music"
    />
  ),
};
