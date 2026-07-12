import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { bentoBoxSizes, BentoEmptyState } from "@/components/Bento/index.ts";

import { mockMusicProps } from "./Music.mock.ts";
import Music from "./Music.tsx";

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
      sizes={bentoBoxSizes.music}
    />
  ),
};
