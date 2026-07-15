"use client";

import { useRef, useState } from "react";

import type {
  MusicTrack,
  UseSpotifyMusicPlayerReturn,
} from "./useSpotifyMusicPlayer.types.ts";

import { useSharedSpotifyConnection } from "@/contexts/SpotifyConnectionContext/index.ts";
import {
  PLAYBACK_RETRY_MESSAGE,
  PLAYBACK_UNAVAILABLE_MESSAGE,
  reportDiagnostic,
  resolveDeviceId,
  SPOTIFY_DEVICE_NAME,
  startPlaybackUris,
} from "@/vendors/spotify/webPlayback.ts";

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
  const [followedIndex, setFollowedIndex] = useState(-1);
  const isPendingRef = useRef(false);

  // The SDK's paused state is authoritative — derive rather than track our own.
  const isMusicUri =
    connection.currentUri?.startsWith("spotify:track:") ?? false;
  const isPlaying = isMusicUri && !connection.isPaused;
  const playbackIndex = tracks.findIndex(
    (track) => `spotify:track:${track.id}` === connection.currentUri,
  );

  // Follow the SDK's auto-advances so pausing (or skipping while paused)
  // continues from the track that was actually playing. Adjusting state during
  // render (gated by the last followed index so it runs once per advance) is the
  // React-sanctioned alternative to the cascading re-render an effect would cause.
  if (isPlaying && playbackIndex >= 0 && playbackIndex !== followedIndex) {
    setFollowedIndex(playbackIndex);
    setSelectedIndex(playbackIndex);
  }

  // While playing, the SDK is authoritative (it auto-advances the list);
  // otherwise the visible item is whatever the user has selected.
  const currentIndex =
    isPlaying && playbackIndex >= 0 ? playbackIndex : selectedIndex;

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
          SPOTIFY_DEVICE_NAME,
        )) ?? connection.deviceId;
      const uris = [...tracks.slice(index), ...tracks.slice(0, index)].map(
        (item) => `spotify:track:${item.id}`,
      );
      reportDiagnostic("play-attempt", {
        name: SPOTIFY_DEVICE_NAME,
        cachedId: connection.deviceId,
        resolvedId: deviceId,
        uri: `spotify:track:${track.id}`,
      });
      const resp = await startPlaybackUris(token, deviceId, uris);
      reportDiagnostic("play-result", {
        name: SPOTIFY_DEVICE_NAME,
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
    // Only resume/pause the SDK when its loaded track is the one on display;
    // if the selection has moved (or nothing is loaded), start it instead.
    if (playbackIndex >= 0 && playbackIndex === currentIndex) {
      connection.player?.togglePlay();
      return;
    }
    playAtIndex(currentIndex);
  }

  // Skipping only moves the selection unless music is already playing —
  // changing tracks should never start audio on its own.
  function goToNext() {
    const next = (currentIndex + 1) % tracks.length;
    if (isPlaying) {
      playAtIndex(next);
    } else {
      setSelectedIndex(next);
    }
  }

  function goToPrevious() {
    const previous = (currentIndex - 1 + tracks.length) % tracks.length;
    if (isPlaying) {
      playAtIndex(previous);
    } else {
      setSelectedIndex(previous);
    }
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
