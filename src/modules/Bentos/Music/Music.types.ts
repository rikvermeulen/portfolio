import type { BentoSizedProps } from "@/components/Bento/index.ts";
import type { PlaylistTrack } from "@/lib/spotify/types.ts";

export type { PlaylistTrack };

export interface MusicProps extends BentoSizedProps {
  readonly tracks: readonly PlaylistTrack[];
}
