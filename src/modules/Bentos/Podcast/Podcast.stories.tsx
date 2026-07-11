import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { mockPodcastProps, mockPodcastPropsEmpty } from "./Podcast.mock.ts";
import Podcast from "./Podcast.tsx";

const meta = {
  title: "Modules/Bentos/Podcast",
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

export const Empty: Story = {
  args: mockPodcastPropsEmpty,
};
