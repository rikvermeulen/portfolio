import type { NextConfig } from "next";

import { nextImagesConfig } from "@config/images.ts";
import { nextSecurityHeaders } from "@config/responseHeaders.ts";
import { svgrOptions } from "@config/webpackLoaders.ts";

import "./src/env.ts";

const config: NextConfig = {
  allowedDevOrigins: ["*.*", "*.*.*", "*.*.*.*"],
  reactStrictMode: true,
  images: nextImagesConfig,
  reactCompiler: process.env.NODE_ENV === "production",
  experimental: {
    preloadEntriesOnStart: false,
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: [
          {
            loader: "@svgr/webpack",
            options: svgrOptions,
          },
        ],
        as: "*.js",
      },
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: nextSecurityHeaders }];
  },
};

export default config;
