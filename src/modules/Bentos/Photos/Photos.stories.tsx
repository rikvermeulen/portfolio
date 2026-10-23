import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Photos from "./Photos.tsx";

const meta = {
  title: "Modules/Bentos/Photos",
  component: Photos,
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
} satisfies Meta<typeof Photos>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    sizeKey: "photos",
    albums: {
      apps: ["/images/me.jpg", "/images/profile.png"],
      map: ["/images/cloud.png"],
      heart: ["/images/profile.png"],
      dog: ["/images/no-album.png"],
    },
  },
};
