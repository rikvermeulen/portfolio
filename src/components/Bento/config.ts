import type { BentoGridConfig } from "./Bento.types.ts";

export const bentoGridConfig: BentoGridConfig = {
  columns: { base: 4, md: 8, lg: 12 },
  gap: { base: "0.75rem", md: "1rem", lg: "1.25rem" },
  // Each value approximates column width before JS runs:
  //   container inner-width = 100vw − 2 × 4.1667% padding = 91.6666vw
  //   col = (91.6666vw − (n−1) × gap) / n
  rowHeight: {
    base: "calc(22.9167vw - 0.5625rem)",
    md: "calc(11.4583vw - 0.875rem)",
    lg: "calc(7.6389vw - 1.14583rem)",
  },
};

export const bentoSizeBreakpoints = {
  md: "48rem", // 768px  (Tailwind md)
  lg: "80rem", // 1280px (Tailwind xl — intentionally skips lg/1024px)
} as const;

/**
 * Single source of truth for bento tiles: grid sizes plus optional app identity
 * (icon + display name for `<Bento app>` and toasts). Layout-only tiles omit
 * name/icon; referenced apps like Greenberry omit sizes.
 */
export const bentos = {
  personal: {
    sizes: { base: "4x4", md: "8x4", lg: "6x4" },
    name: "Rik Vermeulen",
    icon: "/images/me.jpg",
  },
  contact: {
    sizes: { base: "4x4", md: "8x4", lg: "6x3" },
    name: "Messages",
    icon: "/images/icons/light/messages.png",
    darkIcon: "/images/icons/dark/messages.png",
  },
  journal: {
    sizes: { base: "4x4", md: "8x4", lg: "6x3" },
    name: "Journal",
    icon: "/images/icons/light/journal.png",
    darkIcon: "/images/icons/dark/journal.png",
  },
  photos: {
    sizes: { base: "4x4", md: "4x4", lg: "3x3" },
    name: "Photos",
    icon: "/images/icons/light/photos.png",
    darkIcon: "/images/icons/dark/photos.png",
  },
  plants: {
    sizes: { base: "4x4", md: "4x4", lg: "3x3" },
    name: "Planta",
    icon: "/images/icons/light/planta.png",
    darkIcon: "/images/icons/dark/planta.png",
  },
  recipes: {
    sizes: { base: "4x4", md: "4x4", lg: "3x3" },
    name: "Picnic",
    icon: "/images/icons/light/picnic.png",
    darkIcon: "/images/icons/dark/picnic.png",
  },
  category: {
    sizes: { base: "4x3", md: "4x3", lg: "3x2" },
  },
  information: {
    sizes: { base: "4x4", md: "4x2", lg: "3x3" },
  },
  image: {
    sizes: { base: "4x4", md: "4x3", lg: "3x3" },
  },
  findme: {
    sizes: { base: "4x4", md: "4x3", lg: "3x3" },
    name: "Find Me",
    icon: "/images/icons/light/findme.png",
    darkIcon: "/images/icons/dark/findme.png",
  },
  music: {
    sizes: { base: "4x4", md: "4x4", lg: "3x3" },
    name: "Music",
    icon: "/images/icons/light/music.png",
    darkIcon: "/images/icons/dark/music.png",
  },
  podcast: {
    sizes: { base: "4x4", md: "4x4", lg: "3x3" },
    name: "Podcasts",
    icon: "/images/icons/light/podcast.png",
    darkIcon: "/images/icons/dark/podcast.png",
  },
  games: {
    sizes: { base: "4x4", md: "4x4", lg: "3x3" },
    name: "Steam",
    icon: "/images/icons/light/games.png",
    darkIcon: "/images/icons/dark/games.png",
  },
  greenberry: {
    name: "Greenberry",
    icon: "/images/icons/light/greenberry.png",
    darkIcon: "/images/icons/dark/greenberry.png",
  },
} as const;

export type BentoKey = keyof typeof bentos;

/** Tile keys with grid geometry. */
export type BentoSizeKey = Exclude<BentoKey, "greenberry">;

/** Tile keys with icon + display name (`<Bento app>`, toasts). */
export type BentoAppKey = Exclude<
  BentoKey,
  "category" | "information" | "image"
>;
