import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { mockAnimateProps } from "./Animate.mock.ts";
import { Animate } from "./Animate.tsx";

const meta = {
  title: "Components/Animate",
  component: Animate.div,
} satisfies Meta<typeof Animate.div>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: mockAnimateProps,
  render: (args) => <Animate.div {...args}>Animated element</Animate.div>,
};
