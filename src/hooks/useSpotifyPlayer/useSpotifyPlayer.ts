"use client";

import { useRef, useState } from "react";

import type {
  SpotifyPlayable,
  SpotifyPlayerKind,
  UseSpotifyPlayerReturn,
} from "./useSpotifyPlayer.types.ts";
import type { PlaybackTarget } from "@/vendors/spotify/webPlayback.ts";

import { useSharedSpotifyConnection } from "@/contexts/SpotifyConnectionContext/index.ts";
import {
  PLAYBACK_RETRY_MESSAGE,
  PLAYBACK_UNAVAILABLE_MESSAGE,
  reportDiagnostic,
  resolveDeviceId,
  SPOTIFY_DEVICE_NAME,
  startPlayback,
} from "@/vendors/spotify/webPlayback.ts";

const URI_PREFIX: Record<SpotifyPlayerKind, string> = {
  track: "spotify:track:",
  episode: "spotify:episode:",
  playlist: "spotify:playlist:",
};

function toPlaybackTarget(
  kind: SpotifyPlayerKind,
  items: readonly SpotifyPlayable[],
  index: number,
  itemUri: string,
): PlaybackTarget {
  if (kind === "playlist") {
    return { context_uri: itemUri };
  }
  return {
    uris: [...items.slice(index), ...items.slice(0, index)].map(
      (entry) => `${URI_PREFIX[kind]}${entry.id}`,
    ),
  };
}

/**
 * The single Spotify player for the page's one Web Playback device. `kind`
 * selects the content scheme and how the play payload is built:
 * - `"track"` and `"episode"` send the whole list rotated to start at the
 *   selected index, so the SDK auto-advances the queue (episodes only play via
 *   `uris`: as `context_uri` they return 400 "Non supported context uri");
 * - `"playlist"` plays one playlist (`items[0]`) as a whole via `context_uri`.
 *   Its tracks can't be listed for a playlist another account owns, so the SDK
 *   reports what plays (`nowPlaying`) and skips move through the SDK.
 * Everything else — SDK-authoritative play state, follow-on-auto-advance,
 * selection, skip, volume, error handling — is identical across all three.
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
  // A playlist is "ours" by its context; tracks/episodes by their own URI.
  const isPlaylist = kind === "playlist";
  const isMatchingUri = isPlaylist
    ? connection.contextUri === `${uriPrefix}${items[0]?.id}`
    : (connection.currentUri?.startsWith(uriPrefix) ?? false);
  const isPlaying = isMatchingUri && !connection.isPaused;
  const playbackIndex = isPlaylist
    ? isMatchingUri
      ? 0
      : -1
    : items.findIndex(
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
      const itemUri = `${uriPrefix}${item.id}`;
      reportDiagnostic("play-attempt", {
        name: SPOTIFY_DEVICE_NAME,
        cachedId: connection.deviceId,
        resolvedId: deviceId,
        uri: itemUri,
      });
      const resp = await startPlayback(
        token,
        deviceId,
        toPlaybackTarget(kind, items, index, itemUri),
      );
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
    } catch (error) {
      // Token or device lookup failed (network, token route) — surface, don't reject unhandled.
      console.warn(`Spotify play failed: ${String(error)}`);
      setPlayError(PLAYBACK_RETRY_MESSAGE);
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
    // A playlist's tracks live in the SDK, so skip there (only once it's loaded).
    if (isPlaylist) {
      if (isMatchingUri) {
        connection.player?.nextTrack();
      }
      return;
    }
    const next = (currentIndex + 1) % items.length;
    if (isPlaying) {
      playAtIndex(next);
    } else {
      setSelectedIndex(next);
    }
  }

  function goToPrevious() {
    if (isPlaylist) {
      if (isMatchingUri) {
        connection.player?.previousTrack();
      }
      return;
    }
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
    nowPlaying: isPlaylist && isMatchingUri ? connection.nowPlaying : null,
    volume,
    error: playError ?? connection.error,
    togglePlay,
    goToNext,
    goToPrevious,
    setVolume: applyVolume,
  };
}
