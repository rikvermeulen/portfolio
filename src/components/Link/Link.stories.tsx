import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { mockLinkProps } from "./Link.mock.ts";
import Link from "./Link.tsx";

const meta = {
  title: "Components/Link",
  component: Link,
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: mockLinkProps,
};
