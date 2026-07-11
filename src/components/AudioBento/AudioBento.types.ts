import type { ResponsiveBentoSize } from "@/components/Bento/index.ts";

/** Minimum shape the Spotify player needs from an item. */
export interface AudioBentoItem {
  readonly id: string;
}

/** Presentation fields the shell reads from the currently-selected item. */
export interface AudioBentoDisplay {
  readonly image: string | null;
  readonly title: string;
  readonly subtitle: React.ReactNode;
  readonly alt: string;
  readonly explicit?: boolean;
}

export interface AudioBentoProps<T extends AudioBentoItem> {
  readonly items: readonly T[];
  readonly errorMessage?: string;
  /** Spotify URI kind passed through to `useSpotifyPlayer`. */
  readonly uriType?: "track" | "episode";
  /** App-icon shown in the Bento's top-right corner. */
  readonly icon: string;
  readonly sizes: ResponsiveBentoSize;
  /** Extra classes merged onto the tile shell (e.g. a gradient background). */
  readonly className?: string;
  /** Maps the active item to the fields the shell renders. */
  readonly getDisplay: (item: T) => AudioBentoDisplay;
}
