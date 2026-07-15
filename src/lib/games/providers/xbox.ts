import type { GameProvider } from "../provider.ts";
import type { Game, GamingPlatform } from "../types.ts";

import {
  getXboxGamesResult,
  getXboxProfileResult,
} from "@/vendors/xbox/service.ts";
import { env } from "@env";

/**
 * The "add me" Xbox link: live OpenXBL profile when available (real gamertag +
 * link), otherwise a static env fallback — a gamertag alone is enough to derive
 * the public profile URL. Returns null when Xbox isn't configured at all.
 */
async function getXboxLink(): Promise<GamingPlatform | null> {
  const result = await getXboxProfileResult();
  if (result.ok) {
    return {
      id: "xbox",
      name: "Xbox",
      handle: result.data.displayName,
      href: result.data.href,
      image: result.data.avatar,
    };
  }

  if (env.XBOX_GAMERTAG) {
    return {
      id: "xbox",
      name: "Xbox",
      handle: env.XBOX_GAMERTAG,
      href:
        env.XBOX_PROFILE_URL ??
        `https://account.xbox.com/profile?gt=${encodeURIComponent(env.XBOX_GAMERTAG)}`,
    };
  }

  if (env.XBOX_PROFILE_URL) {
    return {
      id: "xbox",
      name: "Xbox",
      handle: "Xbox",
      href: env.XBOX_PROFILE_URL,
    };
  }

  return null;
}

export const xboxProvider: GameProvider = {
  id: "xbox",
  async getGames(): Promise<readonly Game[]> {
    const result = await getXboxGamesResult();
    if (!result.ok) {
      return [];
    }
    // Xbox titles have no store page of their own, so point them at the profile.
    const link = await getXboxLink();
    return result.data.map((game) => ({ ...game, href: link?.href }));
  },
  getPlatformLink: getXboxLink,
};
