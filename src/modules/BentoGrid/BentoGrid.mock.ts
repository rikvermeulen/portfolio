import type { BentoGridProps } from "./BentoGrid.types.ts";

import { bentoGridConfig } from "./BentoGrid.const.ts";

export const mockBentoGridProps = {
  config: bentoGridConfig,
  children: null,
} satisfies BentoGridProps;
