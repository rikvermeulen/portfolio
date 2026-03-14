import type { NextConfig } from "next";

import { nextSecurityHeaders } from "@config/responseHeaders.ts";
import { svgrOptions } from "@config/webpackLoaders.ts";

import "./src/env.ts";

const config: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
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
