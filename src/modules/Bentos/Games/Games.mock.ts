import type { GamesProps } from "./Games.types.ts";

const steamHeader = (appid: number) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`;

const steamPortrait = (appid: number) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/library_600x900_2x.jpg`;

const DAY = 86_400;
const now = Math.floor(Date.parse("2026-07-12T10:00:00Z") / 1000);

export const mockGamesProps = {
  sizeKey: "games",
  profile: {
    id: "76561198000000000",
    name: "PARADEMON",
    avatar:
      "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg",
    href: "https://steamcommunity.com/id/parademon",
    online: true,
    playing: "Baldur's Gate 3",
  },
  platforms: [
    {
      id: "steam",
      name: "Steam",
      handle: "PARADEMON",
      href: "https://steamcommunity.com/id/parademon",
      image:
        "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg",
    },
    {
      id: "xbox",
      name: "Xbox",
      handle: "Parademon",
      href: "https://account.xbox.com/profile?gt=Parademon117",
      image:
        "https://images-eds-ssl.xboxlive.com/image?url=z951ykn43p4FqWbbFvR2Ec.8vbDhj8G2Xe7ZewaisdJ_p1_a3XvfoyfWFOFbCe.png",
    },
  ],
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
  ],
} satisfies GamesProps;
