import type { ResponsiveBentoSize } from "@/components/Bento/index.ts";

/** Presentation fields the shell renders for the currently-selected item. */
export interface AudioBentoDisplay {
  readonly image: string | null;
  readonly title: string;
  readonly subtitle: React.ReactNode;
  readonly alt: string;
  readonly explicit?: boolean;
}

/**
 * Purely presentational audio tile: art, blurred backdrop, transport controls,
 * pulse animation, and volume slider. It owns no Spotify logic — the Music and
 * Podcast containers wire their own player hooks and pass state + handlers in.
 */
export interface AudioBentoProps {
  /** The active item's display fields, or null when there's nothing to show. */
  readonly display: AudioBentoDisplay | null;
  /** Message shown when the underlying data failed to load. */
  readonly errorMessage?: string;
  /** Message shown when playback itself can't start. */
  readonly playbackError?: string | null;
  readonly isPlaying: boolean;
  readonly volume: number;
  /** App-icon shown in the Bento's top-right corner. */
  readonly icon: string;
  readonly sizes: ResponsiveBentoSize;
  /** Extra classes merged onto the tile shell (e.g. a gradient background). */
  readonly className?: string;
  readonly onPlayOrPause: () => void;
  readonly onChangeTrack: (direction: "previous" | "next") => void;
  readonly onVolumeChange: (value: number) => void;
}
