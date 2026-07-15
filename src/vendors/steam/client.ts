import type {
  SteamOwnedGamesResponse,
  SteamPlayerSummariesResponse,
} from "./types.ts";

const STEAM_API_URL = "https://api.steampowered.com";
const STEAM_STORE_API_URL = "https://store.steampowered.com/api/appdetails";

interface SteamAppDetailsEntry {
  readonly success?: boolean;
  readonly data?: { readonly header_image?: string };
}
type SteamAppDetailsResponse = Record<string, SteamAppDetailsEntry>;

export class SteamError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "SteamError";
  }
}

/**
 * Player summaries (name, avatar, profile URL) for one or more steamids. Steam
 * stores its key as a static query param — no token exchange needed. Requires
 * the profile to be Public.
 */
export async function fetchPlayerSummaries(
  apiKey: string,
  steamIds: readonly string[],
): Promise<SteamPlayerSummariesResponse> {
  const url = new URL(`${STEAM_API_URL}/ISteamUser/GetPlayerSummaries/v2/`);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("steamids", steamIds.join(","));

  const response = await fetch(url.toString(), {
    next: { revalidate: 600 }, // profile changes rarely; 10 min
  });

  if (!response.ok) {
    throw new SteamError(
      `Steam player-summaries fetch failed: ${response.status}`,
    );
  }

  return response.json() as Promise<SteamPlayerSummariesResponse>;
}

/**
 * The full owned library with per-game playtime and last-played timestamps.
 * Requires the user's profile + game details to be set to Public.
 */
export async function fetchOwnedGames(
  apiKey: string,
  steamId: string,
): Promise<SteamOwnedGamesResponse> {
  const url = new URL(`${STEAM_API_URL}/IPlayerService/GetOwnedGames/v1/`);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("steamid", steamId);
  url.searchParams.set("include_appinfo", "1");
  url.searchParams.set("include_played_free_games", "1");

  const response = await fetch(url.toString(), {
    next: { revalidate: 600 }, // playtime changes occasionally; 10 min
  });

  if (!response.ok) {
    throw new SteamError(`Steam owned-games fetch failed: ${response.status}`);
  }

  return response.json() as Promise<SteamOwnedGamesResponse>;
}

/**
 * The real store art URL for an app contains an unguessable content hash in its
 * path, and {@link fetchOwnedGames} doesn't return it. The public store API
 * does, via `header_image`. Returns null (never throws) so a single failed
 * lookup can't break the whole list.
 */
export async function fetchSteamHeaderImage(
  appid: number,
): Promise<string | null> {
  try {
    const url = new URL(STEAM_STORE_API_URL);
    url.searchParams.set("appids", String(appid));
    url.searchParams.set("filters", "basic");

    const response = await fetch(url.toString(), {
      next: { revalidate: 86_400 }, // store art rarely changes; cache a day
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as SteamAppDetailsResponse;
    const header = payload[String(appid)]?.data?.header_image;
    return typeof header === "string" ? header : null;
  } catch {
    return null;
  }
}
