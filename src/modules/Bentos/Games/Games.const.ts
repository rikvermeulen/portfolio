import type { PlatformId } from "@/lib/games/types.ts";

export const MENU_SECTIONS = [
  { section: "games", label: "Games", icon: "steam" },
  { section: "platforms", label: "Platforms", icon: "steam" },
] as const;

export type GamesMenuSection = (typeof MENU_SECTIONS)[number]["section"];

export const PLATFORM_APP_ICONS: Record<
  PlatformId,
  { readonly src: string; readonly darkSrc: string }
> = {
  steam: {
    src: "/images/icons/light/steam.png",
    darkSrc: "/images/icons/dark/steam.png",
  },
  xbox: {
    src: "/images/icons/light/xbox.png",
    darkSrc: "/images/icons/dark/xbox.png",
  },
  discord: {
    src: "/images/icons/light/discord.png",
    darkSrc: "/images/icons/dark/discord.png",
  },
};

export const ARCADE_BADGE = "/images/icons/light/arcade.png";
