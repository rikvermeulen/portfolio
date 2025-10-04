"use client";

import AudioControls from "@/components/AudioControls.tsx";
import Bento from "@/components/Bento/Bento.tsx";
import Icon from "@/components/Icons/Icon.tsx";
import AudioPlayer from "@/hooks/useAudioPlayer.tsx";
import cc from "@/lib/cc.ts";
import truncateText from "@/utils/truncateText.tsx";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";

import type { PodcastItem, PodcastProps } from "@/types/types";
import type { FC } from "react";

const EMPTY_PODCAST_PLAYLIST: PodcastItem[] = [];

const Podcast: FC<PodcastProps> = ({
  playlist = EMPTY_PODCAST_PLAYLIST,
  className,
}) => {
  const [playlistTracks, setPlaylistTracks] = useState<PodcastItem[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [pulsedButton, setPulsedButton] = useState<
    null | "playPause" | "previous" | "next"
  >(null);
  const {
    audioRef,
    isPlaying,
    previewUrl,
    setPreviewUrl,
    playOrPause,
    handleVolumeChange,
    changeTrack,
    handleTimeUpdate,
  } = AudioPlayer({
    initialUrl: "",
    playlistTracks: playlistTracks,
    currentTrackIndex,
    setCurrentTrackIndex,
  });

  const handlePlayOrPause = useCallback(() => {
    playOrPause();
    setPulsedButton("playPause");
    setTimeout(() => setPulsedButton(null), 600);
  }, [playOrPause, setPulsedButton]);

  const handleChangeTrack = useCallback(
    (direction: "previous" | "next") => {
      changeTrack(direction);
      setPulsedButton(direction);
      setTimeout(() => setPulsedButton(null), 600);
    },
    [changeTrack, setPulsedButton],
  );

  useEffect(() => {
    const tracksWithPreview = playlist.filter(
      (track) => !!track.audio_preview_url,
    );
    setPlaylistTracks(tracksWithPreview);
    const initialPreviewUrl = tracksWithPreview[0]?.audio_preview_url;
    if (initialPreviewUrl) {
      setPreviewUrl(initialPreviewUrl);
    }
  }, [playlist, setPreviewUrl]);

  const currentTrack = useMemo(
    () => playlistTracks[currentTrackIndex],
    [playlistTracks, currentTrackIndex],
  );

  const image = currentTrack?.images[1]?.url || "/images/noalbum.png";

  return (
    <Bento
      size="1x1"
      className={cc(
        className,
        "bento relative z-0 !border-none bg-gradient-to-b from-[#BC6AEB] to-[#6E2AAD]",
      )}
    >
      <div className="absolute right-0 z-20 p-5">
        <a
          href="https://open.spotify.com/show/02fM1JHpt9HmHGp482K71b"
          target="_blank"
        >
          <Image
            alt="media"
            height={32}
            src="/images/icons/podcast.png"
            width={32}
            className={cc(
              isPlaying &&
                "bg-gradient-to-b from-[#BC6AEB] to-[#6E2AAD] drop-shadow-md",
              "rounded-md p-1.5 transition-transform duration-300 ease-in-out hover:scale-105",
            )}
          />
        </a>
      </div>
      <div
        style={{
          backgroundImage: image ? `url(${image})` : "",
        }}
        className={`absolute z-0 h-full w-full bg-cover contrast-[0.90] transition-opacity duration-500 ease-in-out ${
          isPlaying ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="h-full w-full backdrop-blur-xl"></div>
      </div>
      <div className="relative z-10 h-full p-5">
        <div className="flex h-40 w-full items-center justify-center">
          {image && (
            <Image
              alt={currentTrack?.name || "No album"}
              height={144}
              priority
              src={image}
              width={144}
              className={cc(
                isPlaying ? "pop-up" : "pop-down",
                "scale-100 rounded-md drop-shadow-md transition-transform duration-300",
              )}
            />
          )}
        </div>
        <div className="mt-6 flex flex-col text-sm text-white">
          <div className="flex items-center gap-2">
            <p className="font-bold">
              {truncateText(currentTrack?.name || "", 40)}
            </p>
            {currentTrack?.explicit && (
              <Icon type="explicit" className="w-2.5" />
            )}
          </div>
          <div className="relative -top-1 text-white/70">Podcast</div>
        </div>
        <AudioControls
          handleChangeTrack={handleChangeTrack}
          handlePlayOrPause={handlePlayOrPause}
          isPlaying={isPlaying}
          pulsedButton={pulsedButton}
        />
        <label
          htmlFor="rangePodcast"
          className="mt-6 flex items-center justify-center gap-4"
        >
          <Icon type="mute" className="w-1.5 fill-white" />
          <span className="sr-only">Volume control for the podcast player</span>
          <input
            id="rangePodcast"
            aria-describedby="rangePodcast"
            defaultValue="0.5"
            max="1"
            min="0"
            name="rangePodcast"
            onChange={handleVolumeChange}
            step="0.01"
            style={{ "--background-size": "50%" } as React.CSSProperties}
            type="range"
            className="slider h-1 w-[70%] scale-100 appearance-none rounded-full opacity-80 outline-none transition-[opacity,width,background,opacity] duration-200 ease-linear active:w-9/12 active:scale-y-[1.4] active:opacity-100"
          />
          <Icon type="sound" className="w-3 fill-white" />
        </label>
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          style={{ display: "none" }}
        >
          {previewUrl && <source src={previewUrl} type="audio/mpeg" />}
          <track
            kind="captions"
            label="No captions available"
            src=""
            srcLang="en"
          />
          Your browser does not support the audio element.
        </audio>
      </div>
    </Bento>
  );
};

export default memo(Podcast);
