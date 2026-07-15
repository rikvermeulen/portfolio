import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { mockHeaderProps } from "./Header.mock.ts";
import Header from "./Header.tsx";

const meta = {
  title: "Modules/Header",
  component: Header,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: mockHeaderProps,
};
