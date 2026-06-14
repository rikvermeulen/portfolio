import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { mockReactScanProps } from "./ReactScan.mock.ts";
import ReactScan from "./ReactScan.tsx";

const meta = {
  title: "Components/Dev/ReactScan",
  component: ReactScan,
} satisfies Meta<typeof ReactScan>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: mockReactScanProps,
};
