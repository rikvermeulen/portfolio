import path from "node:path";
import { fileURLToPath } from "node:url";

import svgr from "vite-plugin-svgr";

import type { StorybookConfig } from "@storybook/nextjs-vite";

import tailwindcss from "@tailwindcss/postcss";

import { svgrOptions } from "../config/webpackLoaders.ts";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  // titles come from the folder path (CSF3 auto-title), prefixed per root
  stories: [
    {
      directory: "../src/components",
      files: "**/*.stories.@(ts|tsx)",
      titlePrefix: "Components",
    },
    {
      directory: "../src/modules",
      files: "**/*.stories.@(ts|tsx)",
      titlePrefix: "Modules",
    },
  ],
  addons: ["@storybook/addon-a11y", "@storybook/addon-docs"],
  framework: "@storybook/nextjs-vite",
  staticDirs: ["../public"],
  viteFinal: async (config) => {
    config.plugins = [svgr({ svgrOptions }), ...(config.plugins ?? [])];
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        "@": path.resolve(dirname, "../src"),
        "@config": path.resolve(dirname, "../config"),
        "@env": path.resolve(dirname, "../src/env.ts"),
      },
    };

    config.css = {
      ...config.css,
      postcss: {
        plugins: [tailwindcss()],
      },
    };

    return config;
  },
};

export default config;
