import type { BentoEmptyStateProps } from "./Bento.types.ts";

import classnames from "@/utils/classnames/classnames.ts";

import Bento from "./Bento.tsx";
import { bentos } from "./config.ts";

/**
 * Shared empty/error fallback tile: a centered muted message on a dark card.
 * Replaces the identical `<Bento><p>{errorMessage ?? "…"}</p></Bento>` block
 * that data bentos hand-wrote for their no-data / failed-load state.
 */
const BentoEmptyState = ({
  sizeKey,
  message,
  className,
}: BentoEmptyStateProps) => (
  <Bento
    sizes={bentos[sizeKey].sizes}
    className={classnames(
      "flex size-full items-center justify-center bg-neutral-900 p-5",
      className,
    )}
  >
    <p className="text-xs text-white/50">{message}</p>
  </Bento>
);

export default BentoEmptyState;
