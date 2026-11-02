import type { BentoSizedProps } from "@/components/Bento/index.ts";
import type { SpotifyMusicData } from "@/lib/music/types.ts";

export interface MusicProps extends BentoSizedProps {
  readonly source: SpotifyMusicData;
}
