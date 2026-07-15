import type { Game } from "@/lib/games/types.ts";
import type { XboxProfile } from "@/lib/games/xboxMapper.ts";
import type { Result } from "@/types/index.ts";

import {
  extractTitles,
  toXboxGame,
  toXboxProfile,
} from "@/lib/games/xboxMapper.ts";
import { env } from "@env";

import { fetchXboxAccount, fetchXboxTitleHistory } from "./client.ts";

/**
 * The owner's recently-played Xbox titles, mapped to the shared Game shape so
 * they can be merged into the games list. Degrades to `ok:false` on any failure.
 */
export async function getXboxGamesResult(): Promise<Result<Game[]>> {
  const { XBOX_API_KEY } = env;

  if (!XBOX_API_KEY) {
    return { ok: false, errorMessage: "Xbox is not configured" };
  }

  try {
    const payload = await fetchXboxTitleHistory(XBOX_API_KEY);
    const titles = extractTitles(payload);
    const games = titles
      .map(toXboxGame)
      .filter((game): game is Game => game !== null);
    return { ok: true, data: games };
  } catch (error) {
    console.error("[xbox] getXboxGamesResult failed:", error);
    return {
      ok: false,
      errorMessage: "Could not load your Xbox games right now",
    };
  }
}

export async function getXboxProfileResult(): Promise<Result<XboxProfile>> {
  const { XBOX_API_KEY } = env;

  if (!XBOX_API_KEY) {
    return { ok: false, errorMessage: "Xbox is not configured" };
  }

  try {
    const payload = await fetchXboxAccount(XBOX_API_KEY);
    const user = (payload.content?.profileUsers ?? payload.profileUsers)?.[0];

    if (!user) {
      console.error(
        "[xbox] OpenXBL /account returned no profile. Make sure your xbl.io " +
          "key is linked to the Microsoft account that owns your gamertag. " +
          `Response: ${JSON.stringify(payload).slice(0, 300)}`,
      );
      return { ok: false, errorMessage: "Xbox profile not found for this key" };
    }

    return { ok: true, data: toXboxProfile(user) };
  } catch (error) {
    console.error("[xbox] getXboxProfileResult failed:", error);
    return {
      ok: false,
      errorMessage: "Could not load your Xbox profile right now",
    };
  }
}
