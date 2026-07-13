import { unstable_cache } from "next/cache";

import type {
  Game,
  GamingPlatform,
  SteamOwnedGame,
  SteamPlayerSummary,
  SteamProfile,
  SteamProfileData,
} from "./types.ts";
import type { Result } from "@/types/index.ts";

import { env } from "@env";

import {
  buildSteamHeaderUrl,
  buildSteamLibraryArtUrl,
  buildSteamStoreUrl,
  fetchOwnedGames,
  fetchPlayerSummaries,
  fetchSteamHeaderImage,
} from "./client.ts";

// How many recently-played titles to surface.
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

function toProfile(summary: SteamPlayerSummary): SteamProfile {
  return {
    id: summary.steamid,
    name: summary.personaname,
    avatar: summary.avatarfull ?? summary.avatarmedium ?? summary.avatar ?? "",
    href: summary.profileurl,
  };
}

const getCachedSteamProfile = unstable_cache(
  async (apiKey: string, steamId: string): Promise<SteamProfile> => {
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
    const games = (payload.response.games ?? [])
      .filter(isSteamGame)
      .filter((game) => game.playtime_forever > 0)
      .slice()
      .sort((a, b) => (b.rtime_last_played ?? 0) - (a.rtime_last_played ?? 0))
      .slice(0, MAX_GAMES);

    return Promise.all(
      games.map(async (game) =>
        toGame(game, await fetchSteamHeaderImage(game.appid)),
      ),
    );
  },
  ["steam-owned-games"],
  { revalidate: 1800, tags: ["steam"] },
);

/**
 * The "add me" list a visitor can follow. Steam comes from the fetched profile;
 * Xbox and Discord are optional and appear only when configured via env.
 */
function buildPlatforms(profile: SteamProfile): GamingPlatform[] {
  const platforms: GamingPlatform[] = [
    { id: "steam", name: "Steam", handle: profile.name, href: profile.href },
  ];

  const {
    XBOX_PROFILE_URL,
    XBOX_GAMERTAG,
    DISCORD_PROFILE_URL,
    DISCORD_USERNAME,
  } = env;

  if (XBOX_PROFILE_URL) {
    platforms.push({
      id: "xbox",
      name: "Xbox",
      handle: XBOX_GAMERTAG ?? "Xbox",
      href: XBOX_PROFILE_URL,
    });
  }

  if (DISCORD_PROFILE_URL) {
    platforms.push({
      id: "discord",
      name: "Discord",
      handle: DISCORD_USERNAME ?? "Discord",
      href: DISCORD_PROFILE_URL,
    });
  }

  return platforms;
}

/**
 * The Games bento's data: the owner's Steam profile, the "add me" platform
 * links, and their recently-played library. Profile and games are fetched in
 * parallel; the profile is the only hard requirement (games may be empty).
 */
export async function getSteamProfileResult(): Promise<
  Result<SteamProfileData>
> {
  const { STEAM_API_KEY, STEAM_ID } = env;

  if (!STEAM_API_KEY || !STEAM_ID) {
    return { ok: false, errorMessage: "Steam is not configured" };
  }

  try {
    const [profile, games] = await Promise.all([
      getCachedSteamProfile(STEAM_API_KEY, STEAM_ID),
      getCachedSteamGames(STEAM_API_KEY, STEAM_ID),
    ]);

    return {
      ok: true,
      data: { profile, platforms: buildPlatforms(profile), games },
    };
  } catch (error) {
    console.error("[steam] getSteamProfileResult failed:", error);
    return {
      ok: false,
      errorMessage: "Could not load your Steam profile right now",
    };
  }
}
