"use client";

import Image from "next/image";

import type { AudioBentoProps } from "./AudioBento.types.ts";

import AudioControls from "@/components/Audio/AudioControls/index.ts";
import Bento, { bentos } from "@/components/Bento/index.ts";
import Icon from "@/components/Icon/index.ts";
import Slider from "@/components/Slider/index.ts";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion/usePrefersReducedMotion.ts";
import classnames from "@/utils/classnames/index.ts";

const FALLBACK_IMAGE = "/images/no-album.png";

/**
 * Presentational Spotify-backed audio tile. Owns the blurred backdrop and
 * transport layout only; the Music and Podcast containers supply player state
 * (via their own hooks) and the handlers wired below.
 */
const AudioBento = ({
  display,
  playbackError,
  isPlaying,
  volume,
  app,
  sizeKey,
  surfaceClassName,
  onPlayOrPause,
  onChangeTrack,
  onVolumeChange,
}: AudioBentoProps) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const image = display?.image ?? FALLBACK_IMAGE;

  return (
    <Bento
      app={app}
      sizes={bentos[sizeKey].sizes}
      surfaceClassName={surfaceClassName}
      className="relative z-0 border-none!"
    >
      {/* Blurred art backdrop */}
      <div
        aria-hidden
        style={{ backgroundImage: `url(${image})` }}
        className={classnames(
          "absolute inset-0 z-0 h-full w-full bg-cover contrast-[0.90] transition-opacity duration-500 ease-in-out",
          isPlaying ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="h-full w-full backdrop-blur-xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full p-5">
        {/* Art */}
        <div className="flex h-34 w-full items-center justify-center">
          <Image
            alt={display?.alt ?? "No media"}
            height={124}
            priority
            src={image}
            width={124}
            className={classnames(
              !prefersReducedMotion && (isPlaying ? "pop-up" : "pop-down"),
              "aspect-square scale-100 rounded-md object-cover drop-shadow-md transition-transform duration-300 ease-in-out",
            )}
          />
        </div>

        {/* Now playing */}
        <div
          aria-atomic
          aria-live="polite"
          className="mt-2 flex flex-col text-white"
        >
          <div className="flex items-center gap-2">
            <p className="bento-headline line-clamp-1">{display?.title}</p>
            {display?.explicit && (
              <Icon iconClassName="w-2.5" label="Explicit" name="explicit" />
            )}
          </div>
          <p className="bento-body relative text-white">{display?.subtitle}</p>
        </div>

        <AudioControls
          isPlaying={isPlaying}
          onChangeTrack={onChangeTrack}
          onPlayOrPause={onPlayOrPause}
        />

        {playbackError && (
          <p role="alert" className="bento-body mt-2 text-center text-white">
            {playbackError}
          </p>
        )}

        {/* Volume slider */}
        <div className="mt-2 flex items-center justify-center gap-3">
          <Icon iconClassName="w-2 text-white" name="mute" />
          <Slider
            label="Volume"
            maxValue={1}
            minValue={0}
            onChange={onVolumeChange}
            step={0.01}
            value={volume}
            className="w-[70%] opacity-80 transition-opacity duration-200 hover:opacity-100"
          />
          <Icon iconClassName="w-3.5 text-white" name="sound" />
        </div>
      </div>
    </Bento>
  );
};

export default AudioBento;
