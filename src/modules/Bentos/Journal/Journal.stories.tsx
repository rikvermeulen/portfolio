import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { mockJournalProps } from "./Journal.mock.ts";
import Journal from "./Journal.tsx";

const meta = {
  component: Journal,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100 p-10">
        <div className="h-[16rem] w-[34rem] max-w-full">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof Journal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: mockJournalProps,
};
