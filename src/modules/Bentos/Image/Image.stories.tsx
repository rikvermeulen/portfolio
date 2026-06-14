import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { mockImageProps } from "./Image.mock.ts";
import Image from "./Image.tsx";

const meta = {
  title: "Modules/Bentos/Image",
  component: Image,
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
} satisfies Meta<typeof Image>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: mockImageProps,
};
