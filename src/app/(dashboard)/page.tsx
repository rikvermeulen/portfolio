import { Fragment, Suspense } from "react";

import type { Metadata } from "next";

import { BentoErrorBoundary, BentoSkeleton } from "@/components/Bento/index.ts";
import Divider from "@/components/Divider/index.ts";
import { buildPageMetadata, SITE } from "@/lib/seo/index.ts";

import { bentoRegistry } from "./bento-registry.tsx";

export const metadata: Metadata = buildPageMetadata({
  titleAbsolute: SITE.title,
  description:
    "Rik Vermeulen — Creative Developer based in Rotterdam, the Netherlands. Explore Rik’s digital portfolio and the creative digital experiences he has built over the years.",
});

/**
 * The dashboard's single composition point. Every tile is declared in
 * `bentoRegistry`; static tiles render immediately, data tiles stream inside a
 * `<Suspense>` boundary guarded by a per-tile error boundary. This component
 * stays synchronous — a top-level `await` here would block the whole grid.
 */
export default function Home() {
  return (
    <>
      {bentoRegistry.map((tile) => {
        if (tile.kind === "divider") {
          return <Divider key={tile.id} anchorId={tile.anchorId} />;
        }

        if (tile.kind === "static") {
          return <Fragment key={tile.id}>{tile.render(tile.sizeKey)}</Fragment>;
        }

        return (
          <Suspense
            key={tile.id}
            fallback={<BentoSkeleton sizeKey={tile.sizeKey} />}
          >
            <BentoErrorBoundary sizeKey={tile.sizeKey}>
              {tile.render()}
            </BentoErrorBoundary>
          </Suspense>
        );
      })}
    </>
  );
}
