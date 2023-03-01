/* eslint-disable import/no-extraneous-dependencies */
/** @type {import('next').NextConfig} */

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

module.exports = withPWA({
  output: 'standalone',
  experimental: {
    appDir: true,
  },
});
