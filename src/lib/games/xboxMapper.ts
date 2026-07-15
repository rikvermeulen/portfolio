import type { Game } from "./types.ts";
import type {
  XboxProfileUser,
  XboxTitle,
  XboxTitleHistoryResponse,
} from "@/vendors/xbox/types.ts";

/** The owner's Xbox profile, mapped from the OpenXBL settings array. */
export interface XboxProfile {
  readonly xuid: string;
  readonly gamertag: string; // unique gamertag incl. suffix, e.g. "PARADEMON1385"
  readonly displayName: string; // ModernGamertag without the suffix, e.g. "PARADEMON"
  readonly gamerscore: number;
  readonly avatar: string; // GameDisplayPicRaw
  readonly href: string; // public profile URL
  readonly tier?: string; // AccountTier, e.g. "Gold"
}

/** Read a value out of the profile's `settings` array by its id. */
function setting(user: XboxProfileUser, id: string): string | undefined {
  return user.settings?.find((entry) => entry.id === id)?.value;
}

export function toXboxProfile(user: XboxProfileUser): XboxProfile {
  const gamertag = setting(user, "Gamertag") ?? "";
  return {
    xuid: user.id,
    gamertag,
    displayName: setting(user, "ModernGamertag") ?? gamertag,
    gamerscore: Number(setting(user, "Gamerscore") ?? 0),
    avatar: setting(user, "GameDisplayPicRaw") ?? "",
    tier: setting(user, "AccountTier"),
    href: `https://account.xbox.com/profile?gt=${encodeURIComponent(gamertag)}`,
  };
}

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
export function extractTitles(payload: XboxTitleHistoryResponse): XboxTitle[] {
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
export function toXboxGame(title: XboxTitle): Game | null {
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
