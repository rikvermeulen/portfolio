import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { mockFindMeProps } from "./FindMe.mock.ts";
import FindMe from "./FindMe.tsx";

const meta = {
  title: "Modules/Bentos/FindMe",
  component: FindMe,
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
} satisfies Meta<typeof FindMe>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: mockFindMeProps,
};
