import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { mockAudioBentoProps } from "./AudioBento.mock.ts";
import AudioBento from "./AudioBento.tsx";

// AudioBento is presentational; stories render it with fully-typed mock props
// (player state + no-op handlers) supplied by the containers at runtime.
const meta: Meta<typeof AudioBento> = {
  component: AudioBento,
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
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <AudioBento {...mockAudioBentoProps} />,
};
