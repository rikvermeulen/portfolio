"use client";

import type { MusicProps } from "./Music.types.ts";

import AudioBento from "@/components/AudioBento/index.ts";
import { bentoBoxSizes } from "@/components/Bento/index.ts";

const Music = ({ tracks, errorMessage }: MusicProps) => (
  <AudioBento
    errorMessage={errorMessage}
    getDisplay={(track) => ({
      image: track.albumArtUrl,
      title: track.name,
      subtitle: track.artist,
      alt: track.albumName || "No album",
      explicit: track.explicit,
    })}
    icon="/images/icons/music.png"
    items={tracks}
    sizes={bentoBoxSizes.music}
    className="bg-linear-to-b from-ds-music-from to-ds-music-to"
  />
);

export default Music;
