import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Bento from "@/components/Bento/index.ts";

import BentoGrid from "./BentoGrid.tsx";

const meta = {
  component: BentoGrid,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof BentoGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

const demoTile = {
  sizes: { base: "4x4", lg: "3x3" },
  className: "flex items-center justify-center bg-white p-6",
} as const;

export const Default: Story = {
  render: () => (
    <div className="main-container">
      <BentoGrid>
        <Bento {...demoTile}>Bento</Bento>
        <Bento {...demoTile}>Bento</Bento>
        <Bento {...demoTile}>Bento</Bento>
      </BentoGrid>
    </div>
  ),
};
