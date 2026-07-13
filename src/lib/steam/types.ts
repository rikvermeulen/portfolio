// --- Steam Web API transport shapes (untrusted until validated) ---

export interface SteamOwnedGame {
  readonly appid: number;
  readonly name: string;
  readonly playtime_forever: number;
  readonly rtime_last_played?: number;
  readonly img_icon_url?: string;
}

export interface SteamOwnedGamesResponse {
  readonly response: {
    readonly game_count?: number;
    readonly games?: readonly SteamOwnedGame[];
  };
}

/** A player profile from ISteamUser/GetPlayerSummaries. */
export interface SteamPlayerSummary {
  readonly steamid: string;
  readonly personaname: string;
  readonly profileurl: string;
  readonly avatar?: string;
  readonly avatarmedium?: string;
  readonly avatarfull?: string;
}

export interface SteamPlayerSummariesResponse {
  readonly response: {
    readonly players?: readonly SteamPlayerSummary[];
  };
}

// --- Domain types consumed by the Games module ---

export interface Game {
  readonly id: string;
  readonly name: string;
  readonly coverImage: string;
  readonly coverImageFallback?: string; // tried if coverImage 404s (Steam header art)
  readonly portraitImage?: string; // high-res library capsule, cropped square for tiles
  readonly href?: string; // store page
  readonly playtimeMinutes?: number;
  readonly lastPlayedUnix?: number; // seconds; from rtime_last_played
}

/** The dashboard owner's Steam identity, used for the profile header. */
export interface SteamProfile {
  readonly id: string;
  readonly name: string;
  readonly avatar: string;
  readonly href: string;
}

/** A gaming profile a visitor can add / follow. */
export type PlatformId = "steam" | "xbox" | "discord";

export interface GamingPlatform {
  readonly id: PlatformId;
  readonly name: string;
  readonly handle: string;
  readonly href: string;
}

// --- Service result ---

export interface SteamProfileData {
  readonly profile: SteamProfile;
  readonly platforms: readonly GamingPlatform[];
  readonly games: readonly Game[];
}
