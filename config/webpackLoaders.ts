import type { Config } from "@svgr/core";

export const svgrOptions = {
  dimensions: false,
  svgoConfig: {
    plugins: [
      {
        name: "preset-default",
        params: {
          overrides: {
            removeViewBox: false,
            cleanupIds: false,
          },
        },
      },
    ],
  },
} satisfies Config;
