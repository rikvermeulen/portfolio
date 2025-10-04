import "./src/env.ts";

import { withContentlayer } from "next-contentlayer2";

import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gytlzoopugyodvbaxhpy.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.scdn.co",
      },
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
      {
        protocol: "http",
        hostname: "books.google.com",
      },
    ],
  },
  // experimental: {
  //   reactCompiler: true,
  // },
};

export default withContentlayer(config);
