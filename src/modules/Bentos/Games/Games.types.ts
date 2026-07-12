import type { Game } from "@/lib/steam/types.ts";

export type { Game };

export interface GamesProps {
  readonly games: readonly Game[];
}
