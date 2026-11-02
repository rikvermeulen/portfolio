import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { mockLiveTimeProps } from "./LiveTime.mock.ts";
import LiveTime from "./LiveTime.tsx";

const meta = {
  component: LiveTime,
} satisfies Meta<typeof LiveTime>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: mockLiveTimeProps,
};
