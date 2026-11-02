import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BentoEmptyState } from "@/components/Bento/index.ts";

import { mockPodcastProps } from "./Podcast.mock.ts";
import Podcast from "./Podcast.tsx";

const meta = {
  component: Podcast,
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
} satisfies Meta<typeof Podcast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: mockPodcastProps,
};

export const Unavailable: Story = {
  args: mockPodcastProps,
  render: () => (
    <BentoEmptyState
      message="Could not load episodes right now"
      sizeKey="podcast"
    />
  ),
};
