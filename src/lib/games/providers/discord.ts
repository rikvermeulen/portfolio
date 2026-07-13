import type { GameProvider } from "../provider.ts";
import type { GamingPlatform } from "../types.ts";

import { env } from "@env";

/**
 * Discord contributes only a static "add me" link from env — no profile or
 * games API. Absent config → no link.
 */
export const discordProvider: GameProvider = {
  id: "discord",
  getPlatformLink(): Promise<GamingPlatform | null> {
    if (!env.DISCORD_PROFILE_URL) {
      return Promise.resolve(null);
    }
    return Promise.resolve({
      id: "discord",
      name: "Discord",
      handle: env.DISCORD_USERNAME ?? "Discord",
      href: env.DISCORD_PROFILE_URL,
    });
  },
};
