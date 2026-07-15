/**
 * @jest-environment jsdom
 */

import {
  fetchAccessToken,
  loadWebPlaybackSdk,
  PLAYBACK_RETRY_MESSAGE,
  PLAYBACK_UNAVAILABLE_MESSAGE,
  reportDiagnostic,
  reportEnvironmentDiagnostics,
  resolveDeviceId,
  startPlaybackUris,
  WEB_PLAYBACK_SDK_SRC,
} from "./webPlayback.ts";

const SDK_SELECTOR = `script[src="${WEB_PLAYBACK_SDK_SRC}"]`;

afterEach(() => {
  jest.clearAllMocks();
  document.querySelectorAll(SDK_SELECTOR).forEach((s) => s.remove());
  (window as Window).onSpotifyWebPlaybackSDKReady =
    undefined as unknown as () => void;
  delete (window as { Spotify?: unknown }).Spotify;
  delete (globalThis as { Response?: unknown }).Response;
});

it("exposes user-facing playback messages", () => {
  expect(PLAYBACK_UNAVAILABLE_MESSAGE).toMatch(/Premium/);
  expect(PLAYBACK_RETRY_MESSAGE).toMatch(/press play again/i);
});

describe("fetchAccessToken", () => {
  it("returns the token and an expiry derived from expiresIn", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: "abc", expiresIn: 3600 }),
    }) as typeof global.fetch;

    const before = Date.now();
    const { token, expiresAt } = await fetchAccessToken();

    expect(token).toBe("abc");
    // Refreshes a minute early: (3600 - 60) * 1000 ms out.
    expect(expiresAt).toBeGreaterThanOrEqual(before + (3600 - 60) * 1000);
  });

  it("throws when the token route responds with a non-ok status", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 504,
      json: async () => ({ error: "Token endpoint unreachable" }),
    }) as typeof global.fetch;

    await expect(fetchAccessToken()).rejects.toThrow(/504/);
  });

  it("falls back to a 1h TTL when expiresIn is missing", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: "abc" }),
    }) as typeof global.fetch;

    const before = Date.now();
    const { expiresAt } = await fetchAccessToken();

    expect(expiresAt).toBeGreaterThanOrEqual(before + (3600 - 60) * 1000);
  });
});

describe("loadWebPlaybackSdk", () => {
  it("resolves immediately when window.Spotify already exists", async () => {
    (window as { Spotify?: unknown }).Spotify = { Player: jest.fn() };

    await expect(loadWebPlaybackSdk()).resolves.toBeUndefined();
    expect(document.querySelector(SDK_SELECTOR)).toBeNull();
  });

  it("injects the script once and resolves when the SDK fires ready", async () => {
    const promise = loadWebPlaybackSdk();

    expect(document.querySelector(SDK_SELECTOR)).toBeTruthy();

    window.onSpotifyWebPlaybackSDKReady();
    await expect(promise).resolves.toBeUndefined();
  });

  it("composes with an existing ready handler and injects only one script", async () => {
    const previous = jest.fn();
    window.onSpotifyWebPlaybackSDKReady = previous;

    const first = loadWebPlaybackSdk();
    const second = loadWebPlaybackSdk();

    expect(document.querySelectorAll(SDK_SELECTOR).length).toBe(1);

    window.onSpotifyWebPlaybackSDKReady();
    await Promise.all([first, second]);

    expect(previous).toHaveBeenCalled();
  });
});

describe("loadWebPlaybackSdk mock seam (?spotify-mock)", () => {
  afterEach(() => {
    window.history.replaceState({}, "", "/");
  });

  it("installs the stub SDK instead of the script when requested", async () => {
    window.history.replaceState({}, "", "/?spotify-mock");

    await expect(loadWebPlaybackSdk()).resolves.toBeUndefined();

    expect(window.Spotify).toBeDefined();
    expect(document.querySelector(SDK_SELECTOR)).toBeNull();

    // The stub player fires `ready` with a deliberately stale id.
    const player = new window.Spotify!.Player({
      name: "Test Tile",
      getOAuthToken: (cb) => cb("tok"),
      volume: 0.5,
    });
    const readyData = await new Promise<unknown>((resolve) => {
      player.addListener("ready", resolve);
      player.connect();
    });
    expect(readyData).toEqual({ device_id: "mock-stale-Test Tile" });

    const stateChanged = jest.fn();
    player.addListener("player_state_changed", stateChanged);
    global.fetch = jest.fn() as typeof global.fetch;
    Object.defineProperty(globalThis, "Response", {
      configurable: true,
      value: jest.fn((_body, init: { status: number }) => ({
        ok: init.status >= 200 && init.status < 300,
        status: init.status,
      })),
    });

    const playResponse = await startPlaybackUris("tok", "mock-device", [
      "spotify:track:track-1",
    ]);
    expect(playResponse.status).toBe(204);
    expect(global.fetch).not.toHaveBeenCalled();
    expect(stateChanged).toHaveBeenLastCalledWith(
      expect.objectContaining({
        paused: false,
        track_window: {
          current_track: { uri: "spotify:track:track-1" },
        },
      }),
    );

    // Remaining stub controls emit the same state changes as the real SDK.
    expect(player.addListener("ready", () => undefined)).toBe(true);
    expect(player.removeListener("ready")).toBe(true);
    await expect(player.togglePlay()).resolves.toBeUndefined();
    expect(stateChanged).toHaveBeenLastCalledWith(
      expect.objectContaining({ paused: true }),
    );
    await expect(player.pause()).resolves.toBeUndefined();
    await expect(player.resume()).resolves.toBeUndefined();
    expect(stateChanged).toHaveBeenLastCalledWith(
      expect.objectContaining({ paused: false }),
    );
    await expect(player.setVolume(0.3)).resolves.toBeUndefined();
    await expect(player.activateElement()).resolves.toBeUndefined();
    expect(player.disconnect()).toBeUndefined();

    await expect(
      startPlaybackUris("tok", "mock-device", []),
    ).resolves.toHaveProperty("status", 204);
  });

  it("injects the real script when the flag is absent", async () => {
    const promise = loadWebPlaybackSdk();
    expect(window.Spotify).toBeUndefined();
    expect(document.querySelector(SDK_SELECTOR)).toBeTruthy();
    window.onSpotifyWebPlaybackSDKReady();
    await expect(promise).resolves.toBeUndefined();
  });
});

describe("diagnostics (?spotify-diag)", () => {
  afterEach(() => {
    window.history.replaceState({}, "", "/");
    delete (navigator as { requestMediaKeySystemAccess?: unknown })
      .requestMediaKeySystemAccess;
  });

  it("reportDiagnostic is a no-op without the query flag", () => {
    const fetchSpy = jest.fn();
    global.fetch = fetchSpy as typeof global.fetch;

    reportDiagnostic("event", { a: 1 });

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("reportDiagnostic POSTs the event when enabled", () => {
    window.history.replaceState({}, "", "/?spotify-diag");
    const fetchSpy = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchSpy as typeof global.fetch;

    reportDiagnostic("ready", { device_id: "d1" });

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/dev-diagnostics",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ event: "ready", data: { device_id: "d1" } }),
      }),
    );
  });

  it("reportDiagnostic swallows sync and async fetch failures", async () => {
    window.history.replaceState({}, "", "/?spotify-diag");

    global.fetch = jest
      .fn()
      .mockRejectedValue(new Error("offline")) as typeof global.fetch;
    expect(() => reportDiagnostic("event")).not.toThrow();
    await Promise.resolve();

    global.fetch = (() => {
      throw new Error("sync boom");
    }) as typeof global.fetch;
    expect(() => reportDiagnostic("event")).not.toThrow();
  });

  it("reportEnvironmentDiagnostics is a no-op without the query flag", () => {
    const fetchSpy = jest.fn();
    global.fetch = fetchSpy as typeof global.fetch;

    reportEnvironmentDiagnostics();

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("reportEnvironmentDiagnostics reports the user agent when the DRM probe is unavailable", () => {
    window.history.replaceState({}, "", "/?spotify-diag");
    const fetchSpy = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchSpy as typeof global.fetch;

    reportEnvironmentDiagnostics();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(String(fetchSpy.mock.calls[0]?.[1]?.body)).toContain("userAgent");
  });

  it("reports widevine supported when the DRM probe resolves", async () => {
    window.history.replaceState({}, "", "/?spotify-diag");
    const fetchSpy = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchSpy as typeof global.fetch;
    Object.defineProperty(navigator, "requestMediaKeySystemAccess", {
      value: jest.fn().mockResolvedValue({}),
      configurable: true,
    });

    reportEnvironmentDiagnostics();
    await Promise.resolve();
    await Promise.resolve();

    const bodies = fetchSpy.mock.calls.map((c) => String(c[1]?.body));
    expect(bodies.some((b) => b.includes('"supported":true'))).toBe(true);
  });

  it("reports widevine unsupported when the DRM probe rejects", async () => {
    window.history.replaceState({}, "", "/?spotify-diag");
    const fetchSpy = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchSpy as typeof global.fetch;
    Object.defineProperty(navigator, "requestMediaKeySystemAccess", {
      value: jest.fn().mockRejectedValue(new Error("no drm")),
      configurable: true,
    });

    reportEnvironmentDiagnostics();
    await Promise.resolve();
    await Promise.resolve();

    const bodies = fetchSpy.mock.calls.map((c) => String(c[1]?.body));
    expect(bodies.some((b) => b.includes('"supported":false'))).toBe(true);
  });
});

describe("resolveDeviceId", () => {
  const devicesResponse = (devices: unknown) => ({
    ok: true,
    json: async () => ({ devices }),
  });

  it("keeps the cached id when it is still listed", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        devicesResponse([{ id: "cached", name: "My Player" }]),
      ) as typeof global.fetch;

    await expect(resolveDeviceId("tok", "cached", "My Player")).resolves.toBe(
      "cached",
    );
  });

  it("falls back to matching by device name when the cached id is stale", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        devicesResponse([{ id: "live-id", name: "My Player" }]),
      ) as typeof global.fetch;

    await expect(resolveDeviceId("tok", "stale", "My Player")).resolves.toBe(
      "live-id",
    );
  });

  it("returns null when the device is not registered at all", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        devicesResponse([{ id: "x", name: "Other" }]),
      ) as typeof global.fetch;

    await expect(resolveDeviceId("tok", null, "My Player")).resolves.toBeNull();
  });

  it("returns null when the devices list is missing", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as typeof global.fetch;

    await expect(
      resolveDeviceId("tok", "cached", "My Player"),
    ).resolves.toBeNull();
  });

  it("returns null on a non-ok response", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: false, status: 401 }) as typeof global.fetch;

    await expect(
      resolveDeviceId("tok", "cached", "My Player"),
    ).resolves.toBeNull();
  });

  it("returns null when the request throws", async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(new Error("network down")) as typeof global.fetch;

    await expect(
      resolveDeviceId("tok", "cached", "My Player"),
    ).resolves.toBeNull();
  });
});

describe("startPlaybackUris", () => {
  const transferUrl = "https://api.spotify.com/v1/me/player";
  const playUrl = "https://api.spotify.com/v1/me/player/play?device_id=dev-1";

  it("activates the device (transfer) then PUTs the uris to the play endpoint", async () => {
    const fetchSpy = jest.fn().mockResolvedValue({ ok: true, status: 204 });
    global.fetch = fetchSpy as typeof global.fetch;

    const resp = await startPlaybackUris("tok", "dev-1", ["spotify:track:123"]);

    // 1) Transfer to activate the freshly-registered SDK device.
    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      transferUrl,
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({ Authorization: "Bearer tok" }),
        body: JSON.stringify({ device_ids: ["dev-1"], play: false }),
      }),
    );
    // 2) Then start the URIs on that device.
    expect(fetchSpy).toHaveBeenNthCalledWith(
      2,
      playUrl,
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ uris: ["spotify:track:123"] }),
      }),
    );
    expect(resp.status).toBe(204);
  });

  it("retries a 404 play (with delay) and returns the first non-404 response", async () => {
    let playCalls = 0;
    const fetchSpy = jest.fn().mockImplementation((url: string) => {
      if (url === playUrl) {
        playCalls += 1;
        return Promise.resolve(
          playCalls === 1
            ? { ok: false, status: 404 }
            : { ok: true, status: 204 },
        );
      }
      return Promise.resolve({ ok: true, status: 204 });
    });
    global.fetch = fetchSpy as typeof global.fetch;

    const resp = await startPlaybackUris(
      "tok",
      "dev-1",
      ["spotify:track:123"],
      [0, 1],
    );

    expect(playCalls).toBe(2);
    expect(resp.status).toBe(204);
  });

  it("returns the final 404 when every retry fails", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: false, status: 404 }) as typeof global.fetch;

    const resp = await startPlaybackUris(
      "tok",
      "dev-1",
      ["spotify:track:123"],
      [0, 0],
    );

    expect(resp.status).toBe(404);
  });

  it("swallows a failed transfer and lets the play call answer", async () => {
    const fetchSpy = jest.fn().mockImplementation((url: string) => {
      if (url === transferUrl) {
        return Promise.reject(new Error("transfer down"));
      }
      return Promise.resolve({ ok: true, status: 204 });
    });
    global.fetch = fetchSpy as typeof global.fetch;

    const resp = await startPlaybackUris("tok", "dev-1", ["spotify:track:123"]);

    expect(resp.status).toBe(204);
  });
});
