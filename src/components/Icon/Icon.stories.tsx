import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { mockIconProps } from "./Icon.mock.ts";
import Icon from "./Icon.tsx";

const meta = {
  component: Icon,
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: mockIconProps,
};
