import type { BentoSizeKey } from "@/components/Bento/index.ts";
import type { Result } from "@/types/index.ts";

/**
 * A tile rendered immediately with no blocking data fetch — static content, or
 * an interactive client tile like FindMe whose server-fetched parts stream in
 * via their own `<Suspense>` boundary (see `weatherBadge`).
 */
export interface StaticTile {
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
export interface AsyncTile {
  readonly kind: "async";
  readonly id: string;
  readonly sizeKey: BentoSizeKey;
  readonly render: () => React.ReactNode;
}

/** Starts a new section (its own grid) in the registry list. */
export interface DividerTile {
  readonly kind: "divider";
  readonly id: string;
  /** DOM `id` on the section grid so Navigation can scroll to it. */
  readonly anchorId?: string;
}

export type BentoTile = StaticTile | AsyncTile | DividerTile;

export interface AsyncTileConfig<T> {
  readonly id: string;
  readonly sizeKey: BentoSizeKey;
  readonly load: () => Promise<Result<T>>;
  readonly render: (data: T, sizeKey: BentoSizeKey) => React.ReactNode;
}
