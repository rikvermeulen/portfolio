"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import type { AudioBentoProps } from "./AudioBento.types.ts";
import type { PulsedButton } from "@/components/AudioControls/index.ts";

import AudioControls from "@/components/AudioControls/index.ts";
import Bento from "@/components/Bento/index.ts";
import Icon from "@/components/Icon/index.ts";
import Slider from "@/components/Slider/index.ts";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion/usePrefersReducedMotion.ts";
import classnames from "@/utils/classnames/classnames.ts";

const PULSE_DURATION_MS = 600;
const FALLBACK_IMAGE = "/images/no-album.png";

/**
 * Presentational Spotify-backed audio tile. Owns the pulse animation, blurred
 * backdrop and transport layout only; the Music and Podcast containers supply
 * player state (via their own hooks) and the handlers wired below.
 */
const AudioBento = ({
  display,
  errorMessage,
  playbackError,
  isPlaying,
  volume,
  icon,
  sizes,
  className,
  onPlayOrPause,
  onChangeTrack,
  onVolumeChange,
}: AudioBentoProps) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [pulsedButton, setPulsedButton] = useState<PulsedButton>(null);

  useEffect(() => {
    if (!pulsedButton) {
      return;
    }
    const id = setTimeout(() => setPulsedButton(null), PULSE_DURATION_MS);
    return () => clearTimeout(id);
  }, [pulsedButton]);

  const handlePlayOrPause = () => {
    onPlayOrPause();
    setPulsedButton("playPause");
  };

  const handleChangeTrack = (direction: "previous" | "next") => {
    onChangeTrack(direction);
    setPulsedButton(direction);
  };

  const image = display?.image ?? FALLBACK_IMAGE;

  return (
    <Bento
      image={icon}
      sizes={sizes}
      className={classnames("relative z-0 border-none!", className)}
    >
      {/* Blurred art backdrop */}
      <div
        aria-hidden="true"
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
              "scale-100 rounded-md drop-shadow-md transition-transform duration-300 ease-in-out",
            )}
          />
        </div>

        {/* Item info */}
        {errorMessage && !display ? (
          <div className="mt-2 text-sm text-white/70">{errorMessage}</div>
        ) : (
          <div className="mt-2 flex flex-col text-white">
            <div className="flex items-center gap-2 text-xs">
              <p className="line-clamp-1 font-bold">{display?.title}</p>
              {display?.explicit && (
                <Icon iconClassName="w-2.5" name="explicit" />
              )}
            </div>
            <div className="relative text-xs text-white/70">
              {display?.subtitle}
            </div>
          </div>
        )}

        <AudioControls
          isPlaying={isPlaying}
          onChangeTrack={handleChangeTrack}
          onPlayOrPause={handlePlayOrPause}
          pulsedButton={pulsedButton}
        />

        {playbackError && (
          <p
            role="alert"
            className="mt-2 text-center text-[0.65rem] leading-tight text-white/80"
          >
            {playbackError}
          </p>
        )}

        {/* Volume slider */}
        <div className="mt-2 flex items-center justify-center gap-3">
          <Icon iconClassName="w-2 fill-white" name="mute" />
          <Slider
            label="Volume"
            maxValue={1}
            minValue={0}
            onChange={onVolumeChange}
            step={0.01}
            value={volume}
            className="w-[70%] opacity-80 transition-opacity duration-200 hover:opacity-100"
          />
          <Icon iconClassName="w-3.5 fill-white" name="sound" />
        </div>
      </div>
    </Bento>
  );
};

export default AudioBento;
