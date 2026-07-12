import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { bentoBoxSizes, BentoEmptyState } from "@/components/Bento/index.ts";

import { mockGamesProps } from "./Games.mock.ts";
import Games from "./Games.tsx";

const meta = {
  title: "Modules/Bentos/Games",
  component: Games,
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
} satisfies Meta<typeof Games>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: mockGamesProps,
};

export const Unavailable: Story = {
  args: mockGamesProps,
  render: () => (
    <BentoEmptyState
      message="Could not load your games right now"
      sizes={bentoBoxSizes.games}
    />
  ),
};
