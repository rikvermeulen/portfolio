import type { BentoSizedProps } from "@/components/Bento/index.ts";
import type { Game } from "@/lib/steam/types.ts";

export type { Game };

export interface GamesProps extends BentoSizedProps {
  readonly games: readonly Game[];
}
