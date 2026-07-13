import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { mockSkeletonCardProps } from "./SkeletonCard.mock.ts";
import SkeletonCard from "./SkeletonCard.tsx";

const meta = {
  title: "Components/SkeletonCard",
  component: SkeletonCard,
} satisfies Meta<typeof SkeletonCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: mockSkeletonCardProps,
};
