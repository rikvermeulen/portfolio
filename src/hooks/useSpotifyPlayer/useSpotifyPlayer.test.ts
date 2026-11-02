/**
 * @jest-environment jsdom
 */

import { useSharedSpotifyConnection } from "@/contexts/SpotifyConnectionContext/index.ts";
import {
  PLAYBACK_RETRY_MESSAGE,
  resolveDeviceId,
  startPlayback,
} from "@/vendors/spotify/webPlayback.ts";
import { act, renderHook } from "@testing-library/react";

import { useSpotifyPlayer } from "./index.ts";

// jest.mock is hoisted above the imports above, so both modules are mocked.
jest.mock("@/contexts/SpotifyConnectionContext/index.ts", () => ({
  useSharedSpotifyConnection: jest.fn(),
}));
jest.mock("@/vendors/spotify/webPlayback.ts", () => ({
  ...jest.requireActual("@/vendors/spotify/webPlayback.ts"),
  resolveDeviceId: jest.fn(),
  startPlayback: jest.fn(),
}));

const mockUseConnection = useSharedSpotifyConnection as jest.Mock;
const mockResolveDeviceId = resolveDeviceId as jest.Mock;
const mockStartPlayback = startPlayback as jest.Mock;

function fakeConnection(overrides: Record<string, unknown> = {}) {
  return {
    deviceId: "dev-1",
    isReady: true,
    isPaused: true,
    currentUri: null,
    error: null,
    player: {
      togglePlay: jest.fn().mockResolvedValue(undefined),
      setVolume: jest.fn().mockResolvedValue(undefined),
      nextTrack: jest.fn().mockResolvedValue(undefined),
      previousTrack: jest.fn().mockResolvedValue(undefined),
    },
    getValidToken: jest.fn().mockResolvedValue("tok"),
    activate: jest.fn(),
    ...overrides,
  };
}

const TRACKS = [{ id: "track-1" }, { id: "track-2" }, { id: "track-3" }];
const EPISODES = [{ id: "episode-1" }, { id: "episode-2" }];

const flushAsync = async () => {
  for (let i = 0; i < 10; i++) {
    await Promise.resolve();
  }
};

beforeEach(() => {
  mockResolveDeviceId.mockResolvedValue("dev-1");
  mockStartPlayback.mockResolvedValue({ ok: true, status: 204 });
});

afterEach(() => jest.clearAllMocks());

describe("useSpotifyPlayer — track mode", () => {
  it("derives paused state and exposes initial values", () => {
    mockUseConnection.mockReturnValue(fakeConnection({ isPaused: true }));
    const { result } = renderHook(() => useSpotifyPlayer(TRACKS, "track"));

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.isReady).toBe(true);
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.volume).toBe(0.5);
    expect(result.current.error).toBeNull();
  });

  it("isPlaying follows the SDK's paused state", () => {
    mockUseConnection.mockReturnValue(
      fakeConnection({
        isPaused: false,
        currentUri: "spotify:track:track-1",
      }),
    );
    const { result } = renderHook(() => useSpotifyPlayer(TRACKS, "track"));
    expect(result.current.isPlaying).toBe(true);
  });

  it("first togglePlay resolves the live device and starts the track URI", async () => {
    const conn = fakeConnection();
    mockUseConnection.mockReturnValue(conn);

    const { result } = renderHook(() => useSpotifyPlayer(TRACKS, "track"));
    await act(async () => {
      result.current.togglePlay();
      await flushAsync();
    });

    expect(conn.activate).toHaveBeenCalled();
    expect(mockResolveDeviceId).toHaveBeenCalledWith(
      "tok",
      "dev-1",
      "Rik's Portfolio",
    );
    expect(mockStartPlayback).toHaveBeenCalledWith("tok", "dev-1", {
      uris: [
        "spotify:track:track-1",
        "spotify:track:track-2",
        "spotify:track:track-3",
      ],
    });
    expect(result.current.error).toBeNull();
  });

  it("plays on the freshly resolved id when the cached id is stale", async () => {
    mockUseConnection.mockReturnValue(fakeConnection());
    mockResolveDeviceId.mockResolvedValue("live-id");

    const { result } = renderHook(() => useSpotifyPlayer(TRACKS, "track"));
    await act(async () => {
      result.current.togglePlay();
      await flushAsync();
    });

    expect(mockStartPlayback).toHaveBeenCalledWith("tok", "live-id", {
      uris: [
        "spotify:track:track-1",
        "spotify:track:track-2",
        "spotify:track:track-3",
      ],
    });
  });

  it("falls back to the cached id when resolution returns null", async () => {
    mockUseConnection.mockReturnValue(fakeConnection());
    mockResolveDeviceId.mockResolvedValue(null);

    const { result } = renderHook(() => useSpotifyPlayer(TRACKS, "track"));
    await act(async () => {
      result.current.togglePlay();
      await flushAsync();
    });

    expect(mockStartPlayback).toHaveBeenCalledWith("tok", "dev-1", {
      uris: [
        "spotify:track:track-1",
        "spotify:track:track-2",
        "spotify:track:track-3",
      ],
    });
  });

  it("togglePlay toggles the SDK player when one of its tracks is loaded", () => {
    const conn = fakeConnection({
      currentUri: "spotify:track:track-1",
    });
    mockUseConnection.mockReturnValue(conn);

    const { result } = renderHook(() => useSpotifyPlayer(TRACKS, "track"));
    act(() => result.current.togglePlay());

    expect(conn.player.togglePlay).toHaveBeenCalled();
    expect(mockStartPlayback).not.toHaveBeenCalled();
  });

  it("starts music instead of toggling when a podcast is loaded", async () => {
    const conn = fakeConnection({
      currentUri: "spotify:episode:episode-1",
    });
    mockUseConnection.mockReturnValue(conn);

    const { result } = renderHook(() => useSpotifyPlayer(TRACKS, "track"));
    await act(async () => {
      result.current.togglePlay();
      await flushAsync();
    });

    expect(conn.player.togglePlay).not.toHaveBeenCalled();
    expect(mockStartPlayback).toHaveBeenCalledWith("tok", "dev-1", {
      uris: [
        "spotify:track:track-1",
        "spotify:track:track-2",
        "spotify:track:track-3",
      ],
    });
  });

  it("ignores togglePlay while a play request is pending", async () => {
    const conn = fakeConnection();
    // getValidToken never resolves → stays pending.
    conn.getValidToken = jest.fn(() => new Promise<string>(() => undefined));
    mockUseConnection.mockReturnValue(conn);

    const { result } = renderHook(() => useSpotifyPlayer(TRACKS, "track"));
    act(() => result.current.togglePlay());
    act(() => result.current.togglePlay());

    expect(conn.player.togglePlay).not.toHaveBeenCalled();
  });

  it("goToNext moves the selection without starting playback when idle", async () => {
    mockUseConnection.mockReturnValue(fakeConnection());

    const { result } = renderHook(() => useSpotifyPlayer(TRACKS, "track"));
    await act(async () => {
      result.current.goToNext();
      await flushAsync();
    });

    expect(result.current.currentIndex).toBe(1);
    expect(mockStartPlayback).not.toHaveBeenCalled();
  });

  it("goToPrevious wraps around without starting playback when idle", async () => {
    mockUseConnection.mockReturnValue(fakeConnection());

    const { result } = renderHook(() => useSpotifyPlayer(TRACKS, "track"));
    await act(async () => {
      result.current.goToPrevious();
      await flushAsync();
    });

    expect(result.current.currentIndex).toBe(TRACKS.length - 1);
    expect(mockStartPlayback).not.toHaveBeenCalled();
  });

  it("goToNext plays the next track while music is playing", async () => {
    mockUseConnection.mockReturnValue(
      fakeConnection({ isPaused: false, currentUri: "spotify:track:track-1" }),
    );

    const { result } = renderHook(() => useSpotifyPlayer(TRACKS, "track"));
    await act(async () => {
      result.current.goToNext();
      await flushAsync();
    });

    expect(mockStartPlayback).toHaveBeenCalledWith("tok", "dev-1", {
      uris: [
        "spotify:track:track-2",
        "spotify:track:track-3",
        "spotify:track:track-1",
      ],
    });
  });

  it("goToPrevious plays the previous track while music is playing", async () => {
    mockUseConnection.mockReturnValue(
      fakeConnection({ isPaused: false, currentUri: "spotify:track:track-1" }),
    );

    const { result } = renderHook(() => useSpotifyPlayer(TRACKS, "track"));
    await act(async () => {
      result.current.goToPrevious();
      await flushAsync();
    });

    expect(mockStartPlayback).toHaveBeenCalledWith("tok", "dev-1", {
      uris: [
        "spotify:track:track-3",
        "spotify:track:track-1",
        "spotify:track:track-2",
      ],
    });
  });

  it("togglePlay starts the selected track after skipping while paused", async () => {
    // Paused on track-1; skipping while paused moves the selection to track-2
    // without playing, so the next togglePlay must start track-2, not resume.
    const conn = fakeConnection({
      isPaused: true,
      currentUri: "spotify:track:track-1",
    });
    mockUseConnection.mockReturnValue(conn);

    const { result } = renderHook(() => useSpotifyPlayer(TRACKS, "track"));
    act(() => result.current.goToNext());
    expect(result.current.currentIndex).toBe(1);
    expect(mockStartPlayback).not.toHaveBeenCalled();

    await act(async () => {
      result.current.togglePlay();
      await flushAsync();
    });

    expect(conn.player.togglePlay).not.toHaveBeenCalled();
    expect(mockStartPlayback).toHaveBeenCalledWith("tok", "dev-1", {
      uris: [
        "spotify:track:track-2",
        "spotify:track:track-3",
        "spotify:track:track-1",
      ],
    });
  });

  it("surfaces an error when the device is not ready", () => {
    mockUseConnection.mockReturnValue(fakeConnection({ deviceId: null }));

    const { result } = renderHook(() => useSpotifyPlayer(TRACKS, "track"));
    act(() => result.current.togglePlay());

    expect(mockStartPlayback).not.toHaveBeenCalled();
    expect(result.current.error).toMatch(/Premium/);
  });

  it("surfaces the capability message on a non-404 playback failure", async () => {
    mockUseConnection.mockReturnValue(fakeConnection());
    mockStartPlayback.mockResolvedValue({ ok: false, status: 500 });
    const warn = jest.spyOn(console, "warn").mockImplementation(jest.fn());

    const { result } = renderHook(() => useSpotifyPlayer(TRACKS, "track"));
    await act(async () => {
      result.current.togglePlay();
      await flushAsync();
    });

    expect(warn).toHaveBeenCalledWith("Spotify playback error: 500");
    expect(result.current.error).toMatch(/Premium/);
    warn.mockRestore();
  });

  it("surfaces the retry message on a 404 and retries the play on the next press", async () => {
    const conn = fakeConnection();
    mockUseConnection.mockReturnValue(conn);
    mockStartPlayback.mockResolvedValue({ ok: false, status: 404 });
    const warn = jest.spyOn(console, "warn").mockImplementation(jest.fn());

    const { result } = renderHook(() => useSpotifyPlayer(TRACKS, "track"));
    await act(async () => {
      result.current.togglePlay();
      await flushAsync();
    });
    expect(result.current.error).toMatch(/press play again/i);

    mockStartPlayback.mockClear();
    await act(async () => {
      result.current.togglePlay();
      await flushAsync();
    });

    // Re-attempts playback (does NOT toggle an empty SDK player).
    expect(conn.player.togglePlay).not.toHaveBeenCalled();
    expect(mockStartPlayback).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("does nothing when there is no track at the index", () => {
    mockUseConnection.mockReturnValue(fakeConnection());

    const { result } = renderHook(() => useSpotifyPlayer([], "track"));
    act(() => result.current.togglePlay());

    expect(mockStartPlayback).not.toHaveBeenCalled();
  });

  it("setVolume updates state and the SDK player", () => {
    const conn = fakeConnection();
    mockUseConnection.mockReturnValue(conn);

    const { result } = renderHook(() => useSpotifyPlayer(TRACKS, "track"));
    act(() => result.current.setVolume(0.8));

    expect(conn.player.setVolume).toHaveBeenCalledWith(0.8);
    expect(result.current.volume).toBe(0.8);
  });

  it("tolerates a null SDK player for volume and toggle", () => {
    const conn = fakeConnection({
      currentUri: "spotify:track:track-1",
      player: null,
    });
    mockUseConnection.mockReturnValue(conn);

    const { result } = renderHook(() => useSpotifyPlayer(TRACKS, "track"));
    expect(() => {
      act(() => result.current.togglePlay());
      act(() => result.current.setVolume(0.3));
    }).not.toThrow();
    expect(result.current.volume).toBe(0.3);
  });

  it("passes through the connection error when there is no play error", () => {
    mockUseConnection.mockReturnValue(
      fakeConnection({ error: "connection boom" }),
    );
    const { result } = renderHook(() => useSpotifyPlayer(TRACKS, "track"));
    expect(result.current.error).toBe("connection boom");
  });
});

describe("useSpotifyPlayer — episode mode", () => {
  it("sends a single episode URI (not a rotated list)", async () => {
    mockUseConnection.mockReturnValue(fakeConnection());

    const { result } = renderHook(() => useSpotifyPlayer(EPISODES, "episode"));
    await act(async () => {
      result.current.togglePlay();
      await flushAsync();
    });

    expect(mockStartPlayback).toHaveBeenCalledWith("tok", "dev-1", {
      uris: ["spotify:episode:episode-1"],
    });
  });

  it("detects playback state from the episode URI scheme", () => {
    mockUseConnection.mockReturnValue(
      fakeConnection({
        isPaused: false,
        currentUri: "spotify:episode:episode-2",
      }),
    );

    const { result } = renderHook(() => useSpotifyPlayer(EPISODES, "episode"));
    expect(result.current.isPlaying).toBe(true);
    expect(result.current.currentIndex).toBe(1);
  });

  it("plays the selected episode after skipping while playing", async () => {
    mockUseConnection.mockReturnValue(
      fakeConnection({
        isPaused: false,
        currentUri: "spotify:episode:episode-1",
      }),
    );

    const { result } = renderHook(() => useSpotifyPlayer(EPISODES, "episode"));
    await act(async () => {
      result.current.goToNext();
      await flushAsync();
    });

    expect(mockStartPlayback).toHaveBeenCalledWith("tok", "dev-1", {
      uris: ["spotify:episode:episode-2"],
    });
  });

  it("surfaces a retry message when the token request rejects", async () => {
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
    mockUseConnection.mockReturnValue(
      fakeConnection({
        getValidToken: jest.fn().mockRejectedValue(new Error("token 500")),
      }),
    );

    const { result } = renderHook(() => useSpotifyPlayer(TRACKS, "track"));
    await act(async () => {
      result.current.togglePlay();
      await flushAsync();
    });

    expect(result.current.error).toBe(PLAYBACK_RETRY_MESSAGE);
    expect(mockStartPlayback).not.toHaveBeenCalled();
  });

  describe("playlist mode", () => {
    const PLAYLIST = [{ id: "pl-1" }];
    const NOW_PLAYING = {
      uri: "spotify:track:abc",
      name: "Song",
      artist: "Artist",
      albumName: "Album",
      imageUrl: null,
    };
    const playingPlaylist = (overrides: Record<string, unknown> = {}) =>
      fakeConnection({
        isPaused: false,
        currentUri: NOW_PLAYING.uri,
        contextUri: "spotify:playlist:pl-1",
        nowPlaying: NOW_PLAYING,
        player: {
          togglePlay: jest.fn().mockResolvedValue(undefined),
          setVolume: jest.fn().mockResolvedValue(undefined),
          nextTrack: jest.fn().mockResolvedValue(undefined),
          previousTrack: jest.fn().mockResolvedValue(undefined),
        },
        ...overrides,
      });

    it("starts the whole playlist via context_uri", async () => {
      mockUseConnection.mockReturnValue(fakeConnection());

      const { result } = renderHook(() =>
        useSpotifyPlayer(PLAYLIST, "playlist"),
      );
      await act(async () => {
        result.current.togglePlay();
        await flushAsync();
      });

      expect(mockStartPlayback).toHaveBeenCalledWith("tok", "dev-1", {
        context_uri: "spotify:playlist:pl-1",
      });
      expect(result.current.nowPlaying).toBeNull();
    });

    it("is playing by its context and exposes the SDK's track", () => {
      const connection = playingPlaylist();
      mockUseConnection.mockReturnValue(connection);

      const { result } = renderHook(() =>
        useSpotifyPlayer(PLAYLIST, "playlist"),
      );

      expect(result.current.isPlaying).toBe(true);
      expect(result.current.nowPlaying).toEqual(NOW_PLAYING);

      act(() => result.current.togglePlay());
      expect(connection.player.togglePlay).toHaveBeenCalled();
      expect(mockStartPlayback).not.toHaveBeenCalled();
    });

    it("skips through the SDK while the playlist is loaded", () => {
      const connection = playingPlaylist();
      mockUseConnection.mockReturnValue(connection);

      const { result } = renderHook(() =>
        useSpotifyPlayer(PLAYLIST, "playlist"),
      );
      act(() => result.current.goToNext());
      act(() => result.current.goToPrevious());

      expect(connection.player.nextTrack).toHaveBeenCalledTimes(1);
      expect(connection.player.previousTrack).toHaveBeenCalledTimes(1);
      expect(mockStartPlayback).not.toHaveBeenCalled();
    });

    it("ignores skips before the playlist is loaded", () => {
      const connection = playingPlaylist({
        contextUri: "spotify:playlist:other",
      });
      mockUseConnection.mockReturnValue(connection);

      const { result } = renderHook(() =>
        useSpotifyPlayer(PLAYLIST, "playlist"),
      );
      act(() => result.current.goToNext());
      act(() => result.current.goToPrevious());

      expect(result.current.isPlaying).toBe(false);
      expect(result.current.nowPlaying).toBeNull();
      expect(connection.player.nextTrack).not.toHaveBeenCalled();
      expect(connection.player.previousTrack).not.toHaveBeenCalled();
    });
  });
});
