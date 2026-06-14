import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  mockAudioControlsPlayingProps,
  mockAudioControlsProps,
} from "./AudioControls.mock.ts";
import AudioControls from "./AudioControls.tsx";

const meta = {
  title: "Components/AudioControls",
  component: AudioControls,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center rounded-2xl bg-[#E96575] p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AudioControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Paused: Story = {
  args: mockAudioControlsProps,
};

export const Playing: Story = {
  args: mockAudioControlsPlayingProps,
};
