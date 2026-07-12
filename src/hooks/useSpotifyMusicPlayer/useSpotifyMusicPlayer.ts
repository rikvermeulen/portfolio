"use client";

import { useRef, useState } from "react";

import { useSharedSpotifyConnection } from "@/contexts/SpotifyConnectionContext/index.ts";
import {
  PLAYBACK_RETRY_MESSAGE,
  PLAYBACK_UNAVAILABLE_MESSAGE,
  reportDiagnostic,
  resolveDeviceId,
  startPlaybackUris,
} from "@/lib/spotify/webPlayback.ts";

/** Minimal shape the music player needs from a track. */
export interface MusicTrack {
  readonly id: string;
}

export interface UseSpotifyMusicPlayerReturn {
  readonly isPlaying: boolean;
  readonly isReady: boolean;
  readonly currentIndex: number;
  readonly volume: number;
  readonly error: string | null;
  readonly togglePlay: () => void;
  readonly goToNext: () => void;
  readonly goToPrevious: () => void;
  readonly setVolume: (value: number) => void;
}

/**
 * Music playback over a list of tracks on the page's single Spotify device.
 * Starting at an index sends the complete rotated list so Spotify can advance
 * automatically while the SDK state keeps the visible item in sync.
 */
export function useSpotifyMusicPlayer(
  tracks: readonly MusicTrack[],
): UseSpotifyMusicPlayerReturn {
  const connection = useSharedSpotifyConnection();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [playError, setPlayError] = useState<string | null>(null);
  const isPendingRef = useRef(false);

  // The SDK's paused state is authoritative — derive rather than track our own.
  const isMusicUri =
    connection.currentUri?.startsWith("spotify:track:") ?? false;
  const isPlaying = isMusicUri && !connection.isPaused;
  const playbackIndex = tracks.findIndex(
    (track) => `spotify:track:${track.id}` === connection.currentUri,
  );
  const currentIndex = playbackIndex >= 0 ? playbackIndex : selectedIndex;

  async function playAtIndex(index: number) {
    const track = tracks[index];
    if (!track) {
      return;
    }
    if (!connection.deviceId) {
      // Surface it instead of silently no-opping (the reported symptom).
      setPlayError(PLAYBACK_UNAVAILABLE_MESSAGE);
      return;
    }

    // Autoplay-restricted browsers need this inside the click gesture.
    connection.activate();
    isPendingRef.current = true;
    try {
      const token = await connection.getValidToken();
      // The cached ready-event id can go stale after SDK reconnects (HMR,
      // network blips) — resolve the live id by device name at play time.
      const deviceId =
        (await resolveDeviceId(
          token,
          connection.deviceId,
          "Rik's Portfolio",
        )) ?? connection.deviceId;
      const uris = [...tracks.slice(index), ...tracks.slice(0, index)].map(
        (item) => `spotify:track:${item.id}`,
      );
      reportDiagnostic("play-attempt", {
        name: "Rik's Portfolio",
        cachedId: connection.deviceId,
        resolvedId: deviceId,
        uri: `spotify:track:${track.id}`,
      });
      const resp = await startPlaybackUris(token, deviceId, uris);
      reportDiagnostic("play-result", {
        name: "Rik's Portfolio",
        status: resp.status,
      });
      if (!resp.ok) {
        console.warn(`Spotify playback error: ${resp.status}`);
        // 404 after retries = device unreachable (usually transient); keep
        // hasStarted false so the next press retries the play call instead of
        // toggling an empty SDK player.
        setPlayError(
          resp.status === 404
            ? PLAYBACK_RETRY_MESSAGE
            : PLAYBACK_UNAVAILABLE_MESSAGE,
        );
        return;
      }
      setPlayError(null);
      setSelectedIndex(index);
    } finally {
      isPendingRef.current = false;
    }
  }

  function togglePlay() {
    if (isPendingRef.current) {
      return;
    }
    if (playbackIndex < 0) {
      playAtIndex(currentIndex);
      return;
    }
    connection.player?.togglePlay();
  }

  function goToNext() {
    playAtIndex((currentIndex + 1) % tracks.length);
  }

  function goToPrevious() {
    playAtIndex((currentIndex - 1 + tracks.length) % tracks.length);
  }

  function applyVolume(value: number) {
    connection.player?.setVolume(value);
    setVolume(value);
  }

  return {
    isPlaying,
    isReady: connection.isReady,
    currentIndex,
    volume,
    error: playError ?? connection.error,
    togglePlay,
    goToNext,
    goToPrevious,
    setVolume: applyVolume,
  };
}
