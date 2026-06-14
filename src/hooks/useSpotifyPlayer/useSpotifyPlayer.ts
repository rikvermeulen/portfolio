"use client";

import { useEffect, useRef, useState } from "react";

interface SpotifyItem {
  readonly id: string;
}

// Minimal types for the Spotify Web Playback SDK global
declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: new (options: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume: number;
      }) => SpotifyPlayer;
    };
  }
}

interface SpotifyPlayer {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  togglePlay: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  addListener: (event: string, cb: (data: unknown) => void) => boolean;
  removeListener: (event: string) => boolean;
}

async function fetchToken(): Promise<string> {
  const resp = await fetch("/api/spotify/token");
  const data = (await resp.json()) as { token: string };
  return data.token;
}

async function startPlayback(
  token: string,
  deviceId: string,
  trackUri: string,
): Promise<void> {
  await fetch(
    `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris: [trackUri] }),
    },
  );
}

export interface UseSpotifyPlayerReturn {
  isPlaying: boolean;
  isReady: boolean;
  currentIndex: number;
  volume: number;
  togglePlay: () => void;
  goToNext: () => void;
  goToPrevious: () => void;
  setVolume: (value: number) => void;
}

export function useSpotifyPlayer(
  items: readonly SpotifyItem[],
  uriType: "track" | "episode" = "track",
): UseSpotifyPlayerReturn {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [volume, setVolumeState] = useState(0.5);
  const tokenRef = useRef<string>("");
  const playerRef = useRef<SpotifyPlayer | null>(null);
  const hasStartedRef = useRef(false);
  const isPendingRef = useRef(false);

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    let player: SpotifyPlayer | null = null;

    const init = async () => {
      const token = await fetchToken();
      tokenRef.current = token;

      const initPlayer = () => {
        player = new window.Spotify.Player({
          name: "Rik's Portfolio",
          getOAuthToken: (cb) => {
            fetchToken().then(cb);
          },
          volume: 0.5,
        });

        player.addListener("ready", (data) => {
          const { device_id } = data as { device_id: string };
          setDeviceId(device_id);
        });

        player.addListener("player_state_changed", (state) => {
          if (!state) {
            return;
          }
          const s = state as { paused: boolean };
          setIsPlaying(!s.paused);
        });

        player.connect();
        playerRef.current = player;
      };

      if (window.Spotify) {
        initPlayer();
      } else {
        window.onSpotifyWebPlaybackSDKReady = initPlayer;
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        document.body.appendChild(script);
      }
    };

    init();

    return () => {
      player?.disconnect();
    };
  }, [items.length]);

  async function playAtIndex(index: number) {
    const item = items[index];
    if (!item || !deviceId) {
      return;
    }

    isPendingRef.current = true;
    setIsPlaying(true);
    try {
      await startPlayback(
        tokenRef.current,
        deviceId,
        `spotify:${uriType}:${item.id}`,
      );
      setCurrentIndex(index);
      hasStartedRef.current = true;
    } finally {
      isPendingRef.current = false;
    }
  }

  function togglePlay() {
    if (isPendingRef.current) {
      return;
    }

    if (!hasStartedRef.current && deviceId) {
      playAtIndex(currentIndex);
      return;
    }
    // Optimistically flip state; player_state_changed will correct if needed
    setIsPlaying((prev) => !prev);
    playerRef.current?.togglePlay();
  }

  function goToNext() {
    const next = (currentIndex + 1) % items.length;
    playAtIndex(next);
  }

  function goToPrevious() {
    const prev = (currentIndex - 1 + items.length) % items.length;
    playAtIndex(prev);
  }

  function setVolume(value: number) {
    playerRef.current?.setVolume(value);
    setVolumeState(value);
  }

  return {
    isPlaying,
    isReady: !!deviceId,
    currentIndex,
    volume,
    togglePlay,
    goToNext,
    goToPrevious,
    setVolume,
  };
}
