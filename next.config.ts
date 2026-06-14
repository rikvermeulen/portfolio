import type { NextConfig } from "next";

import { nextSecurityHeaders } from "@config/responseHeaders.ts";
import { svgrOptions } from "@config/webpackLoaders.ts";

import "./src/env.ts";

const config: NextConfig = {
  allowedDevOrigins: ["[::1]", "127.0.0.1"],
  reactStrictMode: true,
  images: {
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
