/** Width is null/missing for some covers (e.g. a custom playlist image). */
export interface SpotifyImage {
  readonly url: string;
  readonly width?: number | null;
}

export interface SpotifyTrack {
  readonly id: string;
  readonly name: string;
  readonly explicit: boolean;
  readonly album: {
    readonly name: string;
    readonly images: readonly SpotifyImage[];
  };
  readonly artists: readonly { readonly name: string }[];
}

export interface SpotifyRecentlyPlayedItem {
  readonly track: SpotifyTrack;
  readonly played_at: string;
}

export interface SpotifyRecentlyPlayed {
  readonly items: readonly SpotifyRecentlyPlayedItem[];
}

export interface SpotifyEpisode {
  readonly id: string;
  readonly name: string;
  readonly images: readonly SpotifyImage[];
  readonly explicit: boolean;
  /** `YYYY`, `YYYY-MM` or `YYYY-MM-DD` — sorts correctly as a string. */
  readonly release_date: string;
}

export interface SpotifyShow {
  readonly id: string;
  readonly name: string;
  /** Newest first; unavailable episodes already dropped. */
  readonly episodes: readonly SpotifyEpisode[];
}

export interface SpotifyPlaylist {
  readonly id: string;
  readonly name: string;
  readonly images: readonly SpotifyImage[];
}

/** Access token handed to the browser's Web Playback SDK. */
export interface SpotifyPlaybackToken {
  readonly token: string;
  /** Seconds until the token actually expires. */
  readonly expiresIn: number;
}
