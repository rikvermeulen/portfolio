import type { BentoGridConfig, ResponsiveBentoSize } from "./Bento.types.ts";

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

export const bentoBoxSizes = {
  personal: { base: "4x4", md: "8x4", lg: "6x4" },
  contact: { base: "4x4", md: "8x4", lg: "6x3" },
  journal: { base: "4x4", md: "8x4", lg: "6x3" },
  photos: { base: "4x4", md: "4x4", lg: "3x3" },
  plants: { base: "4x4", md: "4x4", lg: "3x3" },
  recipes: { base: "4x4", md: "4x4", lg: "3x3" },
  category: { base: "4x3", md: "4x3", lg: "3x2" },
  information: { base: "4x4", md: "4x2", lg: "3x3" },
  image: { base: "4x4", md: "4x3", lg: "3x3" },
  findMe: { base: "4x4", md: "4x3", lg: "3x3" },
  music: { base: "4x4", md: "4x4", lg: "3x3" },
  podcast: { base: "4x4", md: "4x4", lg: "3x3" },
  games: { base: "4x4", md: "4x4", lg: "3x3" },
} as const satisfies Record<string, ResponsiveBentoSize>;

/** Keys of the canonical tile-size table — the single source of truth for sizing. */
export type BentoBoxSizeKey = keyof typeof bentoBoxSizes;

/**
 * App identity per bento — the single source of truth tying a tile to its
 * icon and display name. Tiles reference an app by key (`<Bento app="journal">`)
 * and toasts look icons up here, so a notification shows the exact same icon as
 * its bento.
 *
 * List the light `icon` for every app. Add `darkIcon` when a dark-mode twin
 * exists; without it the light icon is used in both themes.
 */
export const bentoApps = {
  personal: { name: "Rik Vermeulen", icon: "/images/me.jpg" },
  contact: {
    name: "Messages",
    icon: "/images/icons/light/messages.png",
    darkIcon: "/images/icons/dark/messages.png",
  },
  journal: {
    name: "Journal",
    icon: "/images/icons/light/journal.png",
    darkIcon: "/images/icons/dark/journal.png",
  },
  music: {
    name: "Music",
    icon: "/images/icons/light/music.png",
    darkIcon: "/images/icons/dark/music.png",
  },
  podcast: {
    name: "Podcasts",
    icon: "/images/icons/light/podcast.png",
    darkIcon: "/images/icons/dark/podcast.png",
  },
  photos: {
    name: "Photos",
    icon: "/images/icons/light/photos.png",
    darkIcon: "/images/icons/dark/photos.png",
  },
  plants: {
    name: "Planta",
    icon: "/images/icons/light/planta.png",
    darkIcon: "/images/icons/dark/planta.png",
  },
  recipes: {
    name: "Picnic",
    icon: "/images/icons/light/picnic.png",
    darkIcon: "/images/icons/dark/picnic.png",
  },
  games: {
    name: "Steam",
    icon: "/images/icons/light/games.png",
    darkIcon: "/images/icons/dark/games.png",
  },
  findme: {
    name: "Find Me",
    icon: "/images/icons/light/findme.png",
    darkIcon: "/images/icons/dark/findme.png",
  },
  greenberry: {
    name: "Greenberry",
    icon: "/images/icons/light/greenberry.png",
    darkIcon: "/images/icons/dark/greenberry.png",
  },
} as const satisfies Record<
  string,
  { name: string; icon: string; darkIcon?: string }
>;

/** Keys of the app-identity table — one per notifiable bento. */
export type BentoAppKey = keyof typeof bentoApps;
