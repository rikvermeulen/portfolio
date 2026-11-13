import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { mockGitLabEmptyProps, mockGitLabProps } from "./GitLab.mock.ts";
import GitLab from "./GitLab.tsx";

const meta = {
  component: GitLab,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100 p-10">
        {/* --bento-unit is normally set by the grid; tiles derive --tile-em from it. */}
        <div className="size-80 [--bento-unit:20rem]">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof GitLab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: mockGitLabProps,
};

export const NoActivity: Story = {
  args: mockGitLabEmptyProps,
};
