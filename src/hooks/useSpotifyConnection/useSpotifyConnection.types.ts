import type { NowPlayingTrack } from "@/lib/music/types.ts";
import type { SpotifyPlayer } from "@/vendors/spotify/webPlayback.ts";

export interface SpotifyConnection {
  readonly deviceId: string | null;
  readonly isReady: boolean;
  readonly isPaused: boolean;
  readonly currentUri: string | null;
  /** The playlist playing as a whole, when started via `context_uri`. */
  readonly contextUri: string | null;
  readonly nowPlaying: NowPlayingTrack | null;
  readonly error: string | null;
  readonly player: SpotifyPlayer | null;
  readonly getValidToken: () => Promise<string>;
  readonly activate: () => void;
}
