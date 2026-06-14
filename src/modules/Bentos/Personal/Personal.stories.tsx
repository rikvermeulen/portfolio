import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { mockPersonalProps } from "./Personal.mock.ts";
import Personal from "./Personal.tsx";

const meta = {
  title: "Modules/Bentos/Personal",
  component: Personal,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100 p-10">
        <div className="h-[26rem] w-[32rem] max-w-full">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof Personal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: mockPersonalProps,
};
