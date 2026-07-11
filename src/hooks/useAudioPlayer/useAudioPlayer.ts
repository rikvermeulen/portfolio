"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const PREVIEW_CUTOFF_SECONDS = 26;
const FADE_DURATION_MS = 400;
const FADE_STEP_MS = 10;

export interface UseAudioPlayerOptions {
  readonly previewUrls: readonly string[];
}

export interface UseAudioPlayerReturn {
  readonly audioRef: React.RefObject<HTMLAudioElement | null>;
  readonly isPlaying: boolean;
  readonly currentIndex: number;
  readonly volume: number;
  readonly playOrPause: () => void;
  readonly goToNext: () => void;
  readonly goToPrevious: () => void;
  readonly setVolume: (value: number) => void;
  readonly handleTimeUpdate: () => void;
}

export function useAudioPlayer({
  previewUrls,
}: UseAudioPlayerOptions): UseAudioPlayerReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const isPlayingRef = useRef(false);
  useLayoutEffect(() => {
    isPlayingRef.current = isPlaying;
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const url = previewUrls[currentIndex] ?? "";
    audio.src = url;
    audio.load();

    if (isPlayingRef.current && url) {
      audio.play().catch(() => setIsPlaying(false));
    }
  }, [currentIndex, previewUrls]);

  function fadeOut(): void {
    const audio = audioRef.current;
    /* istanbul ignore next — playOrPause pre-checks null before calling fadeOut */
    if (!audio) {
      return;
    }

    const steps = FADE_DURATION_MS / FADE_STEP_MS;
    const originalVolume = audio.volume;
    const step = originalVolume / steps;
    let count = 0;

    const tick = () => {
      if (!audioRef.current) {
        return;
      }
      audioRef.current.volume = Math.max(audioRef.current.volume - step, 0);
      count++;
      if (count < steps) {
        setTimeout(tick, FADE_STEP_MS);
      } else {
        audioRef.current.pause();
        audioRef.current.volume = originalVolume;
        setIsPlaying(false);
      }
    };

    tick();
  }

  function playOrPause(): void {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (audio.paused) {
      audio.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    } else {
      fadeOut();
    }
  }

  function navigate(direction: "next" | "previous"): void {
    if (previewUrls.length === 0) {
      return;
    }

    const modifier = direction === "next" ? 1 : -1;
    const next =
      (currentIndex + modifier + previewUrls.length) % previewUrls.length;
    setCurrentIndex(next);

    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }

  function applyVolume(value: number): void {
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value;
    }
  }

  function handleTimeUpdate(): void {
    const audio = audioRef.current;
    if (audio && audio.currentTime >= PREVIEW_CUTOFF_SECONDS) {
      fadeOut();
      audio.currentTime = 0;
    }
  }

  return {
    audioRef,
    isPlaying,
    currentIndex,
    volume,
    playOrPause,
    goToNext: () => navigate("next"),
    goToPrevious: () => navigate("previous"),
    setVolume: applyVolume,
    handleTimeUpdate,
  };
}
