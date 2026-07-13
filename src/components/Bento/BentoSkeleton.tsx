import type { BentoSkeletonProps } from "./Bento.types.ts";

import { SkeletonCard } from "@/components/Cards/index.ts";

import Bento from "./Bento.tsx";
import { bentos } from "./config.ts";

/**
 * Shared loading placeholder for a bento tile. Renders the tile shell at the
 * registered geometry for `sizeKey` with a full-bleed skeleton, so every data
 * tile's `<Suspense fallback>` collapses to a single call.
 */
const BentoSkeleton = ({ sizeKey }: BentoSkeletonProps) => (
  <Bento sizes={bentos[sizeKey].sizes} className="size-full">
    <SkeletonCard className="size-full rounded-none" />
  </Bento>
);

export default BentoSkeleton;
