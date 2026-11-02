import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { mockInformationProps } from "./Information.mock.ts";
import Information from "./Information.tsx";

const meta = {
  component: Information,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100 p-10">
        <div className="h-72 w-80">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof Information>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: mockInformationProps,
};
