/**
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";

import { useSpotifyPlayer } from "./index.ts";

type ReadyCallback = (data: { device_id: string }) => void;
type StateCallback = (state: { paused: boolean } | null) => void;

function buildMockPlayer() {
  let readyCb: ReadyCallback | null = null;
  let stateCb: StateCallback | null = null;

  const player = {
    connect: jest.fn().mockResolvedValue(true),
    disconnect: jest.fn(),
    togglePlay: jest.fn().mockResolvedValue(undefined),
    nextTrack: jest.fn().mockResolvedValue(undefined),
    previousTrack: jest.fn().mockResolvedValue(undefined),
    setVolume: jest.fn().mockResolvedValue(undefined),
    addListener: jest.fn().mockImplementation((event: string, cb: unknown) => {
      if (event === "ready") {
        readyCb = cb as ReadyCallback;
      }
      if (event === "player_state_changed") {
        stateCb = cb as StateCallback;
      }
      return true;
    }),
    removeListener: jest.fn().mockReturnValue(true),
    _fireReady: (deviceId: string) => readyCb?.({ device_id: deviceId }),
    _fireState: (state: { paused: boolean } | null) => stateCb?.(state),
  };
  return player;
}

const ITEMS = [{ id: "track-1" }, { id: "track-2" }];

function mockTokenFetch() {
  // jsdom doesn't expose globalThis.fetch as spyable, and doesn't have Response in scope —
  // assign a plain mock directly onto global instead.
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ token: "sdk-token" }),
  }) as typeof global.fetch;
}

function setup(items = ITEMS) {
  mockTokenFetch();

  const mockPlayer = buildMockPlayer();

  // Pre-populate window.Spotify so the hook uses it immediately (no script load).
  Object.defineProperty(window, "Spotify", {
    value: { Player: jest.fn().mockImplementation(() => mockPlayer) },
    writable: true,
    configurable: true,
  });

  const { result, unmount } = renderHook(() => useSpotifyPlayer(items));

  return { result, mockPlayer, unmount };
}

async function waitForInit(mockPlayer: ReturnType<typeof buildMockPlayer>) {
  await act(async () => {
    await Promise.resolve();
  });
  act(() => {
    mockPlayer._fireReady("device-abc");
  });
}

describe("useSpotifyPlayer", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("starts with isPlaying false and isReady false", () => {
    const { result } = setup();
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.isReady).toBe(false);
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.volume).toBe(0.5);
  });

  it("becomes isReady after the SDK fires the ready event", async () => {
    const { result, mockPlayer } = setup();
    await waitForInit(mockPlayer);
    expect(result.current.isReady).toBe(true);
  });

  it("togglePlay starts playback on the first press when ready", async () => {
    const { result, mockPlayer } = setup();
    await waitForInit(mockPlayer);

    // Override fetch for the startPlayback call
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: true, status: 204 }) as typeof global.fetch;

    await act(async () => {
      result.current.togglePlay();
      await Promise.resolve();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("device_id=device-abc"),
      expect.objectContaining({ method: "PUT" }),
    );
  });

  it("calls playerRef.togglePlay on subsequent presses", async () => {
    const { result, mockPlayer } = setup();
    await waitForInit(mockPlayer);

    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: true, status: 204 }) as typeof global.fetch;

    // First press starts playback
    await act(async () => {
      result.current.togglePlay();
      await Promise.resolve();
    });

    // Second press should call player.togglePlay
    act(() => {
      result.current.togglePlay();
    });

    expect(mockPlayer.togglePlay).toHaveBeenCalled();
  });

  it("updates isPlaying via player_state_changed events", async () => {
    const { result, mockPlayer } = setup();
    await waitForInit(mockPlayer);

    act(() => {
      mockPlayer._fireState({ paused: false });
    });
    expect(result.current.isPlaying).toBe(true);

    act(() => {
      mockPlayer._fireState({ paused: true });
    });
    expect(result.current.isPlaying).toBe(false);
  });

  it("ignores null player_state_changed events", async () => {
    const { result, mockPlayer } = setup();
    await waitForInit(mockPlayer);

    act(() => {
      mockPlayer._fireState(null);
    });

    expect(result.current.isPlaying).toBe(false);
  });

  it("goToNext advances the index and starts playback", async () => {
    const { result, mockPlayer } = setup();
    await waitForInit(mockPlayer);

    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: true, status: 204 }) as typeof global.fetch;

    await act(async () => {
      result.current.goToNext();
      await Promise.resolve();
    });

    expect(result.current.currentIndex).toBe(1);
  });

  it("goToPrevious wraps around to the last item from index 0", async () => {
    const { result, mockPlayer } = setup();
    await waitForInit(mockPlayer);

    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: true, status: 204 }) as typeof global.fetch;

    await act(async () => {
      result.current.goToPrevious();
      await Promise.resolve();
    });

    expect(result.current.currentIndex).toBe(1);
  });

  it("setVolume updates the volume state and calls player.setVolume", async () => {
    const { result, mockPlayer } = setup();
    await waitForInit(mockPlayer);

    act(() => {
      result.current.setVolume(0.8);
    });

    expect(result.current.volume).toBe(0.8);
    expect(mockPlayer.setVolume).toHaveBeenCalledWith(0.8);
  });

  it("disconnects the player on unmount", async () => {
    const { mockPlayer, unmount } = setup();
    await waitForInit(mockPlayer);

    unmount();

    expect(mockPlayer.disconnect).toHaveBeenCalled();
  });

  it("does nothing when items list is empty", () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock as typeof global.fetch;
    const { result } = renderHook(() => useSpotifyPlayer([]));
    expect(result.current.isReady).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("loads the SDK script and fires onSpotifyWebPlaybackSDKReady when window.Spotify is absent", async () => {
    mockTokenFetch();

    Object.defineProperty(window, "Spotify", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const mockPlayer = buildMockPlayer();

    const { result } = renderHook(() => useSpotifyPlayer(ITEMS));

    await act(async () => {
      await Promise.resolve();
    });

    const scripts = document.querySelectorAll("script");
    const sdkScript = Array.from(scripts).find((s) =>
      s.src.includes("spotify-player"),
    );
    expect(sdkScript).toBeTruthy();

    // Simulate the SDK firing the ready callback
    act(() => {
      Object.defineProperty(window, "Spotify", {
        value: { Player: jest.fn().mockImplementation(() => mockPlayer) },
        writable: true,
        configurable: true,
      });
      window.onSpotifyWebPlaybackSDKReady();
    });

    act(() => {
      mockPlayer._fireReady("device-xyz");
    });
    expect(result.current.isReady).toBe(true);
  });

  it("does nothing in goToNext when deviceId is not ready yet", async () => {
    const { result } = setup();
    // Do NOT call waitForInit — deviceId is null

    const fetchSpy = jest.fn();
    global.fetch = fetchSpy as typeof global.fetch;

    act(() => {
      result.current.goToNext();
    });

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns early from togglePlay while playAtIndex is pending", async () => {
    const { result, mockPlayer } = setup();
    await waitForInit(mockPlayer);

    // Make startPlayback hang — fetch never resolves
    const hang = (): void => undefined;
    global.fetch = jest
      .fn()
      .mockReturnValue(new Promise<Response>(hang)) as typeof global.fetch;

    // First togglePlay: starts playAtIndex, sets isPendingRef = true
    act(() => {
      result.current.togglePlay();
    });

    // Second togglePlay while isPending = true → returns early
    act(() => {
      result.current.togglePlay();
    });

    // togglePlay() on the player should not have been called (returned early both times)
    expect(mockPlayer.togglePlay).not.toHaveBeenCalled();
  });

  it("calls the getOAuthToken callback with a fresh token", async () => {
    const { mockPlayer } = setup();
    await waitForInit(mockPlayer);

    const PlayerMock = (window.Spotify as typeof window.Spotify)
      .Player as jest.Mock;
    const playerOptions = PlayerMock.mock.calls[0]?.[0] as {
      getOAuthToken: (cb: (token: string) => void) => void;
    };

    const cb = jest.fn();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: "refreshed-token" }),
    }) as typeof global.fetch;

    await act(async () => {
      playerOptions.getOAuthToken(cb);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(cb).toHaveBeenCalledWith("refreshed-token");
  });
});
