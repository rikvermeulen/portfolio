import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Navigation from "./Navigation.tsx";

const meta = {
  title: "Modules/Navigation",
  component: Navigation,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="main-container py-10">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Navigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
