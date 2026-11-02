import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { toastMocks } from "./Toast.mock.ts";
import ToastProvider from "./ToastProvider.tsx";
import { notify } from "./toastQueue.ts";

/**
 * The Toast system is driven imperatively via `notify()`, so the story renders
 * the site-wide `ToastProvider` plus trigger buttons. Click one to fire a
 * macOS-style banner into the top-right stack.
 */
const meta: Meta<typeof ToastProvider> = {
  component: ToastProvider,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj;

export const Playground: Story = {
  render: () => (
    <div
      style={{ backgroundImage: "url(/images/me.jpg)" }}
      className="flex min-h-screen flex-col items-start gap-3 bg-cover bg-center p-10"
    >
      <p className="text-sm text-neutral-700 dark:text-neutral-300">
        Fire a notification — they stack top-right and auto-dismiss after ~6s
        (hover to pause).
      </p>
      {toastMocks.map((mock) => (
        <button
          key={mock.label}
          onClick={() => notify(mock.content, mock.options)}
          type="button"
          className="rounded-full border border-ds-border bg-white px-4 py-2 text-sm font-medium shadow-sm dark:border-ds-border-dark dark:bg-black"
        >
          {mock.label}
        </button>
      ))}
      <ToastProvider />
    </div>
  ),
};
