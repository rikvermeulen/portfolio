import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { mockTWBreakpointIndicatorProps } from "./TWBreakpointIndicator.mock.ts";
import TWBreakpointIndicator from "./TWBreakpointIndicator.tsx";

const meta = {
  title: "Components/Dev/TWBreakpointIndicator",
  component: TWBreakpointIndicator,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof TWBreakpointIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: mockTWBreakpointIndicatorProps,
  decorators: [
    (Story) => (
      <div className="min-h-[120px]">
        <Story />
      </div>
    ),
  ],
};
