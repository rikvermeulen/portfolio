// Domain types consumed by the Music and Podcast modules — agnostic of the
// data source (currently Spotify).

/** A recently-played track shaped for the Music module. */
export interface PlaylistTrack {
  readonly id: string;
  readonly name: string;
  readonly artist: string;
  readonly albumName: string;
  readonly albumArtUrl: string | null;
  readonly explicit: boolean;
}

/** A show episode shaped for the Podcast module. */
export interface PodcastEpisode {
  readonly id: string;
  readonly name: string;
  readonly imageUrl: string | null;
  readonly explicit: boolean;
}

export interface SpotifyMusicData {
  readonly tracks: readonly PlaylistTrack[];
}

export interface PodcastData {
  readonly episodes: readonly PodcastEpisode[];
}
