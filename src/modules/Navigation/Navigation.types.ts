import type { TagVariant } from "@/components/Tag/index.ts";

export interface Section {
  /** DOM anchor id the chip scrolls to (matches an element `id` in the grid). */
  readonly id: string;
  readonly label: string;
  readonly variant?: TagVariant;
}

export type NavigationProps = Record<string, never>;
