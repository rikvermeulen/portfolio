import type {
  XboxProfile,
  XboxProfileUser,
  XboxTitle,
  XboxTitleHistoryResponse,
} from "./types.ts";
import type { Game } from "@/lib/games/types.ts";
import type { Result } from "@/types/index.ts";

import { env } from "@env";

import { fetchXboxAccount, fetchXboxTitleHistory } from "./client.ts";

/** Read a value out of the profile's `settings` array by its id. */
function setting(user: XboxProfileUser, id: string): string | undefined {
  return user.settings?.find((entry) => entry.id === id)?.value;
}

function toXboxProfile(user: XboxProfileUser): XboxProfile {
  const gamertag = setting(user, "Gamertag") ?? "";
  return {
    xuid: user.id,
    gamertag,
    gamerscore: Number(setting(user, "Gamerscore") ?? 0),
    avatar: setting(user, "GameDisplayPicRaw") ?? "",
    tier: setting(user, "AccountTier"),
    href: `https://account.xbox.com/profile?gt=${encodeURIComponent(gamertag)}`,
  };
}

/**
 * The owner's Xbox profile via OpenXBL. The underlying fetch is cached (see
 * `client.ts`), so this stays well under the free-tier request limit. Failures
 * degrade to `ok:false` (the caller falls back to a static link) rather than
 * throwing — so a mis-configured key can't crash the page.
 */
function isTitle(value: unknown): value is XboxTitle {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { name?: unknown }).name === "string"
  );
}

/**
 * OpenXBL returns the titles in one of several shapes: `titles` at the top
 * level, `content.titles`, `content` as an array, or `content` as a
 * numeric-keyed object of titles. Normalise them all to a plain list.
 */
function extractTitles(payload: XboxTitleHistoryResponse): XboxTitle[] {
  const content = payload.content;

  if (Array.isArray(content)) {
    return [...content];
  }
  if (content && typeof content === "object") {
    const record = content as { titles?: readonly XboxTitle[] };
    if (Array.isArray(record.titles)) {
      return [...record.titles];
    }
    return Object.values(content).filter(isTitle);
  }
  return payload.titles ? [...payload.titles] : [];
}

/** Map a title-history entry to the shared Game shape (tagged `xbox`). */
function toXboxGame(title: XboxTitle): Game | null {
  if (!title.name) {
    return null;
  }
  const parsed = title.titleHistory?.lastTimePlayed
    ? Date.parse(title.titleHistory.lastTimePlayed)
    : Number.NaN;
  return {
    id: `xbox-${title.titleId ?? title.name}`,
    name: title.name,
    // Microsoft serves some art over http; next/image needs https.
    coverImage: (title.displayImage ?? "").replace(/^http:/, "https:"),
    lastPlayedUnix: Number.isFinite(parsed)
      ? Math.floor(parsed / 1000)
      : undefined,
    platform: "xbox",
  };
}

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
