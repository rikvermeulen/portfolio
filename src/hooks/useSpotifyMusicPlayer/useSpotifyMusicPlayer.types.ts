export interface MusicTrack {
  readonly id: string;
}

export interface UseSpotifyMusicPlayerReturn {
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
