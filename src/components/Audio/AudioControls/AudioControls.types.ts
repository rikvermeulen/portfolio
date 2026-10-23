export interface AudioControlsProps {
  readonly isPlaying: boolean;
  readonly onPlayOrPause: () => void;
  readonly onChangeTrack: (direction: "previous" | "next") => void;
}

export interface SkipIconProps {
  className?: string;
}
