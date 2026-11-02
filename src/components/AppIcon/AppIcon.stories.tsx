import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { bentos } from "@/components/Bento/Bento.const.ts";

import {
  mockAppIconInteractiveProps,
  mockAppIconLightOnlyProps,
  mockAppIconProps,
} from "./AppIcon.mock.ts";
import AppIcon from "./AppIcon.tsx";

const appEntries = Object.values(bentos).filter(
  (entry): entry is typeof entry & { name: string; icon: string } =>
    "name" in entry && "icon" in entry,
);

const meta = {
  component: AppIcon,
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center bg-neutral-100 p-10 dark:bg-neutral-900">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AppIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: mockAppIconProps,
};

export const LightOnly: Story = {
  args: mockAppIconLightOnlyProps,
};

export const Interactive: Story = {
  args: mockAppIconInteractiveProps,
};

export const AllApps: Story = {
  args: mockAppIconProps,
  render: () => (
    <div className="flex flex-wrap justify-center gap-4">
      {appEntries.map((app) => (
        <div key={app.name} className="flex flex-col items-center gap-2">
          <AppIcon
            alt={app.name}
            darkSrc={"darkIcon" in app ? app.darkIcon : undefined}
            src={app.icon}
          />
          <span className="text-xs text-neutral-600 dark:text-neutral-300">
            {app.name}
          </span>
        </div>
      ))}
    </div>
  ),
};
