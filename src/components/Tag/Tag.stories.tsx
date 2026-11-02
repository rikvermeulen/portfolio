import type { TagVariant } from "./Tag.types.ts";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { mockTagProps } from "./Tag.mock.ts";
import Tag from "./Tag.tsx";

const meta = {
  component: Tag,
  decorators: [
    (Story) => (
      <div
        style={{
          background:
            "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
        }}
        className="flex min-h-40 items-center justify-center p-10"
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: mockTagProps,
};

const variants: TagVariant[] = [
  "neutral",
  "green",
  "yellow",
  "orange",
  "red",
  "purple",
  "blue",
  "dark",
  "rested",
];

export const FinderColors: Story = {
  args: mockTagProps,
  render: () => (
    <div className="flex flex-wrap justify-center gap-2">
      {variants.map((variant) => (
        <Tag key={variant} label={variant} variant={variant} />
      ))}
    </div>
  ),
};
