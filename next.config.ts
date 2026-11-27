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
  // Pages from the pre-2026 portfolio; the content is gone, so send visitors home.
  async redirects() {
    return ["/work/:path*", "/archive", "/imprint"].map((source) => ({
      source,
      destination: "/",
      permanent: true,
    }));
  },
};

export default config;
