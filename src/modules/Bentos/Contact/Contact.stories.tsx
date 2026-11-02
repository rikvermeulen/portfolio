import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Contact from "./Contact.tsx";

const meta = {
  component: Contact,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100 p-10">
        <div className="w-[600px]">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof Contact>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { sizeKey: "contact" },
};
