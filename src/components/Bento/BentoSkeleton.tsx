import type { BentoBoxSizeKey } from "./config.ts";

import { SkeletonCard } from "@/components/Cards/index.ts";

import Bento from "./Bento.tsx";
import { bentoBoxSizes } from "./config.ts";

interface BentoSkeletonProps {
  readonly size: BentoBoxSizeKey;
}

/**
 * Shared loading placeholder for a bento tile. Renders the tile shell at the
 * registered geometry for `size` with a full-bleed skeleton, so every data
 * tile's `<Suspense fallback>` collapses to a single call.
 */
const BentoSkeleton = ({ size }: BentoSkeletonProps) => (
  <Bento sizes={bentoBoxSizes[size]} className="size-full">
    <SkeletonCard className="size-full rounded-none" />
  </Bento>
);

export default BentoSkeleton;
