import type { NowPlayingTrack } from "@/lib/music/types.ts";

/** Minimal shape the player needs from any playable item. */
export interface SpotifyPlayable {
  readonly id: string;
}

/** Which Spotify content kind the player drives. */
export type SpotifyPlayerKind = "track" | "episode" | "playlist";

export interface UseSpotifyPlayerReturn {
  readonly isPlaying: boolean;
  readonly isReady: boolean;
  readonly currentIndex: number;
  /** The SDK's current track while a `"playlist"` plays; `null` otherwise. */
  readonly nowPlaying: NowPlayingTrack | null;
  readonly volume: number;
  readonly error: string | null;
  readonly togglePlay: () => void;
  readonly goToNext: () => void;
  readonly goToPrevious: () => void;
  readonly setVolume: (value: number) => void;
}
