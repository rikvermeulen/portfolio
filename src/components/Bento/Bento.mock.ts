import type { BentoProps } from "./Bento.types.ts";

import { bentos } from "./Bento.const.ts";

export const mockBentoProps = {
  sizes: bentos.contact.sizes,
  className: "flex items-center justify-center bg-white p-6",
  children: "Bento",
} satisfies BentoProps;
