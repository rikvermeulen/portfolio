import type { GamesProps } from "./Games.types.ts";

const steamHeader = (appid: number) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`;

const steamPortrait = (appid: number) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/library_600x900_2x.jpg`;

// Relative to the mock's own clock so "last played" stays plausible in stories.
const DAY = 86_400;
const now = Math.floor(Date.parse("2026-07-12T10:00:00Z") / 1000);

export const mockGamesProps = {
  sizeKey: "games",
  games: [
    {
      id: "steam-1086940",
      name: "Baldur's Gate 3",
      coverImage: steamHeader(1086940),
      portraitImage: steamPortrait(1086940),
      href: "https://store.steampowered.com/app/1086940",
      playtimeMinutes: 4200,
      lastPlayedUnix: now - 2 * DAY,
    },
    {
      id: "steam-1623730",
      name: "Palworld",
      coverImage: steamHeader(1623730),
      portraitImage: steamPortrait(1623730),
      href: "https://store.steampowered.com/app/1623730",
      playtimeMinutes: 1860,
      lastPlayedUnix: now - 9 * DAY,
    },
    {
      id: "steam-271590",
      name: "Grand Theft Auto V",
      coverImage: steamHeader(271590),
      portraitImage: steamPortrait(271590),
      href: "https://store.steampowered.com/app/271590",
      playtimeMinutes: 540,
      lastPlayedUnix: now - 40 * DAY,
    },
    {
      // No cover art → demonstrates the generated fallback tile
      id: "steam-4704690",
      name: "MECCHA CHAMELEON",
      coverImage: "",
      playtimeMinutes: 127,
    },
  ],
} satisfies GamesProps;
