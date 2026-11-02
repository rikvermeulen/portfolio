import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Drawer from "./Drawer.tsx";

const meta = {
  component: Drawer,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

function DrawerDemo() {
  const [isOpen, setIsOpen] = useState(true);

  // The Drawer fills its nearest positioned ancestor — here a bento-sized tile.
  return (
    <div className="relative size-80 overflow-hidden rounded-3xl bg-linear-to-b from-neutral-700 to-neutral-900">
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        className="flex size-full items-center justify-center text-sm font-medium text-white/80"
      >
        Tap to open drawer
      </button>

      <Drawer
        description="Swipe the handle down to close."
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        title="Drawer"
      >
        <div className="h-64 rounded-2xl bg-white/5" />
      </Drawer>
    </div>
  );
}

export const Default: Story = {
  args: {
    isOpen: true,
    onOpenChange: () => undefined,
    title: "Drawer",
    description: "Swipe the handle down to close.",
    children: null,
  },
  render: () => <DrawerDemo />,
};
