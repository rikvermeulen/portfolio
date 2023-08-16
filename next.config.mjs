// import million from 'million/compiler';

import './src/env.mjs';

/** @type {import('next').NextConfig} */

const config = {
  reactStrictMode: true,
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
    ],
  },
};

export default config;
