import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { mockHeroProps } from "./Hero.mock.ts";
import Hero from "./Hero.tsx";

const meta = {
  component: Hero,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="main-container py-10">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: mockHeroProps,
};
