import { Fragment, Suspense } from "react";

import type { Metadata } from "next";

import { BentoErrorBoundary, BentoSkeleton } from "@/components/Bento/index.ts";

import { bentoRegistry } from "./bento-registry.tsx";

export const metadata: Metadata = {
  title: "Home - Rik Vermeulen Portfolio",
  description:
    "Rik Vermeulen - Creative Developer based in Rotterdam, the Netherlands. Explore Rik’s digital portfolio and the creative experiences he has developed through the years.",
};

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
          return (
            <div
              key={tile.id}
              aria-hidden
              className="bentogrid-section-break"
            />
          );
        }

        if (tile.kind === "static") {
          return <Fragment key={tile.id}>{tile.render()}</Fragment>;
        }

        return (
          <Suspense
            key={tile.id}
            fallback={<BentoSkeleton size={tile.sizeKey} />}
          >
            <BentoErrorBoundary size={tile.sizeKey}>
              {tile.render()}
            </BentoErrorBoundary>
          </Suspense>
        );
      })}
    </>
  );
}
