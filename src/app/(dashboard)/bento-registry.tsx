import type { BentoSizeKey } from "@/components/Bento/index.ts";
import type { Result } from "@/types/index.ts";

import {
  AsyncBento,
  BentoEmptyState,
  bentos,
} from "@/components/Bento/index.ts";
import { getPicnicRecipesResult } from "@/lib/picnic/service.ts";
import { getPlantaPlantsResult } from "@/lib/planta/service.ts";
import { getSpotifyPodcastResult } from "@/lib/spotify/podcast-service.ts";
import { getSpotifyMusicResult } from "@/lib/spotify/service.ts";
import { getSteamGamesResult } from "@/lib/steam/service.ts";
import { getPhotosResult } from "@/lib/supabase/photos.ts";
import {
  Category,
  Contact,
  FindMe,
  Games,
  Image,
  Information,
  Journal,
  Music,
  Personal,
  Photos,
  Plants,
  Podcast,
  Recipes,
} from "@/modules/Bentos/index.ts";

/**
 * A tile rendered immediately with no data fetch (static content or a
 * self-fetching client tile like FindMe).
 */
interface StaticTile {
  readonly kind: "static";
  readonly id: string;
  readonly sizeKey: BentoSizeKey;
  readonly render: (sizeKey: BentoSizeKey) => React.ReactNode;
}

/**
 * A data-driven tile. `render()` produces its `<AsyncBento>` element with the
 * data type bound here at definition; `sizeKey` drives the Suspense skeleton
 * and error fallback. The generic `T` is fully checked at the definition site
 * and then erased, so the registry array stays a plain, non-generic list.
 */
interface AsyncTile {
  readonly kind: "async";
  readonly id: string;
  readonly sizeKey: BentoSizeKey;
  readonly render: () => React.ReactNode;
}

/** The full-width spacer between the "About me" and "Work" sections. */
interface DividerTile {
  readonly kind: "divider";
  readonly id: string;
}

export type BentoTile = StaticTile | AsyncTile | DividerTile;

interface AsyncTileConfig<T> {
  readonly id: string;
  readonly sizeKey: BentoSizeKey;
  readonly load: () => Promise<Result<T>>;
  readonly render: (data: T, sizeKey: BentoSizeKey) => React.ReactNode;
}

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
    id: "personal",
    sizeKey: "personal",
    render: (sizeKey) => <Personal sizeKey={sizeKey} />,
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
    load: getSteamGamesResult,
    render: (data, sizeKey) => <Games games={data.games} sizeKey={sizeKey} />,
  }),

  {
    kind: "static",
    id: "journal",
    sizeKey: "journal",
    render: (sizeKey) => <Journal sizeKey={sizeKey} />,
  },

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

  {
    kind: "static",
    id: "findme",
    sizeKey: "findme",
    render: (sizeKey) => <FindMe sizeKey={sizeKey} />,
  },

  { kind: "divider", id: "section-break" },

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
