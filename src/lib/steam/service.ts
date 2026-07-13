import { unstable_cache } from "next/cache";

import type { SteamOwnedGame, SteamPlayerSummary } from "./types.ts";
import type { Game, PlayerProfile } from "@/lib/games/types.ts";

import { env } from "@env";

import {
  buildSteamHeaderUrl,
  buildSteamLibraryArtUrl,
  buildSteamStoreUrl,
  fetchOwnedGames,
  fetchPlayerSummaries,
  fetchSteamHeaderImage,
} from "./client.ts";

// Resolve accurate store art only for the most-recent N titles; the rest of the
// library uses guessable CDN art, so the whole list loads without a store-API
// lookup per game.
const ART_LIMIT = 24 as const;

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
    platform: "steam",
  };
}

function toProfile(summary: SteamPlayerSummary): PlayerProfile {
  return {
    id: summary.steamid,
    name: summary.personaname,
    avatar: summary.avatarfull ?? summary.avatarmedium ?? summary.avatar ?? "",
    href: summary.profileurl,
    online: (summary.personastate ?? 0) !== 0,
    playing: summary.gameextrainfo,
  };
}

const getCachedSteamProfile = unstable_cache(
  async (apiKey: string, steamId: string): Promise<PlayerProfile> => {
    const summaries = await fetchPlayerSummaries(apiKey, [steamId]);
    const owner = summaries.response.players?.find(
      (player) => player.steamid === steamId,
    );

    if (!owner) {
      throw new Error("Steam profile summary missing");
    }

    return toProfile(owner);
  },
  ["steam-profile"],
  { revalidate: 600, tags: ["steam"] },
);

const getCachedSteamGames = unstable_cache(
  async (apiKey: string, steamId: string): Promise<Game[]> => {
    const payload = await fetchOwnedGames(apiKey, steamId);
    const played = (payload.response.games ?? [])
      .filter(isSteamGame)
      .filter((game) => game.playtime_forever > 0)
      .slice()
      .sort((a, b) => (b.rtime_last_played ?? 0) - (a.rtime_last_played ?? 0));

    return Promise.all(
      played.map(async (game, index) =>
        toGame(
          game,
          index < ART_LIMIT ? await fetchSteamHeaderImage(game.appid) : null,
        ),
      ),
    );
  },
  ["steam-owned-games"],
  { revalidate: 1800, tags: ["steam"] },
);

/**
 * The owner's Steam profile (name, avatar, presence), or null when Steam isn't
 * configured. Throws on an API failure — the caller decides whether that's
 * fatal (the aggregation service treats a missing profile as a soft error).
 */
export async function getSteamProfile(): Promise<PlayerProfile | null> {
  const { STEAM_API_KEY, STEAM_ID } = env;
  if (!STEAM_API_KEY || !STEAM_ID) {
    return null;
  }
  return getCachedSteamProfile(STEAM_API_KEY, STEAM_ID);
}

/**
 * The owner's played Steam library, newest first. Empty when Steam isn't
 * configured; store art is resolved only for the most-recent slice.
 */
export async function getSteamGames(): Promise<Game[]> {
  const { STEAM_API_KEY, STEAM_ID } = env;
  if (!STEAM_API_KEY || !STEAM_ID) {
    return [];
  }
  return getCachedSteamGames(STEAM_API_KEY, STEAM_ID);
}
