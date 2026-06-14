export type PulsedButton = "playPause" | "previous" | "next" | null;

export interface AudioControlsProps {
  readonly isPlaying: boolean;
  readonly pulsedButton: PulsedButton;
  readonly onPlayOrPause: () => void;
  readonly onChangeTrack: (direction: "previous" | "next") => void;
}
