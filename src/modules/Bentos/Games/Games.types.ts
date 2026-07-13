import type { BentoSizedProps } from "@/components/Bento/index.ts";
import type { Game, GamingPlatform, SteamProfile } from "@/lib/steam/types.ts";

export type { Game, GamingPlatform, SteamProfile };

export interface GamesProps extends BentoSizedProps {
  readonly profile: SteamProfile;
  readonly platforms: readonly GamingPlatform[];
  readonly games: readonly Game[];
}

export interface GameTileProps {
  readonly game: Game;
  readonly sizeClassName: string;
  readonly sizes: string;
}
