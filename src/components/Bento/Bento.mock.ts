import type { BentoGridProps, BentoProps } from "./Bento.types.ts";

import { bentoGridConfig, bentos } from "./config.ts";

export const mockBentoProps = {
  sizes: bentos.personal.sizes,
  className: "flex items-center justify-center bg-white p-6",
  children: "Bento",
} satisfies BentoProps;

export const mockBentoGridProps = {
  config: bentoGridConfig,
  children: null,
} satisfies BentoGridProps;
