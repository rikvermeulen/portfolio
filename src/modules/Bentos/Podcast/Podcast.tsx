"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import type { PodcastProps } from "./Podcast.types.ts";
import type { PulsedButton } from "@/components/AudioControls/index.ts";

import AudioControls from "@/components/AudioControls/index.ts";
import Bento, { bentoBoxSizes } from "@/components/Bento/index.ts";
import Glass from "@/components/Glass/index.ts";
import Icon from "@/components/Icon/index.ts";
import Slider from "@/components/Slider/index.ts";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion/usePrefersReducedMotion.ts";
import { useSpotifyPlayer } from "@/hooks/useSpotifyPlayer/index.ts";
import classnames from "@/utils/classnames/classnames.ts";

const PODCAST_HREF = "https://open.spotify.com/show/02fM1JHpt9HmHGp482K71b";

const Podcast = ({ episodes, errorMessage }: PodcastProps) => {
  const {
    isPlaying,
    currentIndex,
    volume,
    togglePlay,
    goToNext,
    goToPrevious,
    setVolume,
  } = useSpotifyPlayer(episodes, "episode");

  const prefersReducedMotion = usePrefersReducedMotion();
  const [pulsedButton, setPulsedButton] = useState<PulsedButton>(null);

  useEffect(() => {
    if (!pulsedButton) {
      return;
    }
    const id = setTimeout(() => setPulsedButton(null), 600);
    return () => clearTimeout(id);
  }, [pulsedButton]);

  function handlePlayOrPause() {
    togglePlay();
    setPulsedButton("playPause");
  }

  function handleChangeTrack(direction: "previous" | "next") {
    if (direction === "previous") {
      goToPrevious();
    } else {
      goToNext();
    }
    setPulsedButton(direction);
  }

  const currentEpisode = episodes[currentIndex];
  const image = currentEpisode?.imageUrl ?? "/images/noalbum.png";

  return (
    <Bento
      sizes={bentoBoxSizes.podcast}
      className="relative z-0 border-none! bg-linear-to-b from-[#BC6AEB] to-[#6E2AAD]"
    >
      {/* App icon */}
      <div className="absolute right-0 z-20 p-5">
        <a href={PODCAST_HREF} rel="noopener noreferrer" target="_blank">
          <Image
            alt="Podcast"
            height={32}
            src="/images/icons/podcast.png"
            width={32}
            className={classnames(
              isPlaying &&
                "rounded-md bg-linear-to-b from-[#BC6AEB] to-[#6E2AAD] drop-shadow-md",
              "p-1 transition-transform duration-300 ease-in-out hover:scale-105",
            )}
          />
        </a>
      </div>

      {/* Blurred episode art backdrop */}
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
        {/* Episode art with glass */}
        <div className="flex h-34 w-full items-center justify-center">
          {image && (
            <div
              className={classnames(
                !prefersReducedMotion && (isPlaying ? "pop-up" : "pop-down"),
                "relative overflow-hidden rounded-md drop-shadow-md",
              )}
            >
              <Image
                alt={currentEpisode?.name ?? "No episode"}
                height={124}
                priority
                src={image}
                width={124}
              />
              <Glass
                blur={6}
                intensity={1.2}
                interactive
                radius={6}
                tint="light"
              />
            </div>
          )}
        </div>

        {/* Episode info */}
        {errorMessage && !currentEpisode ? (
          <div className="mt-2 text-sm text-white/70">{errorMessage}</div>
        ) : (
          <div className="mt-2 flex flex-col text-white">
            <div className="flex items-center gap-2 text-xs">
              <p className="line-clamp-1 font-bold">{currentEpisode?.name}</p>
              {currentEpisode?.explicit && (
                <Icon iconClassName="w-2.5 shrink-0" name="explicit" />
              )}
            </div>
            <div className="text-xs text-white/70">Podcast</div>
          </div>
        )}

        <AudioControls
          isPlaying={isPlaying}
          onChangeTrack={handleChangeTrack}
          onPlayOrPause={handlePlayOrPause}
          pulsedButton={pulsedButton}
        />

        {/* Volume slider */}
        <div className="mt-2 flex items-center justify-center gap-3">
          <Icon iconClassName="w-2 fill-white" name="mute" />
          <Slider
            label="Volume"
            maxValue={1}
            minValue={0}
            onChange={setVolume}
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

export default Podcast;
