import type { ResponsiveBentoSize } from "./Bento.types.ts";

import classnames from "@/utils/classnames/classnames.ts";

import Bento from "./Bento.tsx";

interface BentoEmptyStateProps {
  readonly sizes?: ResponsiveBentoSize;
  /** Muted message to show — typically `errorMessage ?? "No X…"`. */
  readonly message: string;
  /** Extra classes merged onto the tile (e.g. a bespoke background). */
  readonly className?: string;
}

/**
 * Shared empty/error fallback tile: a centered muted message on a dark card.
 * Replaces the identical `<Bento><p>{errorMessage ?? "…"}</p></Bento>` block
 * that data bentos hand-wrote for their no-data / failed-load state.
 */
const BentoEmptyState = ({
  sizes,
  message,
  className,
}: BentoEmptyStateProps) => (
  <Bento
    sizes={sizes}
    className={classnames(
      "flex size-full items-center justify-center bg-neutral-900 p-5",
      className,
    )}
  >
    <p className="text-xs text-white/50">{message}</p>
  </Bento>
);

export default BentoEmptyState;
