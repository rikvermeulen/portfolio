export interface SpotifyTrack {
  readonly id: string;
  readonly name: string;
  readonly explicit: boolean;
  readonly album: {
    readonly name: string;
    readonly images: readonly { readonly url: string }[];
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
  readonly images: readonly { readonly url: string }[];
  readonly explicit: boolean;
}

export interface SpotifyShowEpisodes {
  readonly items: readonly SpotifyEpisode[];
}

/** Access token handed to the browser's Web Playback SDK. */
export interface SpotifyPlaybackToken {
  readonly token: string;
  /** Seconds until the token actually expires. */
  readonly expiresIn: number;
}
