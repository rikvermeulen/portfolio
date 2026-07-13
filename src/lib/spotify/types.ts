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

// Domain type consumed by the Podcast module
export interface PodcastEpisode {
  readonly id: string;
  readonly name: string;
  readonly imageUrl: string | null;
  readonly explicit: boolean;
}

// Domain type consumed by the Music module — agnostic of data source
export interface PlaylistTrack {
  readonly id: string;
  readonly name: string;
  readonly artist: string;
  readonly albumName: string;
  readonly albumArtUrl: string | null;
  readonly explicit: boolean;
}

// Service payloads (wrapped in Result<T> by the service functions)
export interface SpotifyMusicData {
  readonly tracks: readonly PlaylistTrack[];
}

export interface PodcastData {
  readonly episodes: readonly PodcastEpisode[];
}
