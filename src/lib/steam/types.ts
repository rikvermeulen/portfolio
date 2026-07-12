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

// --- Domain type consumed by the Games module ---

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

// --- Service result ---

export interface SteamGamesData {
  readonly games: readonly Game[];
}
