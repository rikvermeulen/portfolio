"use client";

import { useState } from "react";
import Image from "next/image";

import type { GamesMenuSection } from "./Games.const.ts";
import type { GamesProps } from "./Games.types.ts";

import AppIcon from "@/components/AppIcon/index.ts";
import Avatar from "@/components/Avatar/index.ts";
import Bento, { bentos } from "@/components/Bento/index.ts";
import Drawer from "@/components/Drawer/index.ts";
import Glass from "@/components/Glass/index.ts";
import Icon from "@/components/Icon/index.ts";
import Link from "@/components/Link/index.ts";
import { formatPlaytime } from "@/lib/games/formatPlaytime.ts";
import classnames from "@/utils/classnames/index.ts";
import { compact } from "@/utils/compact/index.ts";
import { time } from "@/utils/datetime/index.ts";

import {
  ARCADE_BADGE,
  MENU_SECTIONS,
  PLATFORM_APP_ICONS,
} from "./Games.const.ts";
import { GameTile } from "./GameTile.tsx";

/** Game Center-style profile card with drawer sections for games and platforms. */
const Games = ({ sizeKey, profile, platforms, games }: GamesProps) => {
  const [section, setSection] = useState<GamesMenuSection | null>(null);

  const recent = games[0];
  const drawerOpen = section !== null;

  return (
    <Bento
      app="games"
      imageAlt="Games icon"
      sizes={bentos[sizeKey].sizes}
      className="relative z-0"
    >
      <Glass
        intensity={1}
        radius={24}
        tint="none"
        className="-z-10 bg-linear-to-b from-ds-games-from to-ds-games-to"
      />
      <div className="flex size-full flex-col gap-3 p-4">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <span className="relative inline-block">
            <Avatar
              name={profile.name}
              size={52}
              src={profile.avatar}
              className="ring-white/20"
            />
            <span
              aria-hidden="true"
              className="absolute -right-0.5 -bottom-0.5 size-5 overflow-hidden rounded-full"
            >
              <Image
                alt=""
                height={20}
                src={ARCADE_BADGE}
                width={20}
                className="size-full object-cover"
              />
            </span>
          </span>
          <span className="max-w-full truncate text-sm font-bold tracking-wide text-white uppercase">
            {profile.name}
          </span>
          <span className="flex max-w-full items-center gap-1.5 text-xs">
            <span
              aria-hidden="true"
              className={classnames(
                "size-1.5 shrink-0 rounded-full",
                profile.online ? "bg-ds-green" : "bg-white/30",
              )}
            />
            <span
              className={classnames(
                "truncate",
                profile.online ? "text-ds-green" : "text-white/50",
              )}
            >
              {profile.playing ?? (profile.online ? "Online" : "Offline")}
            </span>
          </span>
        </div>

        <section className="mt-auto">
          <h3 className="mb-2 px-1 font-medium text-white">Library</h3>
          <div className="relative overflow-hidden rounded-2xl ring-1 ring-white/10">
            <Glass intensity={1} radius={16} tint="dark" />
            <ul className="relative z-10">
              {MENU_SECTIONS.map((row, index) => (
                <li
                  key={row.section}
                  className={index > 0 ? "border-t border-white/10" : undefined}
                >
                  <button
                    aria-haspopup="dialog"
                    onClick={() => setSection(row.section)}
                    type="button"
                    className="group flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white/60"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10">
                      {row.section === "games" && recent ? (
                        <GameTile game={recent} sizeClassName="size-9" />
                      ) : (
                        <Icon
                          iconClassName="size-5 text-white"
                          name={row.icon}
                        />
                      )}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-sm font-semibold text-white">
                        {row.label}
                      </span>
                      <span className="text-xs text-white/50">
                        {row.section === "games"
                          ? `${games.length} total`
                          : `${platforms.length} total`}
                      </span>
                    </span>
                    <Icon
                      iconClassName="size-3.5 -rotate-90 text-white/40 transition-transform group-hover:translate-x-0.5"
                      name="chevronDown"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <Drawer
        description={
          section === "platforms"
            ? `${platforms.length} platforms`
            : `${games.length} games`
        }
        isOpen={drawerOpen}
        onOpenChange={(open) => !open && setSection(null)}
        title={section === "platforms" ? "Platforms" : "Games"}
      >
        {section === "platforms" ? (
          <ul className="flex flex-col gap-1">
            {platforms.map((platform) => (
              <li key={platform.id}>
                <Link
                  href={platform.href}
                  className="group relative flex items-center gap-3 overflow-hidden rounded-xl px-2.5 py-2 ring-1 ring-white/10 transition hover:ring-white/20 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
                >
                  <Glass intensity={1} radius={12} tint="dark" />
                  <span className="relative z-10 flex min-w-0 flex-1 items-center gap-3">
                    <AppIcon
                      alt={platform.name}
                      darkSrc={PLATFORM_APP_ICONS[platform.id].darkSrc}
                      src={PLATFORM_APP_ICONS[platform.id].src}
                    />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-semibold text-white">
                        {platform.name}
                      </span>
                      <span className="truncate text-xs text-white/50">
                        {platform.handle}
                      </span>
                    </span>
                    <Icon
                      iconClassName="size-3.5 -rotate-90 text-white/40 transition-transform group-hover:translate-x-0.5"
                      name="chevronDown"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="flex flex-col gap-1">
            {games.map((game) => {
              const subtitle = compact([
                time.agoFromUnix(game.lastPlayedUnix),
                formatPlaytime(game.playtimeMinutes),
              ]).join(" · ");

              return (
                <li key={game.id}>
                  <Link
                    href={game.href ?? profile.href}
                    className="group flex items-center gap-3 rounded-xl px-2.5 py-2 transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
                  >
                    <GameTile game={game} sizeClassName="size-9" />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-semibold text-white">
                        {game.name}
                      </span>
                      {subtitle && (
                        <span className="truncate text-xs text-white/50 tabular-nums">
                          {subtitle}
                        </span>
                      )}
                    </span>
                    <Icon
                      iconClassName="size-3.5 -rotate-90 text-white/40 transition-transform group-hover:translate-x-0.5"
                      name="chevronDown"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Drawer>
    </Bento>
  );
};

export default Games;
