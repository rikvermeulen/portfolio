import type { PlantsProps } from "./Plants.types.ts";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BentoEmptyState } from "@/components/Bento/index.ts";

import Plants from "./Plants.tsx";

const mockPlantsProps = {
  sizeKey: "plants",
  onRemind: async () => ({ ok: true }),
  plants: [
    {
      id: "plant-1",
      name: "Monstera",
      scientificName: "Monstera deliciosa",
      health: "needs attention",
      siteName: "Living room",
      imageUrl: "/images/icons/light/planta.png",
      dueCareActionTypes: ["watering"],
      nextActionType: "fertilizing",
      daysUntilNextAction: 5,
    },
    {
      id: "plant-2",
      name: "Calathea",
      scientificName: "Calathea orbifolia",
      health: "happy",
      siteName: "Studio",
      nextActionType: "misting",
      daysUntilNextAction: 3,
    },
    {
      id: "plant-3",
      name: "Pilea",
      scientificName: "Pilea peperomioides",
      health: "thriving",
      siteName: "Kitchen",
      nextActionType: "repotting",
      daysUntilNextAction: 12,
    },
  ],
} satisfies PlantsProps;

const meta = {
  component: Plants,
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
} satisfies Meta<typeof Plants>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: mockPlantsProps,
};

export const Unavailable: Story = {
  args: mockPlantsProps,
  render: () => (
    <BentoEmptyState
      message="No Planta plants available right now."
      sizeKey="plants"
    />
  ),
};
