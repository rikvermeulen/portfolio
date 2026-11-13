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
  readonly showName: string;
  readonly imageUrl: string | null;
  readonly explicit: boolean;
}

/** The track the browser player reports as playing (e.g. inside a playlist). */
export interface NowPlayingTrack {
  readonly uri: string;
  readonly name: string;
  readonly artist: string;
  readonly albumName: string;
  readonly imageUrl: string | null;
}

/** A playlist played as a whole (its track list isn't readable for other owners). */
export interface MusicPlaylist {
  readonly id: string;
  readonly name: string;
  readonly imageUrl: string | null;
}

/** What the Music tile plays: recently played tracks, or one playlist. */
export type SpotifyMusicData =
  | { readonly kind: "tracks"; readonly tracks: readonly PlaylistTrack[] }
  | { readonly kind: "playlist"; readonly playlist: MusicPlaylist };

export interface PodcastData {
  readonly episodes: readonly PodcastEpisode[];
}
