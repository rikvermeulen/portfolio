import type { Game } from "@/lib/steam/types.ts";

export type { Game };

export interface GamesProps {
  /** Games ordered so that the first entry is the featured / last-played game. */
  readonly games: readonly Game[];
  readonly errorMessage?: string;
}
