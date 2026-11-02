import { z } from "zod";

import type {
  SpotifyPlaybackToken,
  SpotifyRecentlyPlayed,
  SpotifyShowEpisodes,
} from "./types.ts";

const SPOTIFY_API_URL = "https://api.spotify.com/v1";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

// The user token is also handed to the browser, so a cached one must outlive
// the client's own 60s early-refresh by a comfortable margin.
const USER_TOKEN_MARGIN_MS = 5 * 60 * 1000;

const tokenResponseSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().positive(),
});

let accessToken = "";
let tokenExpiresAt = 0;

let ccToken = "";
let ccTokenExpiresAt = 0;

async function getClientCredentialsToken(
  clientId: string,
  clientSecret: string,
): Promise<string> {
  if (ccToken && Date.now() < ccTokenExpiresAt) {
    return ccToken;
  }

  const credentials = btoa(`${clientId}:${clientSecret}`);
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Spotify client credentials failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };
  ccToken = data.access_token;
  ccTokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
  return ccToken;
}

async function refreshAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string,
): Promise<void> {
  const credentials = btoa(`${clientId}:${clientSecret}`);

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`Spotify token refresh failed: ${response.status}`);
  }

  const data = tokenResponseSchema.parse(await response.json());
  accessToken = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000 - USER_TOKEN_MARGIN_MS;
}

async function getAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string,
): Promise<string> {
  if (accessToken && Date.now() < tokenExpiresAt) {
    return accessToken;
  }
  await refreshAccessToken(clientId, clientSecret, refreshToken);
  return accessToken;
}

/**
 * The cached user access token for the browser's Web Playback SDK, with the
 * seconds until it actually expires. Refreshes against Spotify at most once
 * per token lifetime per server instance.
 */
export async function getPlaybackToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string,
): Promise<SpotifyPlaybackToken> {
  const token = await getAccessToken(clientId, clientSecret, refreshToken);

  return {
    token,
    expiresIn: Math.floor(
      (tokenExpiresAt + USER_TOKEN_MARGIN_MS - Date.now()) / 1000,
    ),
  };
}

export async function fetchRecentlyPlayed(
  clientId: string,
  clientSecret: string,
  refreshToken: string,
  limit = 20,
): Promise<SpotifyRecentlyPlayed> {
  const token = await getAccessToken(clientId, clientSecret, refreshToken);

  const url = new URL(`${SPOTIFY_API_URL}/me/player/recently-played`);
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 300 }, // refresh every 5 min — it's "recently played"
  });

  if (!response.ok) {
    throw new Error(`Spotify recently-played fetch failed: ${response.status}`);
  }

  return response.json() as Promise<SpotifyRecentlyPlayed>;
}

export async function fetchShowEpisodes(
  showId: string,
  clientId: string,
  clientSecret: string,
  market = "NL",
  limit = 20,
): Promise<SpotifyShowEpisodes> {
  const token = await getClientCredentialsToken(clientId, clientSecret);

  const url = new URL(`${SPOTIFY_API_URL}/shows/${showId}/episodes`);
  url.searchParams.set("market", market);
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 3600 }, // episodes change infrequently
  });

  if (!response.ok) {
    throw new Error(`Spotify show episodes fetch failed: ${response.status}`);
  }

  return response.json() as Promise<SpotifyShowEpisodes>;
}
