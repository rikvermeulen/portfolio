import type {
  AudioBentoDisplay,
  AudioBentoProps,
} from "@/components/Audio/AudioBento/index.ts";
import type {
  SpotifyPlayable,
  SpotifyPlayerKind,
} from "@/hooks/useSpotifyPlayer/index.ts";

export interface SpotifyAudioBentoProps<T extends SpotifyPlayable> extends Pick<
  AudioBentoProps,
  "app" | "sizeKey" | "surfaceClassName"
> {
  readonly items: readonly T[];
  readonly kind: SpotifyPlayerKind;
  readonly toDisplay: (item: T) => AudioBentoDisplay;
}
