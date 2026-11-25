import type { ContributionKind } from "./kinds.ts";

export interface ContributionShare {
  readonly kind: ContributionKind;
  readonly count: number;
}

export interface ContributionBreakdown {
  readonly total: number;
  /** Every kind in display order, including empty ones. */
  readonly shares: readonly ContributionShare[];
}
