/**
 * Tile catalog — the static definition of each bento tile: grid sizes plus
 * optional app identity (icon + display name for `<Bento app>` and toasts).
 * Layout-only tiles omit name/icon; referenced apps like Greenberry omit sizes.
 *
 * This is the *catalog* (what each tile is). Tile order and data-fetch wiring
 * live in the registry at `src/app/(dashboard)/bento-registry.tsx`.
 */
export const bentos = {
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
