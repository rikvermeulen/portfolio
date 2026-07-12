import type { PlaylistTrack } from "@/lib/spotify/types.ts";

export type { PlaylistTrack };

export interface MusicProps {
  readonly tracks: readonly PlaylistTrack[];
}
