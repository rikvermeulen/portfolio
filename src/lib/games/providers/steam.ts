import type { GameProvider } from "../provider.ts";
import type { GamingPlatform } from "../types.ts";

import { getSteamGames, getSteamProfile } from "@/lib/steam/service.ts";

/**
 * Steam is the primary provider: it supplies the header profile, the played
 * library, and its own "add me" link (derived from the same cached profile).
 */
export const steamProvider: GameProvider = {
  id: "steam",
  getProfile: getSteamProfile,
  getGames: getSteamGames,
  async getPlatformLink(): Promise<GamingPlatform | null> {
    const profile = await getSteamProfile();
    if (!profile) {
      return null;
    }
    return {
      id: "steam",
      name: "Steam",
      handle: profile.name,
      href: profile.href,
    };
  },
};
