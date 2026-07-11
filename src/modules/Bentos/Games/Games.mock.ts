import type { GamesProps } from "./Games.types.ts";

const steamHeader = (appid: number) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`;

export const mockGamesProps = {
  games: [
    {
      id: "steam-1086940",
      name: "Baldur's Gate 3",
      coverImage: steamHeader(1086940),
      href: "https://store.steampowered.com/app/1086940",
      playtimeMinutes: 4200,
    },
    {
      id: "steam-1623730",
      name: "Palworld",
      coverImage: steamHeader(1623730),
      href: "https://store.steampowered.com/app/1623730",
      playtimeMinutes: 1860,
    },
    {
      id: "steam-271590",
      name: "Grand Theft Auto V",
      coverImage: steamHeader(271590),
      href: "https://store.steampowered.com/app/271590",
      playtimeMinutes: 540,
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

export const mockGamesPropsEmpty = {
  games: [],
  errorMessage: "Could not load your games right now",
} satisfies GamesProps;
