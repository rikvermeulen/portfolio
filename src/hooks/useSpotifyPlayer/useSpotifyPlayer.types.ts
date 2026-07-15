/** Minimal shape the player needs from any playable item. */
export interface SpotifyPlayable {
  readonly id: string;
}

/** Which Spotify content kind the player drives. */
export type SpotifyPlayerKind = "track" | "episode";

export interface UseSpotifyPlayerReturn {
  readonly isPlaying: boolean;
  readonly isReady: boolean;
  readonly currentIndex: number;
  readonly volume: number;
  readonly error: string | null;
  readonly togglePlay: () => void;
  readonly goToNext: () => void;
  readonly goToPrevious: () => void;
  readonly setVolume: (value: number) => void;
}
