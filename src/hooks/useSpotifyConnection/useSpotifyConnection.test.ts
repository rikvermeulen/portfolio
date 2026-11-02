/**
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";

import { useSpotifyConnection } from "./index.ts";

function buildMockPlayer() {
  const listeners: Record<string, (data: unknown) => void> = {};
  return {
    connect: jest.fn().mockResolvedValue(true),
    disconnect: jest.fn(),
    togglePlay: jest.fn().mockResolvedValue(undefined),
    pause: jest.fn().mockResolvedValue(undefined),
    resume: jest.fn().mockResolvedValue(undefined),
    setVolume: jest.fn().mockResolvedValue(undefined),
    activateElement: jest.fn().mockResolvedValue(undefined),
    addListener: jest.fn((event: string, cb: (data: unknown) => void) => {
      listeners[event] = cb;
      return true;
    }),
    removeListener: jest.fn().mockReturnValue(true),
    _fire: (event: string, data?: unknown) => listeners[event]?.(data),
  };
}

type MockPlayer = ReturnType<typeof buildMockPlayer>;

function mockToken(token = "tok", expiresIn = 3600) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ token, expiresIn }),
  }) as typeof global.fetch;
}

function installSpotify(player: MockPlayer) {
  const PlayerMock = jest.fn().mockImplementation(() => player);
  Object.defineProperty(window, "Spotify", {
    value: { Player: PlayerMock },
    writable: true,
    configurable: true,
  });
  return PlayerMock;
}

const flush = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });

afterEach(() => {
  jest.clearAllMocks();
  delete (window as { Spotify?: unknown }).Spotify;
  (window as Window).onSpotifyWebPlaybackSDKReady =
    undefined as unknown as () => void;
});

describe("useSpotifyConnection", () => {
  it("does nothing when disabled", async () => {
    mockToken();
    const player = buildMockPlayer();
    const PlayerMock = installSpotify(player);

    const { result } = renderHook(() => useSpotifyConnection("Dev", false));
    await flush();

    expect(global.fetch).not.toHaveBeenCalled();
    expect(PlayerMock).not.toHaveBeenCalled();
    expect(result.current.isReady).toBe(false);
    expect(result.current.deviceId).toBeNull();
    expect(result.current.player).toBeNull();
  });

  it("creates the player with the given name and connects", async () => {
    mockToken();
    const player = buildMockPlayer();
    const PlayerMock = installSpotify(player);

    const { result } = renderHook(() =>
      useSpotifyConnection("My Device", true),
    );
    await flush();

    expect(PlayerMock.mock.calls[0]?.[0]).toMatchObject({ name: "My Device" });
    expect(player.connect).toHaveBeenCalled();
    expect(result.current.player).toBe(player);

    await act(async () => {
      player._fire("ready", { device_id: "dev-abc" });
    });

    expect(result.current.deviceId).toBe("dev-abc");
    expect(result.current.isReady).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("feeds a fresh token to the SDK's getOAuthToken callback", async () => {
    mockToken("fresh-token");
    const player = buildMockPlayer();
    const PlayerMock = installSpotify(player);

    renderHook(() => useSpotifyConnection("Dev", true));
    await flush();

    const options = PlayerMock.mock.calls[0]?.[0] as {
      getOAuthToken: (cb: (t: string) => void) => void;
    };
    const cb = jest.fn();
    await act(async () => {
      options.getOAuthToken(cb);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(cb).toHaveBeenCalledWith("fresh-token");
  });

  it("warns instead of rejecting when the SDK's token refresh fails", async () => {
    mockToken();
    const player = buildMockPlayer();
    const PlayerMock = installSpotify(player);
    const warn = jest
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    renderHook(() => useSpotifyConnection("Dev", true));
    await flush();

    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: false, status: 500 }) as typeof global.fetch;
    const options = PlayerMock.mock.calls[0]?.[0] as {
      getOAuthToken: (cb: (t: string) => void) => void;
    };
    const cb = jest.fn();
    await act(async () => {
      options.getOAuthToken(cb);
      await flush();
    });

    expect(cb).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("Spotify token refresh failed"),
    );
  });

  it("mirrors player_state_changed.paused and ignores null state", async () => {
    mockToken();
    const player = buildMockPlayer();
    installSpotify(player);

    const { result } = renderHook(() => useSpotifyConnection("Dev", true));
    await flush();

    act(() =>
      player._fire("player_state_changed", {
        paused: false,
        track_window: {
          current_track: { uri: "spotify:track:track-1" },
        },
      }),
    );
    expect(result.current.isPaused).toBe(false);
    expect(result.current.currentUri).toBe("spotify:track:track-1");

    act(() => player._fire("player_state_changed", { paused: true }));
    expect(result.current.isPaused).toBe(true);

    act(() => player._fire("player_state_changed", null));
    expect(result.current.isPaused).toBe(true);
  });

  it("clears the device on not_ready", async () => {
    mockToken();
    const player = buildMockPlayer();
    installSpotify(player);

    const { result } = renderHook(() => useSpotifyConnection("Dev", true));
    await flush();

    act(() => player._fire("ready", { device_id: "dev-abc" }));
    expect(result.current.isReady).toBe(true);

    act(() => player._fire("not_ready", { device_id: "dev-abc" }));
    expect(result.current.deviceId).toBeNull();
    expect(result.current.isReady).toBe(false);
  });

  it("warns when autoplay fails", async () => {
    mockToken();
    const player = buildMockPlayer();
    installSpotify(player);
    const warn = jest.spyOn(console, "warn").mockImplementation(jest.fn());

    renderHook(() => useSpotifyConnection("Dev", true));
    await flush();

    act(() => player._fire("autoplay_failed"));
    expect(warn).toHaveBeenCalledWith(
      "Spotify autoplay failed: user gesture required",
    );
    warn.mockRestore();
  });

  it("surfaces a user-facing error on SDK error events", async () => {
    mockToken();
    const player = buildMockPlayer();
    installSpotify(player);
    const warn = jest.spyOn(console, "warn").mockImplementation(jest.fn());

    const { result } = renderHook(() => useSpotifyConnection("Dev", true));
    await flush();

    act(() => player._fire("initialization_error", { message: "no DRM" }));
    expect(warn).toHaveBeenCalledWith("Spotify init error: no DRM");
    expect(result.current.error).toMatch(/Premium/);

    // null payload exercises the "unknown" fallback branch.
    act(() => player._fire("account_error", null));
    expect(warn).toHaveBeenCalledWith("Spotify account error: unknown");
    warn.mockRestore();
  });

  it("logs playback errors without surfacing the capability message", async () => {
    mockToken();
    const player = buildMockPlayer();
    installSpotify(player);
    const warn = jest.spyOn(console, "warn").mockImplementation(jest.fn());

    const { result } = renderHook(() => useSpotifyConnection("Dev", true));
    await flush();

    act(() =>
      player._fire("playback_error", { message: "no list was loaded" }),
    );
    expect(warn).toHaveBeenCalledWith(
      "Spotify playback error: no list was loaded",
    );
    // Operational, not a capability failure → no user-facing error.
    expect(result.current.error).toBeNull();
    warn.mockRestore();
  });

  it("returns a cached token until it expires", async () => {
    mockToken("tok", 3600);
    const player = buildMockPlayer();
    installSpotify(player);

    const { result } = renderHook(() => useSpotifyConnection("Dev", true));
    await flush();

    const callsAfterInit = (global.fetch as jest.Mock).mock.calls.length;
    await act(async () => {
      await expect(result.current.getValidToken()).resolves.toBe("tok");
    });
    // Still valid → no extra fetch.
    expect((global.fetch as jest.Mock).mock.calls.length).toBe(callsAfterInit);
  });

  it("refreshes the token once it has expired", async () => {
    // expiresIn below the 60s early-refresh window → already expired.
    mockToken("tok", 30);
    const player = buildMockPlayer();
    installSpotify(player);

    const { result } = renderHook(() => useSpotifyConnection("Dev", true));
    await flush();

    const callsAfterInit = (global.fetch as jest.Mock).mock.calls.length;
    await act(async () => {
      await result.current.getValidToken();
    });
    expect((global.fetch as jest.Mock).mock.calls.length).toBe(
      callsAfterInit + 1,
    );
  });

  it("activate() is a no-op before the player exists and calls activateElement after", async () => {
    mockToken();
    const player = buildMockPlayer();
    installSpotify(player);

    const { result } = renderHook(() => useSpotifyConnection("Dev", true));

    // Before init resolves, the player ref is null — must not throw.
    act(() => result.current.activate());
    expect(player.activateElement).not.toHaveBeenCalled();

    await flush();
    act(() => result.current.activate());
    expect(player.activateElement).toHaveBeenCalled();
  });

  it("disconnects the player on unmount", async () => {
    mockToken();
    const player = buildMockPlayer();
    installSpotify(player);

    const { unmount } = renderHook(() => useSpotifyConnection("Dev", true));
    await flush();

    unmount();
    expect(player.disconnect).toHaveBeenCalled();
  });

  it("aborts initialization when unmounted before the SDK is ready", async () => {
    mockToken();
    const player = buildMockPlayer();
    const PlayerMock = installSpotify(player);

    const { unmount } = renderHook(() => useSpotifyConnection("Dev", true));
    // Unmount before the awaited token/SDK resolve → cancelled short-circuit.
    unmount();
    await flush();

    expect(PlayerMock).not.toHaveBeenCalled();
  });

  it("warns when initialization fails", async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(new Error("network error")) as typeof global.fetch;
    const warn = jest.spyOn(console, "warn").mockImplementation(jest.fn());

    renderHook(() => useSpotifyConnection("Dev", true));
    await flush();

    expect(warn).toHaveBeenCalledWith(
      "Spotify init failed: Error: network error",
    );
    warn.mockRestore();
  });

  it("ignores init failures after unmount", async () => {
    let rejectFetch!: (error: Error) => void;
    global.fetch = jest.fn().mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          rejectFetch = reject;
        }),
    ) as typeof global.fetch;
    const warn = jest.spyOn(console, "warn").mockImplementation(jest.fn());

    const { unmount } = renderHook(() => useSpotifyConnection("Dev", true));
    unmount();

    await act(async () => {
      rejectFetch(new Error("network error"));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(warn).not.toHaveBeenCalledWith(
      expect.stringContaining("Spotify init failed"),
    );
    warn.mockRestore();
  });
});
