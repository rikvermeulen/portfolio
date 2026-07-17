export interface Section {
  /** DOM anchor id the chip scrolls to (matches an element `id` in the grid). */
  readonly id: string;
  readonly label: string;
}

export type NavigationProps = Record<string, never>;
