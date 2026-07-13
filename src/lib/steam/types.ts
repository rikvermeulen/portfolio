// Steam Web API transport shapes (untrusted until validated). The domain types
// these map into (Game, PlayerProfile, …) live in `@/lib/games/types`.

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
  readonly personastate?: number; // 0 = offline; any other value = online-ish
  readonly gameextrainfo?: string; // name of the game currently being played
}

export interface SteamPlayerSummariesResponse {
  readonly response: {
    readonly players?: readonly SteamPlayerSummary[];
  };
}
