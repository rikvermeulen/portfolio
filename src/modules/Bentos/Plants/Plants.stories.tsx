import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BentoEmptyState } from "@/components/Bento/index.ts";

import { mockPlantsProps } from "./Plants.mock.ts";
import Plants from "./Plants.tsx";

const meta = {
  title: "Modules/Bentos/Plants",
  component: Plants,
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
} satisfies Meta<typeof Plants>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: mockPlantsProps,
};

export const Unavailable: Story = {
  args: mockPlantsProps,
  render: () => (
    <BentoEmptyState
      message="No Planta plants available right now."
      sizeKey="plants"
    />
  ),
};
