import type { ImageConfig } from "next/dist/shared/lib/image-config";

export const nextImagesConfig = {
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
    {
      protocol: "https",
      hostname: "**.xboxlive.com",
    },
    {
      protocol: "https",
      hostname: "**.s-microsoft.com",
    },
    {
      protocol: "https",
      hostname: "**.microsoft.com",
    },
  ],
} satisfies ImageConfig;
