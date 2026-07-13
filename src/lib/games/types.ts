// Provider-agnostic gaming domain types. Shared by every platform provider
// (Steam, Xbox, Discord, …), the aggregation service, and the Games module.
// Providers map their own transport shapes into these; nothing here is tied to
// a single vendor.

/** A gaming platform this dashboard knows about. */
export type PlatformId = "steam" | "xbox" | "discord";

/** A recently-played game, normalised across providers. */
export interface Game {
  readonly id: string;
  readonly name: string;
  readonly coverImage: string;
  readonly coverImageFallback?: string; // tried if coverImage 404s
  readonly portraitImage?: string; // high-res capsule, cropped square for tiles
  readonly href?: string; // where clicking the game goes
  readonly playtimeMinutes?: number;
  readonly lastPlayedUnix?: number; // seconds
  readonly platform?: PlatformId; // which provider it came from (badge)
}

/** The dashboard owner's identity + presence, shown in the profile header. */
export interface PlayerProfile {
  readonly id: string;
  readonly name: string;
  readonly avatar: string;
  readonly href: string;
  readonly online: boolean;
  readonly playing?: string; // game currently being played, if any
}

/** A profile a visitor can add / follow on a platform. */
export interface GamingPlatform {
  readonly id: PlatformId;
  readonly name: string;
  readonly handle: string;
  readonly href: string;
}

/** Everything the Games tile renders. */
export interface GamesData {
  readonly profile: PlayerProfile;
  readonly platforms: readonly GamingPlatform[];
  readonly games: readonly Game[];
}
