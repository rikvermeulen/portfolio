import { unstable_cache } from "next/cache";

import type { Game, SteamGamesData, SteamOwnedGame } from "./types.ts";
import type { Result } from "@/types/index.ts";

import { env } from "@env";

import {
  buildSteamHeaderUrl,
  buildSteamLibraryArtUrl,
  buildSteamStoreUrl,
  fetchOwnedGames,
  fetchSteamHeaderImage,
} from "./client.ts";

// How many recently-played titles to surface in the bento.
const MAX_GAMES = 12 as const;

function isSteamGame(value: unknown): value is SteamOwnedGame {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const game = value as Record<string, unknown>;
  return (
    typeof game.appid === "number" &&
    typeof game.name === "string" &&
    typeof game.playtime_forever === "number"
  );
}

function toGame(game: SteamOwnedGame, headerImage: string | null): Game {
  const fallback = buildSteamHeaderUrl(game.appid);
  return {
    id: `steam-${game.appid}`,
    name: game.name,
    coverImage: headerImage ?? fallback,
    coverImageFallback: fallback,
    portraitImage: buildSteamLibraryArtUrl(game.appid),
    href: buildSteamStoreUrl(game.appid),
    playtimeMinutes: game.playtime_forever,
    lastPlayedUnix: game.rtime_last_played,
  };
}

/**
 * Cached Steam library data. The fetch hardcodes ISR revalidation, but wrapping
 * in unstable_cache decouples the dashboard render from the live round trip and
 * lets us revalidate by tag. The wrapped fn throws on failure so errors aren't
 * cached (mirrors the Planta service pattern).
 *
 * Sourced from the full owned library (not GetRecentlyPlayedGames, which only
 * returns the last 2 weeks), filtered to games actually played and ordered by
 * most-recently-played.
 */
const getCachedSteamGames = unstable_cache(
  async (apiKey: string, steamId: string): Promise<Game[]> => {
    const payload = await fetchOwnedGames(apiKey, steamId);
    const games = (payload.response.games ?? [])
      .filter(isSteamGame)
      .filter((game) => game.playtime_forever > 0)
      .slice()
      .sort((a, b) => (b.rtime_last_played ?? 0) - (a.rtime_last_played ?? 0))
      .slice(0, MAX_GAMES);

    // Resolve real store art per game (parallel). The owned-games endpoint
    // doesn't include it and the CDN path can't be guessed for every title.
    return Promise.all(
      games.map(async (game) =>
        toGame(game, await fetchSteamHeaderImage(game.appid)),
      ),
    );
  },
  ["steam-owned-games"],
  { revalidate: 1800, tags: ["steam"] },
);

export async function getSteamGamesResult(): Promise<Result<SteamGamesData>> {
  const { STEAM_API_KEY, STEAM_ID } = env;

  if (!STEAM_API_KEY || !STEAM_ID) {
    return { ok: false, errorMessage: "Steam is not configured" };
  }

  try {
    const games = await getCachedSteamGames(STEAM_API_KEY, STEAM_ID);

    if (games.length === 0) {
      return { ok: false, errorMessage: "No recently played games found" };
    }

    return { ok: true, data: { games } };
  } catch (error) {
    console.error("[steam] getSteamGamesResult failed:", error);
    return {
      ok: false,
      errorMessage: "Could not load your Steam games right now",
    };
  }
}
