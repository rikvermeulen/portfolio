import type { AudioBentoItem, AudioBentoProps } from "./AudioBento.types.ts";

import { bentoBoxSizes } from "@/components/Bento/index.ts";

/** A minimal domain item for the shared audio shell's stories/tests. */
interface MockAudioItem extends AudioBentoItem {
  readonly title: string;
  readonly artist: string;
  readonly image: string | null;
  readonly explicit: boolean;
}

const items: readonly MockAudioItem[] = [
  {
    id: "mock-1",
    title: "Creepin'",
    artist: "Metro Boomin",
    image: "https://i.scdn.co/image/ab67616d00001e0267d6c6a76afe5b0c9a0cc2f0",
    explicit: true,
  },
  {
    id: "mock-2",
    title: "Flowers",
    artist: "Miley Cyrus",
    image: null,
    explicit: false,
  },
];

const getDisplay = (item: MockAudioItem) => ({
  image: item.image,
  title: item.title,
  subtitle: item.artist,
  alt: item.title,
  explicit: item.explicit,
});

export const mockAudioBentoProps = {
  items,
  icon: "/images/icons/music.png",
  sizes: bentoBoxSizes.music,
  className: "bg-linear-to-b from-ds-music-from to-ds-music-to",
  getDisplay,
} satisfies AudioBentoProps<MockAudioItem>;

export const mockAudioBentoPropsEmpty = {
  items: [],
  errorMessage: "Nothing to play right now",
  icon: "/images/icons/music.png",
  sizes: bentoBoxSizes.music,
  className: "bg-linear-to-b from-ds-music-from to-ds-music-to",
  getDisplay,
} satisfies AudioBentoProps<MockAudioItem>;
