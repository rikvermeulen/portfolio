export interface SpotifyTrack {
  readonly id: string;
  readonly preview_url: string | null;
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
  readonly audio_preview_url: string | null;
  readonly images: readonly { readonly url: string }[];
  readonly explicit: boolean;
  readonly description: string;
  readonly duration_ms: number;
}

export interface SpotifyShowEpisodes {
  readonly items: readonly SpotifyEpisode[];
}

// Domain type consumed by the Podcast module
export interface PodcastEpisode {
  readonly id: string;
  readonly name: string;
  readonly previewUrl: string | null;
  readonly imageUrl: string | null;
  readonly explicit: boolean;
}

export interface SpotifyPlaylistItem {
  readonly track: SpotifyTrack | null; // null for local Spotify files
}

export interface SpotifyPlaylistTracks {
  readonly items: readonly SpotifyPlaylistItem[];
}

// Domain type consumed by the Music module — agnostic of data source
export interface PlaylistTrack {
  readonly id: string;
  readonly name: string;
  readonly artist: string;
  readonly albumName: string;
  readonly albumArtUrl: string | null;
  readonly previewUrl: string | null;
  readonly explicit: boolean;
}
