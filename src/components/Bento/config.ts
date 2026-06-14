export type BentoBoxSize = `${number}x${number}`;

export interface ResponsiveBentoSize {
  readonly base: BentoBoxSize;
  readonly md?: BentoBoxSize;
  readonly lg?: BentoBoxSize;
}

export interface ResponsiveGridValue<T> {
  readonly base: T;
  readonly md?: T;
  readonly lg?: T;
}

export interface BentoGridConfig {
  readonly columns: ResponsiveGridValue<number>;
  readonly gap: ResponsiveGridValue<string>;
  readonly rowHeight: ResponsiveGridValue<string>;
}

export const bentoGridConfig: BentoGridConfig = {
  columns: { base: 4, md: 8, lg: 12 },
  gap: { base: "0.75rem", md: "1rem", lg: "1.25rem" },
  // Each value approximates column width before JS runs:
  //   container inner-width = 100vw − 2 × 4.1667% padding = 91.6666vw
  //   col = (91.6666vw − (n−1) × gap) / n
  rowHeight: {
    base: "calc(22.9167vw - 0.5625rem)",
    md: "calc(11.4583vw - 0.875rem)",
    lg: "calc(7.6389vw - 1.14583rem)",
  },
};

export const bentoSizeBreakpoints = {
  md: "48rem", // 768px  (Tailwind md)
  lg: "80rem", // 1280px (Tailwind xl — intentionally skips lg/1024px)
} as const;

export const bentoBoxSizes = {
  personal: { base: "4x4", md: "8x4", lg: "6x4" },
  contact: { base: "4x4", md: "8x4", lg: "6x3" },
  photos: { base: "4x4", md: "4x4", lg: "3x3" },
  plants: { base: "4x4", md: "4x4", lg: "3x3" },
  recipes: { base: "4x4", md: "4x4", lg: "3x3" },
  category: { base: "4x3", md: "4x3", lg: "3x2" },
  information: { base: "4x4", md: "4x2", lg: "3x3" },
  image: { base: "4x4", md: "4x3", lg: "3x3" },
  findMe: { base: "4x4", md: "4x3", lg: "3x3" },
  music: { base: "4x4", md: "4x4", lg: "3x3" },
  podcast: { base: "4x4", md: "4x4", lg: "3x3" },
} as const satisfies Record<string, ResponsiveBentoSize>;
