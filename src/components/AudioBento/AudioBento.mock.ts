import type { AudioBentoProps } from "./AudioBento.types.ts";

const noop = () => undefined;

export const mockAudioBentoProps = {
  display: {
    image: "https://i.scdn.co/image/ab67616d00001e0267d6c6a76afe5b0c9a0cc2f0",
    title: "Creepin'",
    subtitle: "Metro Boomin",
    alt: "Creepin'",
    explicit: true,
  },
  isPlaying: true,
  volume: 0.5,
  app: "music",
  sizeKey: "music",
  surfaceClassName: "bg-linear-to-b from-ds-music-from to-ds-music-to",
  onPlayOrPause: noop,
  onChangeTrack: noop,
  onVolumeChange: noop,
} satisfies AudioBentoProps;
