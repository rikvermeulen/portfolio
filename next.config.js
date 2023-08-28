// import './src/env.mjs';

const { withContentlayer } = require('next-contentlayer');

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
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
    ],
  },
};

module.exports = withContentlayer(config);
