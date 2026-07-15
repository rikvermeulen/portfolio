/**
 * Bento registry — the single source of truth for tile *order* and *data-fetch
 * wiring*. Each entry declares how a tile is rendered (static vs. async) and,
 * for async tiles, which service supplies its data. The static per-tile
 * definitions (grid sizes + app identity) come from the tile catalog in
 * `@/components/Bento/Bento.const.ts` (re-exported as `bentos`).
 */
import type {
  AsyncTile,
  AsyncTileConfig,
  BentoTile,
} from "./bento-registry.types.ts";

import {
  AsyncBento,
  BentoEmptyState,
  bentos,
} from "@/components/Bento/index.ts";
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

/**
 * Single source of truth for the dashboard grid. Order === visual order (the
 * grid uses `grid-auto-flow: row`, so DOM order is placement). Reordering this
 * array reflows the grid.
 */
export const bentoRegistry: readonly BentoTile[] = [
  {
    kind: "static",
    id: "category-about",
    sizeKey: "category",
    render: (sizeKey) => (
      <Category
        sizeKey={sizeKey}
        tags={[{ label: "About me", variant: "yellow" }]}
      />
    ),
  },

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

  {
    kind: "static",
    id: "contact",
    sizeKey: "contact",
    render: (sizeKey) => <Contact sizeKey={sizeKey} />,
  },

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

  {
    kind: "static",
    id: "journal",
    sizeKey: "journal",
    render: (sizeKey) => <Journal sizeKey={sizeKey} />,
  },

  {
    kind: "static",
    id: "findme",
    sizeKey: "findme",
    render: (sizeKey) => (
      <FindMe sizeKey={sizeKey} weatherBadge={<WeatherBadge />} />
    ),
  },

  { kind: "divider", id: "section-break", anchorId: "work" },

  {
    kind: "static",
    id: "category-work",
    sizeKey: "category",
    render: (sizeKey) => (
      <Category
        sizeKey={sizeKey}
        tags={[
          { label: "Work", variant: "green" },
          { label: "2023 - current", variant: "blue" },
        ]}
      />
    ),
  },

  {
    kind: "static",
    id: "information",
    sizeKey: "information",
    render: (sizeKey) => (
      <Information
        description="Building polished digital experiences together with a talented team."
        href="https://greenberry.nl"
        iconPosition="top-right"
        iconSrc={bentos.greenberry.icon}
        linkLabel="Current role"
        sizeKey={sizeKey}
        title="Medior Front-end engineer at Greenberry"
        className="bg-ds-violet text-white"
      />
    ),
  },

  {
    kind: "static",
    id: "image",
    sizeKey: "image",
    render: (sizeKey) => (
      <Image
        alt="Portrait of Rik Vermeulen"
        caption="Team moments and product thinking."
        sizeKey={sizeKey}
        src="/images/me.jpg"
        className="bg-ds-mint text-ds-mint-ink"
      />
    ),
  },
];
