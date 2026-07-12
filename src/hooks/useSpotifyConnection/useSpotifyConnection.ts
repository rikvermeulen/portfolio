"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { SpotifyConnection } from "./useSpotifyConnection.types.ts";
import type {
  SpotifyPlayer,
  WebPlaybackDevice,
  WebPlaybackError,
  WebPlaybackState,
} from "@/lib/spotify/webPlayback.ts";

import {
  fetchAccessToken,
  loadWebPlaybackSdk,
  PLAYBACK_UNAVAILABLE_MESSAGE,
  reportDiagnostic,
  reportEnvironmentDiagnostics,
} from "@/lib/spotify/webPlayback.ts";

/**
 * Registers a single Spotify Connect device in the browser via the Web Playback
 * SDK and exposes its lifecycle. This is the *device* layer only — deliberately
 * identical for music and podcasts, since the SDK docs define exactly one way to
 * register and observe a device. Playback semantics live in the per-feature
 * hooks (`useSpotifyMusicPlayer`, `useSpotifyPodcastPlayer`).
 *
 * @param name    Device name shown in Spotify Connect (must be unique per tile).
 * @param enabled When false, no SDK connection is attempted (e.g. no items).
 */
export function useSpotifyConnection(
  name: string,
  enabled: boolean,
): SpotifyConnection {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(true);
  const [currentUri, setCurrentUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [player, setPlayer] = useState<SpotifyPlayer | null>(null);
  // Cache the token with its expiry so REST callers never use a stale one.
  const tokenRef = useRef<{ value: string; expiresAt: number }>({
    value: "",
    expiresAt: 0,
  });
  const playerRef = useRef<SpotifyPlayer | null>(null);

  const fetchFreshToken = useCallback(async (): Promise<string> => {
    const { token, expiresAt } = await fetchAccessToken();
    tokenRef.current = { value: token, expiresAt };
    return token;
  }, []);

  const getValidToken = useCallback(async (): Promise<string> => {
    const { value, expiresAt } = tokenRef.current;
    if (value && Date.now() < expiresAt) {
      return value;
    }
    return fetchFreshToken();
  }, [fetchFreshToken]);

  // Stable (useCallback), captured in a ref so the connect effect stays keyed
  // only to [name, enabled] and never reconnects the player on unrelated
  // re-renders.
  const fetchFreshTokenRef = useRef(fetchFreshToken);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let player: SpotifyPlayer | null = null;
    let cancelled = false;

    const init = async () => {
      reportDiagnostic("init-start", { name });
      reportEnvironmentDiagnostics();
      await fetchFreshTokenRef.current();
      await loadWebPlaybackSdk();
      reportDiagnostic("sdk-loaded", { name, hasSpotify: !!window.Spotify });
      if (cancelled || !window.Spotify) {
        return;
      }

      player = new window.Spotify.Player({
        name,
        getOAuthToken: (cb) => {
          fetchFreshTokenRef.current().then(cb);
        },
        volume: 0.5,
      });
      playerRef.current = player;
      setPlayer(player);

      // --- Device lifecycle (Web Playback SDK reference) ---
      player.addListener("ready", (data) => {
        reportDiagnostic("ready", { name, data });
        setDeviceId((data as WebPlaybackDevice).device_id);
        setError(null);
      });
      player.addListener("not_ready", (data) => {
        reportDiagnostic("not_ready", { name, data });
        setDeviceId(null);
      });
      player.addListener("player_state_changed", (state) => {
        if (!state) {
          return;
        }
        const playbackState = state as WebPlaybackState;
        setIsPaused(playbackState.paused);
        setCurrentUri(playbackState.track_window?.current_track?.uri ?? null);
      });
      player.addListener("autoplay_failed", () => {
        console.warn("Spotify autoplay failed: user gesture required");
      });

      // --- Error events. Without these every SDK failure is silent; we warn
      // (not error) so Next.js's dev overlay doesn't trip on the expected
      // no-DRM case. ---
      const warnEvent = (label: string) => (data: unknown) => {
        const message = (data as WebPlaybackError | null)?.message ?? "unknown";
        console.warn(`Spotify ${label}: ${message}`);
        reportDiagnostic("sdk-error", { name, label, message });
      };
      // Capability failures (no DRM / non-Premium / bad token) mean playback is
      // impossible — surface the user-facing message.
      const reportCapabilityError = (label: string) => (data: unknown) => {
        warnEvent(label)(data);
        setError(PLAYBACK_UNAVAILABLE_MESSAGE);
      };
      player.addListener(
        "initialization_error",
        reportCapabilityError("init error"),
      );
      player.addListener(
        "authentication_error",
        reportCapabilityError("auth error"),
      );
      player.addListener(
        "account_error",
        reportCapabilityError("account error"),
      );
      // Playback errors are operational (e.g. transient device issues); log only.
      player.addListener("playback_error", warnEvent("playback error"));

      player.connect();
    };

    init();

    return () => {
      cancelled = true;
      player?.disconnect();
    };
  }, [name, enabled]);

  const activate = useCallback(() => {
    playerRef.current?.activateElement();
  }, []);

  return {
    deviceId,
    isReady: deviceId !== null,
    isPaused,
    currentUri,
    error,
    player,
    getValidToken,
    activate,
  };
}
