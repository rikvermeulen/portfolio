"use client";

import { useRef, useState } from "react";

import type {
  PodcastEpisodeItem,
  UseSpotifyPodcastPlayerReturn,
} from "./useSpotifyPodcastPlayer.types.ts";

import { useSharedSpotifyConnection } from "@/contexts/SpotifyConnectionContext/index.ts";
import {
  PLAYBACK_RETRY_MESSAGE,
  PLAYBACK_UNAVAILABLE_MESSAGE,
  reportDiagnostic,
  resolveDeviceId,
  SPOTIFY_DEVICE_NAME,
  startPlaybackUris,
} from "@/lib/spotify/webPlayback.ts";

/**
 * Podcast playback over a list of episodes. Episodes are played with their
 * `spotify:episode:` URI in the Web API `uris` array — the only supported way
 * (a `spotify:episode:` `context_uri` returns 400 "Non supported context uri",
 * verified against the live API). Deliberately independent from the music
 * player so podcast-specific behaviour (resume points, chapter/30s skips) can
 * be added here without touching music.
 */
export function useSpotifyPodcastPlayer(
  episodes: readonly PodcastEpisodeItem[],
): UseSpotifyPodcastPlayerReturn {
  const connection = useSharedSpotifyConnection();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [playError, setPlayError] = useState<string | null>(null);
  const [followedIndex, setFollowedIndex] = useState(-1);
  const isPendingRef = useRef(false);

  // The SDK's paused state is authoritative — derive rather than track our own.
  const isPodcastUri =
    connection.currentUri?.startsWith("spotify:episode:") ?? false;
  const isPlaying = isPodcastUri && !connection.isPaused;
  const playbackIndex = episodes.findIndex(
    (episode) => `spotify:episode:${episode.id}` === connection.currentUri,
  );

  // Follow the SDK's auto-advances so pausing (or skipping while paused)
  // continues from the episode that was actually playing. Adjusting state during
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
    const episode = episodes[index];
    if (!episode) {
      return;
    }
    if (!connection.deviceId) {
      setPlayError(PLAYBACK_UNAVAILABLE_MESSAGE);
      return;
    }

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
      reportDiagnostic("play-attempt", {
        name: SPOTIFY_DEVICE_NAME,
        cachedId: connection.deviceId,
        resolvedId: deviceId,
        uri: `spotify:episode:${episode.id}`,
      });
      const resp = await startPlaybackUris(token, deviceId, [
        `spotify:episode:${episode.id}`,
      ]);
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
    // Only resume/pause the SDK when its loaded episode is the one on display;
    // if the selection has moved (or nothing is loaded), start it instead.
    if (playbackIndex >= 0 && playbackIndex === currentIndex) {
      connection.player?.togglePlay();
      return;
    }
    playAtIndex(currentIndex);
  }

  // Skipping only moves the selection unless a podcast is already playing —
  // changing episodes should never start audio on its own.
  function goToNext() {
    const next = (currentIndex + 1) % episodes.length;
    if (isPlaying) {
      playAtIndex(next);
    } else {
      setSelectedIndex(next);
    }
  }

  function goToPrevious() {
    const previous = (currentIndex - 1 + episodes.length) % episodes.length;
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
