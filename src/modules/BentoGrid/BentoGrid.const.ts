import type { BentoGridConfig } from "./BentoGrid.types.ts";

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
