import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { mockGlassProps } from "./Glass.mock.ts";
import Glass from "./Glass.tsx";

const meta = {
  component: Glass,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div
        style={{ backgroundImage: "url(/images/me.jpg)" }}
        className="flex min-h-[420px] flex-col items-center justify-center gap-8 bg-cover bg-center p-12"
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Glass>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Glass behind a rounded-full pill. */
export const Pill: Story = {
  args: { ...mockGlassProps, radius: 999 },
  render: (args) => (
    <div className="relative inline-flex items-center justify-center overflow-hidden rounded-full px-6 py-2">
      <Glass {...args} />
      <span className="relative text-sm font-medium text-white drop-shadow">
        Liquid glass pill
      </span>
    </div>
  ),
};

/** Glass behind a clickable button — clicks pass through. */
export const Button: Story = {
  args: mockGlassProps,
  render: (args) => (
    <button
      onClick={() => alert("Button clicked — pointer events pass through!")}
      type="button"
      className="relative inline-flex items-center justify-center overflow-hidden rounded-[28px] px-7 py-3"
    >
      <Glass {...args} />
      <span className="relative text-sm font-semibold text-white drop-shadow">
        Click me
      </span>
    </button>
  ),
};

/** Glass behind a larger card. */
export const Card: Story = {
  args: mockGlassProps,
  render: (args) => (
    <div className="relative w-80 overflow-hidden rounded-3xl p-6">
      <Glass {...args} />
      <div className="relative flex flex-col gap-2 text-white drop-shadow">
        <h3 className="text-lg font-semibold">Glass card</h3>
        <p className="text-sm text-white/90">
          An agnostic background layer that refracts whatever sits behind it,
          following the Aave &ldquo;Building glass for the web&rdquo; technique.
        </p>
      </div>
    </div>
  ),
};

/** Stronger refraction and a touch of blur. */
export const Intense: Story = {
  args: { ...mockGlassProps, intensity: 2, blur: 2 },
  render: (args) => (
    <div className="relative w-80 overflow-hidden rounded-3xl p-6">
      <Glass {...args} />
      <div className="relative flex flex-col gap-2 text-white drop-shadow">
        <h3 className="text-lg font-semibold">Intense glass</h3>
        <p className="text-sm text-white/90">intensity 2, blur 2px</p>
      </div>
    </div>
  ),
};
