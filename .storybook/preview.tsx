import type { Preview } from "@storybook/nextjs-vite";

import { fontInter } from "@/lib/fonts/fonts.ts";

import "@/styles/globals.css";

const preview: Preview = {
  decorators: [
    (Story) => (
      <div className={`${fontInter.variable} font-inter antialiased`}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "centered",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
  },
};

export default preview;
