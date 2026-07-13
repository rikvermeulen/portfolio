import type { Game } from "./types.ts";

import { mergeGames, titleKey } from "./dedup.ts";

const game = (name: string, overrides: Partial<Game> = {}): Game => ({
  id: `id-${name}`,
  name,
  coverImage: "",
  platform: "steam",
  ...overrides,
});

describe("titleKey", () => {
  it("normalises case, punctuation, parentheticals and edition words", () => {
    expect(titleKey("Grand Theft Auto V Enhanced (PC)")).toBe(
      titleKey("grand theft auto v"),
    );
    expect(titleKey("Dying Light 2: Reloaded Edition")).toBe("dyinglight2");
    expect(titleKey("HALO INFINITE")).toBe("haloinfinite");
  });
});

describe("mergeGames", () => {
  it("returns [] for no lists", () => {
    expect(mergeGames([])).toEqual([]);
  });

  it("keeps the higher-priority provider's entry across platforms", () => {
    const steam = [game("Grand Theft Auto V", { platform: "steam" })];
    const xbox = [
      game("Grand Theft Auto V Enhanced (PC)", {
        platform: "xbox",
        id: "x1",
      }),
    ];

    const merged = mergeGames([steam, xbox]);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.platform).toBe("steam");
  });

  it("collapses repeats within one provider, keeping the most recent", () => {
    const xbox = [
      game("Gang Beasts", { id: "old", platform: "xbox", lastPlayedUnix: 5 }),
      game("Gang Beasts", { id: "new", platform: "xbox", lastPlayedUnix: 9 }),
      game("Gang Beasts", { id: "mid", platform: "xbox", lastPlayedUnix: 7 }),
    ];

    const merged = mergeGames([xbox]);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.id).toBe("new");
  });

  it("keeps the first of same-provider repeats that lack a played time", () => {
    const xbox = [
      game("Peak", { id: "first", platform: "xbox" }),
      game("Peak", { id: "second", platform: "xbox" }),
    ];

    const merged = mergeGames([xbox]);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.id).toBe("first");
  });

  it("merges lists and sorts by last-played, newest first", () => {
    const steam = [
      game("Alpha", { lastPlayedUnix: 100 }),
      game("Bravo", { lastPlayedUnix: 300 }),
      game("Delta"), // no played time → sorts last
    ];
    const xbox = [game("Charlie", { platform: "xbox", lastPlayedUnix: 200 })];

    expect(mergeGames([steam, xbox]).map((g) => g.name)).toEqual([
      "Bravo",
      "Charlie",
      "Alpha",
      "Delta",
    ]);
  });
});
