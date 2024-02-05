import './src/env.mjs';

import million from 'million/compiler';
import { withContentlayer } from 'next-contentlayer-temp';

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  webpack: (config) => {
    config.infrastructureLogging = {
      level: 'error',
    };

    return config;
  },
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gytlzoopugyodvbaxhpy.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
      },
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
      },
      {
        protocol: 'http',
        hostname: 'books.google.com',
      },
    ],
  },
};

const millionConfig = {
  auto: true,
  mute: true,
};

export default million.next(withContentlayer(config), millionConfig);
