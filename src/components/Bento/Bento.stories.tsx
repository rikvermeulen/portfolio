import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { mockBentoProps } from "./Bento.mock.ts";
import Bento from "./Bento.tsx";

const meta = {
  title: "Components/Bento",
  component: Bento,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="flex min-h-[420px] items-center justify-center bg-neutral-100 p-10">
        <div className="size-72">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof Bento>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Card: Story = {
  args: mockBentoProps,
};
