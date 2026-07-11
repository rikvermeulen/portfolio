import type { BentoBoxSizeKey } from "@/components/Bento/index.ts";
import type { Result } from "@/types/index.ts";

import { AsyncBento } from "@/components/Bento/index.ts";
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
  readonly render: () => React.ReactNode;
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
  readonly sizeKey: BentoBoxSizeKey;
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
  readonly sizeKey: BentoBoxSizeKey;
  readonly load: () => Promise<Result<T>>;
  readonly render: (data: T) => React.ReactNode;
  readonly renderError: (errorMessage: string) => React.ReactNode;
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
        render={config.render}
        renderError={config.renderError}
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
  { kind: "static", id: "personal", render: () => <Personal /> },

  asyncTile({
    id: "photos",
    sizeKey: "photos",
    load: getPhotosResult,
    render: (albums) => <Photos albums={albums} />,
    renderError: (errorMessage) => (
      <Photos albums={{}} errorMessage={errorMessage} />
    ),
  }),

  asyncTile({
    id: "plants",
    sizeKey: "plants",
    load: getPlantaPlantsResult,
    render: (data) => <Plants plants={data.plantCards} />,
    renderError: (errorMessage) => (
      <Plants errorMessage={errorMessage} plants={[]} />
    ),
  }),

  asyncTile({
    id: "music",
    sizeKey: "music",
    load: getSpotifyMusicResult,
    render: (data) => <Music tracks={data.tracks} />,
    renderError: (errorMessage) => (
      <Music errorMessage={errorMessage} tracks={[]} />
    ),
  }),

  asyncTile({
    id: "podcast",
    sizeKey: "podcast",
    load: getSpotifyPodcastResult,
    render: (data) => <Podcast episodes={data.episodes} />,
    renderError: (errorMessage) => (
      <Podcast episodes={[]} errorMessage={errorMessage} />
    ),
  }),

  { kind: "static", id: "contact", render: () => <Contact /> },

  asyncTile({
    id: "recipes",
    sizeKey: "recipes",
    load: getPicnicRecipesResult,
    render: (data) => <Recipes recipes={data.recipeCards} />,
    renderError: (errorMessage) => (
      <Recipes errorMessage={errorMessage} recipes={[]} />
    ),
  }),

  asyncTile({
    id: "games",
    sizeKey: "games",
    load: getSteamGamesResult,
    render: (data) => <Games games={data.games} />,
    renderError: (errorMessage) => (
      <Games errorMessage={errorMessage} games={[]} />
    ),
  }),

  {
    kind: "static",
    id: "category-about",
    render: () => (
      <Category tags={[{ label: "About me", variant: "yellow" }]} />
    ),
  },

  { kind: "static", id: "findme", render: () => <FindMe /> },

  { kind: "divider", id: "section-break" },

  {
    kind: "static",
    id: "category-work",
    render: () => (
      <Category
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
    render: () => (
      <Information
        description="Building polished digital experiences together with a talented team."
        href="https://greenberry.nl"
        iconPosition="top-right"
        iconSrc="/images/icons/greenberry.png"
        linkLabel="Current role"
        title="Medior Front-end engineer at Greenberry"
        className="bg-ds-violet text-white"
      />
    ),
  },

  {
    kind: "static",
    id: "image",
    render: () => (
      <Image
        alt="Portrait of Rik Vermeulen"
        caption="Team moments and product thinking."
        src="/images/me.jpg"
        className="bg-ds-mint text-ds-mint-ink"
      />
    ),
  },
];
