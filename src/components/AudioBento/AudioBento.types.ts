import type { BentoAppKey, BentoSizeKey } from "@/components/Bento/index.ts";

export interface AudioBentoDisplay {
  readonly image: string | null;
  readonly title: string;
  readonly subtitle: React.ReactNode;
  readonly alt: string;
  readonly explicit?: boolean;
}

export interface AudioBentoProps {
  readonly display: AudioBentoDisplay | null;
  readonly playbackError?: string | null;
  readonly isPlaying: boolean;
  readonly volume: number;
  readonly app: BentoAppKey;
  readonly sizeKey: BentoSizeKey;
  readonly className?: string;
  readonly onPlayOrPause: () => void;
  readonly onChangeTrack: (direction: "previous" | "next") => void;
  readonly onVolumeChange: (value: number) => void;
}
