import type { PlaylistTrack } from "@/lib/spotify/types.ts";
import type { WithErrorMessage } from "@/types/index.ts";

export type { PlaylistTrack };

export interface MusicProps extends WithErrorMessage {
  readonly tracks: readonly PlaylistTrack[];
}
