import type { Game, PlayerProfile } from "./types.ts";
import type {
  SteamOwnedGame,
  SteamPlayerSummary,
} from "@/vendors/steam/types.ts";

const STEAM_CDN_URL = "https://cdn.cloudflare.steamstatic.com/steam/apps";

/**
 * Guessed landscape header URL. Works for established apps but 404s for some
 * newer/obscure titles — used only as a backup when the store API lookup fails.
 */
export function buildSteamHeaderUrl(appid: number): string {
  return `${STEAM_CDN_URL}/${appid}/header.jpg`;
}

/**
 * High-res portrait library capsule (600×900). Guessable from the appid alone;
 * stays crisp when cropped square for a tile. 404s for some newer/obscure
 * titles, so callers fall back to the landscape header art.
 */
export function buildSteamLibraryArtUrl(appid: number): string {
  return `${STEAM_CDN_URL}/${appid}/library_600x900_2x.jpg`;
}

/** Steam store page for an app. */
export function buildSteamStoreUrl(appid: number): string {
  return `https://store.steampowered.com/app/${appid}`;
}

export function isSteamGame(value: unknown): value is SteamOwnedGame {
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

/** Map a Steam owned-game (+ resolved store art) to the domain game shape. */
export function toSteamGame(
  game: SteamOwnedGame,
  headerImage: string | null,
): Game {
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

/** Map a Steam player summary to the domain profile shape. */
export function toSteamProfile(summary: SteamPlayerSummary): PlayerProfile {
  return {
    id: summary.steamid,
    name: summary.personaname,
    avatar: summary.avatarfull ?? summary.avatarmedium ?? summary.avatar ?? "",
    href: summary.profileurl,
    online: (summary.personastate ?? 0) !== 0,
    playing: summary.gameextrainfo,
  };
}
