import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import SkipLink from "./SkipLink.tsx";

/**
 * `SkipLink` is translated off-screen until it receives keyboard focus. In this
 * story it is shown in its revealed (focused) position so its appearance can be
 * inspected; Tab to it in the canvas to see the real reveal behaviour.
 */
const meta = {
  component: SkipLink,
  parameters: {
    docs: {
      description: {
        component:
          "Keyboard bypass link (WCAG 2.4.1). First element in the tab order; " +
          "hidden until focused, then jumps focus to the page's main landmark.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="relative h-24">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SkipLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomTarget: Story = {
  args: {
    targetId: "content",
    children: "Skip to main content",
  },
};
