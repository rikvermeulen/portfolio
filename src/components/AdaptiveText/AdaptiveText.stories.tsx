import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import AdaptiveText from "./AdaptiveText.tsx";

/**
 * `AdaptiveText` reads the solid backdrop color *behind the overlay* and paints
 * the whole label one accessible color. This story puts solid dark / light /
 * colored bands on the page, then floats transparent glass "toasts" in a fixed,
 * z-indexed overlay (like the real ToastRegion) spread across those bands. Each
 * label should be a single uniform color chosen for contrast — never a
 * per-glyph gradient — and should match the band it currently sits over.
 */
const meta: Meta<typeof AdaptiveText> = {
  component: AdaptiveText,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof AdaptiveText>;

const BANDS = ["#0a0a0a", "#1c1c1e", "#ebeceb", "#ffffff", "#0a84ff"];

const TOASTS = [
  ["Email copied", "hello@rikvermeulen.com"],
  ["Now playing", "Bonobo — Kerala"],
  ["Question copied", "What made you smile today?"],
  ["Achievement unlocked", "Completed the tutorial on Hades"],
  ["Uploaded", "5 photos synced to the cloud"],
];

export const OverSolidBackdrops: Story = {
  render: () => (
    <div className="min-h-screen">
      {/* Page backdrop: solid color bands, BEHIND the overlay. */}
      <div className="fixed inset-0 flex flex-col">
        {BANDS.map((bg) => (
          <div key={bg} style={{ backgroundColor: bg }} className="flex-1" />
        ))}
      </div>

      {/* Overlay: transparent glass toasts, reproducing the fixed ToastRegion. */}
      <div className="fixed top-6 right-6 bottom-6 z-9999 flex flex-col items-end justify-between">
        {TOASTS.map(([title, description]) => (
          <div
            key={title}
            className="relative w-[22rem] overflow-hidden rounded-3xl shadow-xl"
          >
            <span
              aria-hidden
              style={{
                boxShadow:
                  "inset 0 0 0 .5px rgba(255,255,255,.4), inset 0 0 8px rgba(255,255,255,.1)",
              }}
              className="absolute inset-0 backdrop-blur-[2px]"
            />
            <div className="relative flex flex-col px-4 py-3">
              <AdaptiveText className="text-sm font-semibold">
                {title}
              </AdaptiveText>
              <AdaptiveText className="text-sm">{description}</AdaptiveText>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};
