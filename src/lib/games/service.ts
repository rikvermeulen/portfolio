import type { GameProvider } from "./provider.ts";
import type {
  Game,
  GamesData,
  GamingPlatform,
  PlayerProfile,
} from "./types.ts";
import type { Result } from "@/types/index.ts";

import { mergeGames } from "./dedup.ts";
import { discordProvider } from "./providers/discord.ts";
import { steamProvider } from "./providers/steam.ts";
import { xboxProvider } from "./providers/xbox.ts";

// Registration order is meaningful: it sets both the order of the "add me"
// links and the cross-platform dedup priority (earlier wins — a Steam entry
// beats its Xbox duplicate). Adding a platform is a one-line change here.
const PROVIDERS: readonly GameProvider[] = [
  steamProvider,
  xboxProvider,
  discordProvider,
];

/** Run a provider method, swallowing failures so one bad provider can't break the tile. */
async function safe<T>(
  run: (() => Promise<T>) | undefined,
  fallback: T,
): Promise<T> {
  if (!run) {
    return fallback;
  }
  try {
    return await run();
  } catch (error) {
    console.error("[games] provider call failed:", error);
    return fallback;
  }
}

/**
 * The Games tile's data, aggregated across every configured provider: the
 * owner's header profile (the first provider that supplies one), the "add me"
 * platform links, and a merged, de-duplicated recently-played list. The header
 * profile is the only hard requirement — games and links are best-effort.
 *
 * Providers are injected for testability and default to the real registry.
 */
export async function getGamesResult(
  providers: readonly GameProvider[] = PROVIDERS,
): Promise<Result<GamesData>> {
  const [profiles, gameLists, links] = await Promise.all([
    Promise.all(providers.map((provider) => safe(provider.getProfile, null))),
    Promise.all(
      providers.map((provider) =>
        safe(provider.getGames, [] as readonly Game[]),
      ),
    ),
    Promise.all(
      providers.map((provider) => safe(() => provider.getPlatformLink(), null)),
    ),
  ]);

  const profile = profiles.find(
    (candidate): candidate is PlayerProfile => candidate !== null,
  );

  if (!profile) {
    return {
      ok: false,
      errorMessage: "Could not load your gaming profile right now",
    };
  }

  return {
    ok: true,
    data: {
      profile,
      platforms: links.filter((link): link is GamingPlatform => link !== null),
      games: mergeGames(gameLists),
    },
  };
}
