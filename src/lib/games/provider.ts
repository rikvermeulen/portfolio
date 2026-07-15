import type {
  Game,
  GamingPlatform,
  PlatformId,
  PlayerProfile,
} from "./types.ts";

/**
 * A gaming platform integration, contributing whatever it has to the Games
 * tile. Every capability beyond the "add me" link is optional, so a provider
 * declares only what it supports:
 *
 * - Steam offers a header profile + games + link.
 * - Xbox offers games + link.
 *
 * Providers are best-effort: the aggregation service ({@link getGamesResult})
 * swallows a rejected promise from any method and treats it as "nothing to
 * contribute", so one failing platform can never break the tile.
 */
export interface GameProvider {
  readonly id: PlatformId;
  /** The owner's identity + presence for the header. Only a primary provider has one. */
  readonly getProfile?: () => Promise<PlayerProfile | null>;
  /** Recently-played titles, each tagged with this provider's platform id. */
  readonly getGames?: () => Promise<readonly Game[]>;
  /** The "add me" link for this platform, or null when it isn't configured. */
  readonly getPlatformLink: () => Promise<GamingPlatform | null>;
}
