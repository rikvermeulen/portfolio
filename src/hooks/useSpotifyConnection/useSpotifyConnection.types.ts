import type { SpotifyPlayer } from "@/vendors/spotify/webPlayback.ts";

export interface SpotifyConnection {
  readonly deviceId: string | null;
  readonly isReady: boolean;
  readonly isPaused: boolean;
  readonly currentUri: string | null;
  readonly error: string | null;
  readonly player: SpotifyPlayer | null;
  readonly getValidToken: () => Promise<string>;
  readonly activate: () => void;
}
