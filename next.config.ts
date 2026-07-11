import type { NextConfig } from "next";

import { nextSecurityHeaders } from "@config/responseHeaders.ts";
import { svgrOptions } from "@config/webpackLoaders.ts";

import "./src/env.ts";

const config: NextConfig = {
  allowedDevOrigins: ["*.*", "*.*.*", "*.*.*.*"],
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.scdn.co",
      },
      {
        protocol: "https",
        hostname: "*.picnicinternational.com",
      },
      {
        protocol: "https",
        hostname: "images.getplanta.com",
      },
      {
        protocol: "https",
        hostname: "**.steamstatic.com",
      },
      {
        protocol: "https",
        hostname: "assets.nintendo.com",
      },
    ],
  },
  reactCompiler: true,
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
