"use client";

import { useRef, useState } from "react";

import type {
  SpotifyPlayable,
  SpotifyPlayerKind,
  UseSpotifyPlayerReturn,
} from "./useSpotifyPlayer.types.ts";

import { useSharedSpotifyConnection } from "@/contexts/SpotifyConnectionContext/index.ts";
import {
  PLAYBACK_RETRY_MESSAGE,
  PLAYBACK_UNAVAILABLE_MESSAGE,
  reportDiagnostic,
  resolveDeviceId,
  SPOTIFY_DEVICE_NAME,
  startPlaybackUris,
} from "@/vendors/spotify/webPlayback.ts";

const URI_PREFIX: Record<SpotifyPlayerKind, string> = {
  track: "spotify:track:",
  episode: "spotify:episode:",
};

/**
 * The single Spotify player for the page's one Web Playback device. `kind`
 * selects the content scheme and how the play payload is built:
 * - `"track"` sends the whole list rotated to start at the selected index, so
 *   the SDK auto-advances the queue;
 * - `"episode"` sends a single episode URI (a `spotify:episode:` `context_uri`
 *   returns 400 "Non supported context uri", verified against the live API).
 * Everything else — SDK-authoritative play state, follow-on-auto-advance,
 * selection, skip, volume, error handling — is identical across both.
 */
export function useSpotifyPlayer<T extends SpotifyPlayable>(
  items: readonly T[],
  kind: SpotifyPlayerKind,
): UseSpotifyPlayerReturn {
  const connection = useSharedSpotifyConnection();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [playError, setPlayError] = useState<string | null>(null);
  const [followedIndex, setFollowedIndex] = useState(-1);
  const isPendingRef = useRef(false);

  const uriPrefix = URI_PREFIX[kind];

  // The SDK's paused state is authoritative — derive rather than track our own.
  const isMatchingUri = connection.currentUri?.startsWith(uriPrefix) ?? false;
  const isPlaying = isMatchingUri && !connection.isPaused;
  const playbackIndex = items.findIndex(
    (item) => `${uriPrefix}${item.id}` === connection.currentUri,
  );

  // Follow the SDK's auto-advances so pausing (or skipping while paused)
  // continues from the item that was actually playing. Adjusting state during
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
    const item = items[index];
    if (!item) {
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
      const uris =
        kind === "track"
          ? [...items.slice(index), ...items.slice(0, index)].map(
              (entry) => `${uriPrefix}${entry.id}`,
            )
          : [`${uriPrefix}${item.id}`];
      reportDiagnostic("play-attempt", {
        name: SPOTIFY_DEVICE_NAME,
        cachedId: connection.deviceId,
        resolvedId: deviceId,
        uri: `${uriPrefix}${item.id}`,
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
    // Only resume/pause the SDK when its loaded item is the one on display;
    // if the selection has moved (or nothing is loaded), start it instead.
    if (playbackIndex >= 0 && playbackIndex === currentIndex) {
      connection.player?.togglePlay();
      return;
    }
    playAtIndex(currentIndex);
  }

  // Skipping only moves the selection unless something is already playing —
  // changing items should never start audio on its own.
  function goToNext() {
    const next = (currentIndex + 1) % items.length;
    if (isPlaying) {
      playAtIndex(next);
    } else {
      setSelectedIndex(next);
    }
  }

  function goToPrevious() {
    const previous = (currentIndex - 1 + items.length) % items.length;
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
