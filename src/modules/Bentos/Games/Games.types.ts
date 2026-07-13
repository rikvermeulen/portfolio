import type { BentoSizedProps } from "@/components/Bento/index.ts";
import type { Game, GamingPlatform, PlayerProfile } from "@/lib/games/types.ts";

export type { Game, GamingPlatform, PlayerProfile };

export interface GamesProps extends BentoSizedProps {
  readonly profile: PlayerProfile;
  readonly platforms: readonly GamingPlatform[];
  readonly games: readonly Game[];
}

export interface GameTileProps {
  readonly game: Game;
  readonly sizeClassName: string;
}
