/**
 * Client-side helpers for the Spotify Web Playback SDK, built to the official
 * documentation:
 *   - SDK getting started / reference:
 *     https://developer.spotify.com/documentation/web-playback-sdk
 *   - Start/Resume playback (Web API):
 *     https://developer.spotify.com/documentation/web-api/reference/start-a-users-playback
 *
 * The SDK registers a Spotify Connect *device* inside the browser. Audio is
 * then started by calling the Web API `PUT /me/player/play` endpoint targeting
 * that device's `device_id`. Requires a Spotify Premium account and, in the
 * browser, EME/Widevine DRM support (the SDK silently fails to initialize
 * without it).
 *
 * Required OAuth scopes on the token: `streaming` (SDK playback) and
 * `user-modify-playback-state` (the play REST call).
 */

export const WEB_PLAYBACK_SDK_SRC = "https://sdk.scdn.co/spotify-player.js";

/** Connect device name registered with the SDK — single source across the app. */
export const SPOTIFY_DEVICE_NAME = "Rik's Portfolio";

/** Message shown to the user when playback can't initialize or start. */
export const PLAYBACK_UNAVAILABLE_MESSAGE =
  "Playback needs Spotify Premium in a browser that supports DRM (e.g. Chrome, Edge or Safari).";

/** Message shown when the device didn't answer after retries (usually transient). */
export const PLAYBACK_RETRY_MESSAGE =
  "Spotify couldn't reach the player — press play again (or reload the page).";

/** `ready` / `not_ready` event payload. */
export interface WebPlaybackDevice {
  readonly device_id: string;
}

/** Error event payload (initialization/authentication/account/playback). */
export interface WebPlaybackError {
  readonly message: string;
}

/** Subset of the `player_state_changed` payload this app relies on. */
export interface WebPlaybackState {
  readonly paused: boolean;
  readonly position: number;
  readonly duration: number;
  readonly track_window?: {
    readonly current_track?: {
      readonly uri?: string;
    };
  };
}

export interface SpotifyPlayer {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  togglePlay: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  // Must be called from within a user gesture on autoplay-restricted browsers
  // (Safari/iOS) before starting playback.
  activateElement: () => Promise<void>;
  addListener: (event: string, cb: (data: unknown) => void) => boolean;
  removeListener: (event: string) => boolean;
}

export interface SpotifyPlayerInit {
  name: string;
  getOAuthToken: (cb: (token: string) => void) => void;
  volume: number;
}

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify?: {
      Player: new (options: SpotifyPlayerInit) => SpotifyPlayer;
    };
  }
}

export interface AccessToken {
  readonly token: string;
  /** Epoch ms after which the token should be considered expired. */
  readonly expiresAt: number;
}

/**
 * Fetches a fresh access token from our server route and computes its expiry.
 * Refreshes a minute early to avoid racing the real expiry.
 */
export async function fetchAccessToken(): Promise<AccessToken> {
  const resp = await fetch("/api/spotify/token");
  if (!resp.ok) {
    throw new Error(`Spotify token request failed (${resp.status})`);
  }
  const data = (await resp.json()) as { token: string; expiresIn?: number };
  const ttlSeconds = typeof data.expiresIn === "number" ? data.expiresIn : 3600;
  return {
    token: data.token,
    expiresAt: Date.now() + (ttlSeconds - 60) * 1000,
  };
}

let mockPlaybackStateListener: ((state: WebPlaybackState) => void) | null =
  null;
let mockCurrentUri: string | null = null;
let mockIsPaused = true;

function emitMockPlaybackState(): void {
  if (!mockCurrentUri) {
    return;
  }

  mockPlaybackStateListener?.({
    paused: mockIsPaused,
    position: 0,
    duration: 180_000,
    track_window: { current_track: { uri: mockCurrentUri } },
  });
}

/**
 * Test seam: installs a stub `window.Spotify` whose player "readies" with a
 * fake device id. This lets the full playback pipeline (token fetch, device
 * resolution by name, transfer, play) be exercised end-to-end in browsers
 * without Widevine DRM — the fake id is deliberately stale so
 * `resolveDeviceId`'s name-based recovery path runs. Enabled by loading the
 * page with `?spotify-mock`; behaves identically in every build.
 */
function installMockSdk(): void {
  window.Spotify = {
    Player: function MockPlayer(options: SpotifyPlayerInit): SpotifyPlayer {
      const listeners: Record<string, ((data: unknown) => void)[]> = {};
      return {
        addListener: (event, cb) => {
          listeners[event] = [...(listeners[event] ?? []), cb];
          if (event === "player_state_changed") {
            mockPlaybackStateListener = cb as (state: WebPlaybackState) => void;
          }
          return true;
        },
        removeListener: () => true,
        connect: () => {
          setTimeout(() => {
            listeners["ready"]?.forEach((cb) =>
              cb({ device_id: `mock-stale-${options.name}` }),
            );
          }, 50);
          return Promise.resolve(true);
        },
        disconnect: () => {
          mockPlaybackStateListener = null;
        },
        togglePlay: () => {
          mockIsPaused = !mockIsPaused;
          emitMockPlaybackState();
          return Promise.resolve();
        },
        pause: () => {
          mockIsPaused = true;
          emitMockPlaybackState();
          return Promise.resolve();
        },
        resume: () => {
          mockIsPaused = false;
          emitMockPlaybackState();
          return Promise.resolve();
        },
        setVolume: () => Promise.resolve(),
        activateElement: () => Promise.resolve(),
      };
    } as unknown as new (options: SpotifyPlayerInit) => SpotifyPlayer,
  };
}

function isMockSdkRequested(): boolean {
  return new URLSearchParams(window.location.search).has("spotify-mock");
}

function isDiagnosticsRequested(): boolean {
  return new URLSearchParams(window.location.search).has("spotify-diag");
}

/**
 * Always-on diagnostics: ships SDK lifecycle events to `/api/dev-diagnostics`,
 * which appends them to `.spotify-diag.log`. Lets playback failures in any
 * browser be inspected from the terminal without copy-pasting console output.
 * Never throws.
 */
export function reportDiagnostic(event: string, data?: unknown): void {
  if (!isDiagnosticsRequested()) {
    return;
  }

  try {
    void fetch("/api/dev-diagnostics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, data }),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Diagnostics must never break the app.
  }
}

/**
 * One-shot environment probe for the diagnostics log: user agent plus whether
 * Widevine DRM is available (the SDK cannot produce audio without it).
 */
export function reportEnvironmentDiagnostics(): void {
  if (!isDiagnosticsRequested()) {
    return;
  }

  reportDiagnostic("environment", { userAgent: navigator.userAgent });
  const probe = navigator.requestMediaKeySystemAccess?.("com.widevine.alpha", [
    {
      initDataTypes: ["cenc"],
      audioCapabilities: [{ contentType: 'audio/mp4; codecs="mp4a.40.2"' }],
    },
  ]);
  probe?.then(
    () => reportDiagnostic("widevine", { supported: true }),
    (error: unknown) =>
      reportDiagnostic("widevine", { supported: false, error: String(error) }),
  );
}

/**
 * Injects the SDK `<script>` exactly once and resolves when `window.Spotify`
 * is available. Composes with any existing `onSpotifyWebPlaybackSDKReady` so
 * multiple callers (e.g. the Music and Podcast players) are each notified when
 * the single SDK load completes.
 */
export function loadWebPlaybackSdk(): Promise<void> {
  if (window.Spotify) {
    return Promise.resolve();
  }

  if (isMockSdkRequested()) {
    installMockSdk();
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const previous = window.onSpotifyWebPlaybackSDKReady;
    window.onSpotifyWebPlaybackSDKReady = () => {
      previous?.();
      resolve();
    };

    if (!document.querySelector(`script[src="${WEB_PLAYBACK_SDK_SRC}"]`)) {
      const script = document.createElement("script");
      script.src = WEB_PLAYBACK_SDK_SRC;
      document.body.appendChild(script);
    }
  });
}

const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Resolves the *live* device id for this player. The SDK re-registers under a
 * NEW id whenever its connection drops and comes back (dev-server HMR, network
 * blips, token refresh), so a device id cached in React state can go stale —
 * playing against it returns 404 "Device not found" even though the device is
 * visibly online. We therefore ask Spotify for the current device list at play
 * time: if the cached id is still listed we use it, otherwise we find our
 * device by its (unique per tile) name.
 */
export async function resolveDeviceId(
  token: string,
  cachedId: string | null,
  deviceName: string,
): Promise<string | null> {
  try {
    const resp = await fetch("https://api.spotify.com/v1/me/player/devices", {
      headers: authHeaders(token),
    });
    if (!resp.ok) {
      return null;
    }
    const data = (await resp.json()) as {
      devices?: readonly { id: string; name: string }[];
    };
    const devices = data.devices ?? [];
    if (cachedId && devices.some((d) => d.id === cachedId)) {
      return cachedId;
    }
    return devices.find((d) => d.name === deviceName)?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Starts playback of the given Spotify URIs on a specific device.
 *
 * A freshly-registered Web Playback SDK device rejects a direct `/play` call
 * with 404 ("Device not found") until it has been made the *active* device, so
 * each attempt transfers playback to it first (`play: false`, i.e. just
 * activate) and then starts the URIs. Because activation of a new SDK device
 * takes a moment to propagate through Spotify Connect, a 404 is retried with
 * backoff (verified live: transfer 204 → play 204 succeeds on a registered
 * device; the 404s come from stale ids or propagation lag).
 *
 * Works for both `spotify:track:` and `spotify:episode:` URIs (verified against
 * the live API). Note that `spotify:episode:` is only playable via `uris` — it
 * returns 400 "Non supported context uri" if passed as `context_uri`.
 *
 * Returns the raw Response of the last play attempt.
 */
export async function startPlaybackUris(
  token: string,
  deviceId: string,
  uris: readonly string[],
  retryDelaysMs: readonly number[] = [0, 1000, 3000],
): Promise<Response> {
  if (isMockSdkRequested()) {
    mockCurrentUri = uris[0] ?? null;
    mockIsPaused = false;
    emitMockPlaybackState();
    return new Response(null, { status: 204 });
  }

  const headers = authHeaders(token);
  let resp!: Response;

  for (const delay of retryDelaysMs) {
    if (delay > 0) {
      await sleep(delay);
    }

    // Activate the device (transfer without auto-playing the previous context).
    // Best-effort: a failed transfer still lets the play call answer for itself.
    await fetch("https://api.spotify.com/v1/me/player", {
      method: "PUT",
      headers,
      body: JSON.stringify({ device_ids: [deviceId], play: false }),
    }).catch(() => undefined);

    resp = await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
      { method: "PUT", headers, body: JSON.stringify({ uris }) },
    );
    if (resp.status !== 404) {
      return resp;
    }
  }
  return resp;
}
