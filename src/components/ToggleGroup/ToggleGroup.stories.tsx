import { useState } from "react";

import type { Meta } from "@storybook/nextjs-vite";

import { mockAlbumOptions, mockTabOptions } from "./ToggleGroup.mock.ts";
import ToggleGroup from "./ToggleGroup.tsx";

const meta = {
  component: ToggleGroup,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div
        style={{ backgroundImage: "url(/images/me.jpg)" }}
        className="flex min-h-[300px] items-center justify-center bg-cover bg-center p-12"
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ToggleGroup>;

export default meta;

function AlbumsStory() {
  const [value, setValue] = useState(mockAlbumOptions[0]!.value);
  return (
    <ToggleGroup onChange={setValue} options={mockAlbumOptions} value={value} />
  );
}

function TabsStory() {
  const [value, setValue] = useState(mockTabOptions[0]!.value);
  return (
    <ToggleGroup onChange={setValue} options={mockTabOptions} value={value} />
  );
}

export const Albums = { render: () => <AlbumsStory /> };
export const Tabs = { render: () => <TabsStory /> };
