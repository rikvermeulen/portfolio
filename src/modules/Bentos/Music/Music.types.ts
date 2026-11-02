import type { BentoSizedProps } from "@/components/Bento/index.ts";
import type { PlaylistTrack } from "@/lib/music/types.ts";

export interface MusicProps extends BentoSizedProps {
  readonly tracks: readonly PlaylistTrack[];
}
