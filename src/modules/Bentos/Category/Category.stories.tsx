import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { mockCategoryProps } from "./Category.mock.ts";
import Category from "./Category.tsx";

const meta = {
  title: "Modules/Bentos/Category",
  component: Category,
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
} satisfies Meta<typeof Category>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: mockCategoryProps,
};
