import type { Game } from "./types.ts";

/** Last-played time in seconds, treating "never played" as the oldest. */
const playedAt = (game: Game): number => game.lastPlayedUnix ?? 0;

/**
 * Loose key for matching the *same* game across platforms: case- and
 * punctuation-insensitive. Edition/platform variants (e.g. "GTA V" vs "GTA V
 * Enhanced (PC)") are intentionally kept distinct — they're different releases.
 */
export function titleKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/**
 * Merge recently-played lists from multiple providers into one, newest first,
 * with duplicates removed.
 *
 * Lists are passed in priority order (highest first) and visited in that order,
 * so "first seen wins": when the same game shows up on more than one platform,
 * the higher-priority provider's entry is kept — it usually has better art and a
 * real store link. Within a single provider, the most-recently-played instance
 * wins (some platforms list a title twice across devices). The result is sorted
 * by last-played, newest first.
 */
export function mergeGames(lists: readonly (readonly Game[])[]): Game[] {
  const best = new Map<
    string,
    { readonly game: Game; readonly rank: number }
  >();

  lists.forEach((games, rank) => {
    for (const game of games) {
      const key = titleKey(game.name);
      const current = best.get(key);

      if (!current) {
        best.set(key, { game, rank }); // first seen wins across providers
        continue;
      }
      // A later provider (higher rank) never displaces the existing entry; only
      // a more-recent instance from the *same* provider does.
      if (rank === current.rank && playedAt(game) > playedAt(current.game)) {
        best.set(key, { game, rank });
      }
    }
  });

  return [...best.values()]
    .map((entry) => entry.game)
    .sort((a, b) => playedAt(b) - playedAt(a));
}
