import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Bento from "@/components/Bento/index.ts";

import { mockBentoGridProps } from "./BentoGrid.mock.ts";
import BentoGrid from "./BentoGrid.tsx";

const meta = {
  title: "Modules/BentoGrid",
  component: BentoGrid,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof BentoGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

const demoTile = {
  sizes: { base: "4x4" },
  className: "flex items-center justify-center bg-white p-6",
} as const;

export const Default: Story = {
  args: mockBentoGridProps,
  render: () => (
    <div className="main-container">
      <BentoGrid config={mockBentoGridProps.config}>
        <Bento {...demoTile}>Bento</Bento>
        <Bento {...demoTile}>Bento</Bento>
        <Bento {...demoTile}>Bento</Bento>
      </BentoGrid>
    </div>
  ),
};
