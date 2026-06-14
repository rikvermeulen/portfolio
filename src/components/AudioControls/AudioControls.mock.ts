import type { AudioControlsProps } from "./AudioControls.types.ts";

const noop = (): void => undefined;

export const mockAudioControlsProps = {
  isPlaying: false,
  pulsedButton: null,
  onPlayOrPause: noop,
  onChangeTrack: noop,
} satisfies AudioControlsProps;

export const mockAudioControlsPlayingProps = {
  isPlaying: true,
  pulsedButton: null,
  onPlayOrPause: noop,
  onChangeTrack: noop,
} satisfies AudioControlsProps;
