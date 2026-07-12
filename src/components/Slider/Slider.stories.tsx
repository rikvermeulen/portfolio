import { useState } from "react";

import type { Meta } from "@storybook/nextjs-vite";

import { mockSliderProps } from "./Slider.mock.ts";
import Slider from "./Slider.tsx";

const meta = {
  title: "Components/Slider",
  component: Slider,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="flex min-h-[120px] w-80 items-center justify-center bg-neutral-900 p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Slider>;

export default meta;

function DefaultStory() {
  const [value, setValue] = useState(0.5);
  return <Slider {...mockSliderProps} onChange={setValue} value={value} />;
}

export const Default = { render: () => <DefaultStory /> };
