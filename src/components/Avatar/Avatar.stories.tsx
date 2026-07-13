import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Avatar from "./Avatar.tsx";

const meta = {
  title: "Components/Avatar",
  component: Avatar,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sizes: Story = {
  args: { name: "Rik Vermeulen" },
  render: () => (
    <div className="flex items-end gap-4">
      <Avatar name="Rik Vermeulen" size={32} />
      <Avatar name="Rik Vermeulen" size={48} />
      <Avatar name="Parademon" size={64} />
      <Avatar name="Parademon" shape="rounded" size={64} />
    </div>
  ),
};

export const WithImage: Story = {
  args: {
    name: "Sample",
    size: 72,
    src: "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg",
  },
};

export const Fallback: Story = {
  args: { name: "Nova", size: 72 },
};
