/**
 * Bento registry — the single source of truth for tile *order* and *data-fetch
 * wiring*. Each entry declares how a tile is rendered (static vs. async) and,
 * for async tiles, which service supplies its data. The static tile *content*
 * (copy, links, colors, tags) lives in `bento-registry.const.ts`; the per-tile
 * grid sizes + app identity come from the tile catalog in
 * `@/components/Bento/Bento.const.ts` (re-exported as `bentos`).
 */
import type {
  AsyncTile,
  AsyncTileConfig,
  BentoTile,
  DividerTile,
  StaticTile,
} from "./bento-registry.types.ts";
import type { BentoSizeKey } from "@/components/Bento/index.ts";

import { AsyncBento, BentoEmptyState } from "@/components/Bento/index.ts";
import { getGamesResult } from "@/lib/games/index.ts";
import {
  Category,
  Contact,
  FindMe,
  Games,
  Image,
  Information,
  Journal,
  Music,
  Photos,
  Plants,
  Podcast,
  Recipes,
  WeatherBadge,
} from "@/modules/Bentos/index.ts";
import { getPicnicRecipesResult } from "@/vendors/picnic/service.ts";
import { getPlantaPlantsResult } from "@/vendors/planta/service.ts";
import { getSpotifyPodcastResult } from "@/vendors/spotify/podcastService.ts";
import { getSpotifyMusicResult } from "@/vendors/spotify/service.ts";
import { getPhotosResult } from "@/vendors/supabase/service.ts";

import {
  categoryContent,
  imageContent,
  informationContent,
} from "./bento-registry.const.ts";

/** Binds a data tile's `T` at definition, erasing it from the registry type. */
function asyncTile<T>(config: AsyncTileConfig<T>): AsyncTile {
  return {
    kind: "async",
    id: config.id,
    sizeKey: config.sizeKey,
    render: () => (
      <AsyncBento
        load={config.load}
        render={(data) => config.render(data, config.sizeKey)}
        renderError={(errorMessage) => (
          <BentoEmptyState message={errorMessage} sizeKey={config.sizeKey} />
        )}
      />
    ),
  };
}

/** A static tile: `render` receives the `sizeKey` declared alongside it. */
function staticTile(
  id: string,
  sizeKey: BentoSizeKey,
  render: (sizeKey: BentoSizeKey) => React.ReactNode,
): StaticTile {
  return { kind: "static", id, sizeKey, render };
}

/** A full-width section spacer; `anchorId` lets Navigation scroll to it. */
function divider(id: string, anchorId?: string): DividerTile {
  return { kind: "divider", id, anchorId };
}

/**
 * Single source of truth for the dashboard grid. Order === visual order (the
 * grid uses `grid-auto-flow: row`, so DOM order is placement). Reordering this
 * array reflows the grid.
 */
export const bentoRegistry: readonly BentoTile[] = [
  staticTile("category-about", "category", (sizeKey) => (
    <Category sizeKey={sizeKey} {...categoryContent.about} />
  )),

  asyncTile({
    id: "photos",
    sizeKey: "photos",
    load: getPhotosResult,
    render: (albums, sizeKey) => <Photos albums={albums} sizeKey={sizeKey} />,
  }),

  asyncTile({
    id: "plants",
    sizeKey: "plants",
    load: getPlantaPlantsResult,
    render: (data, sizeKey) => (
      <Plants plants={data.plantCards} sizeKey={sizeKey} />
    ),
  }),

  asyncTile({
    id: "music",
    sizeKey: "music",
    load: getSpotifyMusicResult,
    render: (data, sizeKey) => <Music sizeKey={sizeKey} tracks={data.tracks} />,
  }),

  asyncTile({
    id: "podcast",
    sizeKey: "podcast",
    load: getSpotifyPodcastResult,
    render: (data, sizeKey) => (
      <Podcast episodes={data.episodes} sizeKey={sizeKey} />
    ),
  }),

  staticTile("contact", "contact", (sizeKey) => <Contact sizeKey={sizeKey} />),

  asyncTile({
    id: "recipes",
    sizeKey: "recipes",
    load: getPicnicRecipesResult,
    render: (data, sizeKey) => (
      <Recipes recipes={data.recipeCards} sizeKey={sizeKey} />
    ),
  }),

  asyncTile({
    id: "games",
    sizeKey: "games",
    load: getGamesResult,
    render: (data, sizeKey) => (
      <Games
        games={data.games}
        platforms={data.platforms}
        profile={data.profile}
        sizeKey={sizeKey}
      />
    ),
  }),

  staticTile("journal", "journal", (sizeKey) => <Journal sizeKey={sizeKey} />),

  staticTile("findme", "findme", (sizeKey) => (
    <FindMe sizeKey={sizeKey} weatherBadge={<WeatherBadge />} />
  )),

  divider("section-break", "work"),

  staticTile("category-work", "category", (sizeKey) => (
    <Category sizeKey={sizeKey} {...categoryContent.work} />
  )),

  staticTile("information", "information", (sizeKey) => (
    <Information sizeKey={sizeKey} {...informationContent.work} />
  )),

  staticTile("image", "image", (sizeKey) => (
    <Image sizeKey={sizeKey} {...imageContent.work} />
  )),

  divider("section-break-education", "education"),

  staticTile("category-education", "category", (sizeKey) => (
    <Category sizeKey={sizeKey} {...categoryContent.education} />
  )),

  staticTile("image-education", "image", (sizeKey) => (
    <Image sizeKey={sizeKey} {...imageContent.education} />
  )),

  staticTile("information-education", "information", (sizeKey) => (
    <Information sizeKey={sizeKey} {...informationContent.education} />
  )),
];
