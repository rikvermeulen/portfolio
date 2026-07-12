export interface PodcastEpisodeItem {
  readonly id: string;
}

export interface UseSpotifyPodcastPlayerReturn {
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
