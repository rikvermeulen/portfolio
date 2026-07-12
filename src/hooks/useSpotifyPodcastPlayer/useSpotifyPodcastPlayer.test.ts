/**
 * @jest-environment jsdom
 */

import { useSharedSpotifyConnection } from "@/contexts/SpotifyConnectionContext/index.ts";
import {
  resolveDeviceId,
  startPlaybackUris,
} from "@/lib/spotify/webPlayback.ts";
import { act, renderHook } from "@testing-library/react";

import { useSpotifyPodcastPlayer } from "./index.ts";

// jest.mock is hoisted above the imports above, so both modules are mocked.
jest.mock("@/contexts/SpotifyConnectionContext/index.ts", () => ({
  useSharedSpotifyConnection: jest.fn(),
}));
jest.mock("@/lib/spotify/webPlayback.ts", () => ({
  ...jest.requireActual("@/lib/spotify/webPlayback.ts"),
  resolveDeviceId: jest.fn(),
  startPlaybackUris: jest.fn(),
}));

const mockUseConnection = useSharedSpotifyConnection as jest.Mock;
const mockResolveDeviceId = resolveDeviceId as jest.Mock;
const mockStartPlayback = startPlaybackUris as jest.Mock;

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
    },
    getValidToken: jest.fn().mockResolvedValue("tok"),
    activate: jest.fn(),
    ...overrides,
  };
}

const EPISODES = [{ id: "ep-1" }, { id: "ep-2" }, { id: "ep-3" }];

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

describe("useSpotifyPodcastPlayer", () => {
  it("derives paused state and exposes initial values", () => {
    mockUseConnection.mockReturnValue(fakeConnection({ isPaused: true }));
    const { result } = renderHook(() => useSpotifyPodcastPlayer(EPISODES));

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
        currentUri: "spotify:episode:ep-1",
      }),
    );
    const { result } = renderHook(() => useSpotifyPodcastPlayer(EPISODES));
    expect(result.current.isPlaying).toBe(true);
  });

  it("first togglePlay resolves the live device and starts the episode URI (never a context)", async () => {
    const conn = fakeConnection();
    mockUseConnection.mockReturnValue(conn);

    const { result } = renderHook(() => useSpotifyPodcastPlayer(EPISODES));
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
    expect(mockStartPlayback).toHaveBeenCalledWith("tok", "dev-1", [
      "spotify:episode:ep-1",
    ]);
    expect(result.current.error).toBeNull();
  });

  it("plays on the freshly resolved id when the cached id is stale", async () => {
    mockUseConnection.mockReturnValue(fakeConnection());
    mockResolveDeviceId.mockResolvedValue("live-id");

    const { result } = renderHook(() => useSpotifyPodcastPlayer(EPISODES));
    await act(async () => {
      result.current.togglePlay();
      await flushAsync();
    });

    expect(mockStartPlayback).toHaveBeenCalledWith("tok", "live-id", [
      "spotify:episode:ep-1",
    ]);
  });

  it("falls back to the cached id when resolution returns null", async () => {
    mockUseConnection.mockReturnValue(fakeConnection());
    mockResolveDeviceId.mockResolvedValue(null);

    const { result } = renderHook(() => useSpotifyPodcastPlayer(EPISODES));
    await act(async () => {
      result.current.togglePlay();
      await flushAsync();
    });

    expect(mockStartPlayback).toHaveBeenCalledWith("tok", "dev-1", [
      "spotify:episode:ep-1",
    ]);
  });

  it("togglePlay toggles the SDK player when one of its episodes is loaded", () => {
    const conn = fakeConnection({
      currentUri: "spotify:episode:ep-1",
    });
    mockUseConnection.mockReturnValue(conn);

    const { result } = renderHook(() => useSpotifyPodcastPlayer(EPISODES));
    act(() => result.current.togglePlay());

    expect(conn.player.togglePlay).toHaveBeenCalled();
    expect(mockStartPlayback).not.toHaveBeenCalled();
  });

  it("starts the podcast instead of toggling when music is loaded", async () => {
    const conn = fakeConnection({
      currentUri: "spotify:track:track-1",
    });
    mockUseConnection.mockReturnValue(conn);

    const { result } = renderHook(() => useSpotifyPodcastPlayer(EPISODES));
    await act(async () => {
      result.current.togglePlay();
      await flushAsync();
    });

    expect(conn.player.togglePlay).not.toHaveBeenCalled();
    expect(mockStartPlayback).toHaveBeenCalledWith("tok", "dev-1", [
      "spotify:episode:ep-1",
    ]);
  });

  it("ignores togglePlay while a play request is pending", async () => {
    const conn = fakeConnection();
    conn.getValidToken = jest.fn(() => new Promise<string>(() => undefined));
    mockUseConnection.mockReturnValue(conn);

    const { result } = renderHook(() => useSpotifyPodcastPlayer(EPISODES));
    act(() => result.current.togglePlay());
    act(() => result.current.togglePlay());

    expect(conn.player.togglePlay).not.toHaveBeenCalled();
  });

  it("goToNext advances the index", async () => {
    mockUseConnection.mockReturnValue(fakeConnection());

    const { result } = renderHook(() => useSpotifyPodcastPlayer(EPISODES));
    await act(async () => {
      result.current.goToNext();
      await flushAsync();
    });

    expect(result.current.currentIndex).toBe(1);
  });

  it("goToPrevious wraps around to the last episode", async () => {
    mockUseConnection.mockReturnValue(fakeConnection());

    const { result } = renderHook(() => useSpotifyPodcastPlayer(EPISODES));
    await act(async () => {
      result.current.goToPrevious();
      await flushAsync();
    });

    expect(result.current.currentIndex).toBe(EPISODES.length - 1);
  });

  it("surfaces an error when the device is not ready", () => {
    mockUseConnection.mockReturnValue(fakeConnection({ deviceId: null }));

    const { result } = renderHook(() => useSpotifyPodcastPlayer(EPISODES));
    act(() => result.current.togglePlay());

    expect(mockStartPlayback).not.toHaveBeenCalled();
    expect(result.current.error).toMatch(/Premium/);
  });

  it("surfaces the capability message on a non-404 playback failure", async () => {
    mockUseConnection.mockReturnValue(fakeConnection());
    mockStartPlayback.mockResolvedValue({ ok: false, status: 500 });
    const warn = jest.spyOn(console, "warn").mockImplementation(jest.fn());

    const { result } = renderHook(() => useSpotifyPodcastPlayer(EPISODES));
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

    const { result } = renderHook(() => useSpotifyPodcastPlayer(EPISODES));
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

    expect(conn.player.togglePlay).not.toHaveBeenCalled();
    expect(mockStartPlayback).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("does nothing when there is no episode at the index", () => {
    mockUseConnection.mockReturnValue(fakeConnection());

    const { result } = renderHook(() => useSpotifyPodcastPlayer([]));
    act(() => result.current.togglePlay());

    expect(mockStartPlayback).not.toHaveBeenCalled();
  });

  it("setVolume updates state and the SDK player", () => {
    const conn = fakeConnection();
    mockUseConnection.mockReturnValue(conn);

    const { result } = renderHook(() => useSpotifyPodcastPlayer(EPISODES));
    act(() => result.current.setVolume(0.8));

    expect(conn.player.setVolume).toHaveBeenCalledWith(0.8);
    expect(result.current.volume).toBe(0.8);
  });

  it("tolerates a null SDK player for volume and toggle", () => {
    const conn = fakeConnection({
      currentUri: "spotify:episode:ep-1",
      player: null,
    });
    mockUseConnection.mockReturnValue(conn);

    const { result } = renderHook(() => useSpotifyPodcastPlayer(EPISODES));
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
    const { result } = renderHook(() => useSpotifyPodcastPlayer(EPISODES));
    expect(result.current.error).toBe("connection boom");
  });
});
