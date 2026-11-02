import { Fragment, Suspense } from "react";

import type { BentoTile, DividerTile } from "./bento-registry.types.ts";
import type { Metadata } from "next";

import { BentoErrorBoundary, BentoSkeleton } from "@/components/Bento/index.ts";
import { buildPageMetadata, SITE } from "@/lib/seo/index.ts";
import BentoGrid from "@/modules/BentoGrid/index.ts";

import { bentoRegistry } from "./bento-registry.tsx";

export const metadata: Metadata = buildPageMetadata({
  titleAbsolute: SITE.title,
  description:
    "Rik Vermeulen — Creative Developer based in Rotterdam, the Netherlands. Explore Rik’s digital portfolio and the creative digital experiences he has built over the years.",
});

type TileEntry = Exclude<BentoTile, DividerTile>;

interface Section {
  readonly id: string;
  readonly anchorId?: string;
  readonly tiles: TileEntry[];
}

/** Splits the registry at its dividers: each section becomes its own grid. */
function toSections(tiles: readonly BentoTile[]): readonly Section[] {
  const sections: Section[] = [{ id: "about", anchorId: "about", tiles: [] }];

  for (const tile of tiles) {
    if (tile.kind === "divider") {
      sections.push({ id: tile.id, anchorId: tile.anchorId, tiles: [] });
    } else {
      sections.at(-1)?.tiles.push(tile);
    }
  }

  return sections;
}

function renderTile(tile: TileEntry) {
  if (tile.kind === "static") {
    return <Fragment key={tile.id}>{tile.render(tile.sizeKey)}</Fragment>;
  }

  return (
    <Suspense key={tile.id} fallback={<BentoSkeleton sizeKey={tile.sizeKey} />}>
      <BentoErrorBoundary sizeKey={tile.sizeKey}>
        {tile.render()}
      </BentoErrorBoundary>
    </Suspense>
  );
}

/**
 * The dashboard's single composition point. Every tile is declared in
 * `bentoRegistry`; static tiles render immediately, data tiles stream inside a
 * `<Suspense>` boundary guarded by a per-tile error boundary. A section is its
 * own grid, so backfilling a hole never pulls a tile across sections. This
 * component stays synchronous — a top-level `await` here would block the grid.
 */
export default function Home() {
  return toSections(bentoRegistry).map((section) => (
    <BentoGrid key={section.id} id={section.anchorId} className="scroll-mt-24">
      {section.tiles.map(renderTile)}
    </BentoGrid>
  ));
}
