import type { Game } from "@/lib/steam/types.ts";
import type { WithErrorMessage } from "@/types/index.ts";

export type { Game };

export interface GamesProps extends WithErrorMessage {
  /** Games ordered so that the first entry is the featured / last-played game. */
  readonly games: readonly Game[];
}
