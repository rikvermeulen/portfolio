import type {
  AudioBentoDisplay,
  AudioBentoProps,
} from "@/components/Audio/AudioBento/index.ts";
import type {
  SpotifyPlayable,
  SpotifyPlayerKind,
} from "@/hooks/useSpotifyPlayer/index.ts";
import type { NowPlayingTrack } from "@/lib/music/types.ts";

export interface SpotifyAudioBentoProps<T extends SpotifyPlayable> extends Pick<
  AudioBentoProps,
  "app" | "sizeKey" | "surfaceClassName"
> {
  readonly items: readonly T[];
  readonly kind: SpotifyPlayerKind;
  /** `nowPlaying` is the SDK track while a `"playlist"` plays, else `null`. */
  readonly toDisplay: (
    item: T,
    nowPlaying: NowPlayingTrack | null,
  ) => AudioBentoDisplay;
}
