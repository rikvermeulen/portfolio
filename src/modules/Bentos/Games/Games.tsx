"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

import type { Game, GamesProps } from "./Games.types.ts";

import Bento, { bentos } from "@/components/Bento/index.ts";
import Glass from "@/components/Glass/index.ts";
import Icon from "@/components/Icon/index.ts";
import Link from "@/components/Link/index.ts";
import classnames from "@/utils/classnames/classnames.ts";
import { compact } from "@/utils/compact/index.ts";
import { time } from "@/utils/datetime/index.ts";

/** "2 days ago", "yesterday", "3 weeks ago" — from a unix-seconds timestamp. */
function formatLastPlayed(unixSeconds?: number): string | null {
  if (!unixSeconds || unixSeconds <= 0) {
    return null;
  }
  return time.ago(new Date(unixSeconds * 1000));
}

function formatPlaytime(minutes?: number): string | null {
  if (!minutes || minutes <= 0) {
    return null;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 1) {
    return `${minutes} min`;
  }
  return `${hours.toLocaleString()} ${hours === 1 ? "hr" : "hrs"}`;
}

/** Landscape art for the full-bleed hero backdrop. */
function coverCandidates(game: Game): string[] {
  return compact([game.coverImage, game.coverImageFallback]);
}

/** Square-tile art — high-res portrait capsule first, cover art as backup. */
function tileCandidates(game: Game): string[] {
  return compact([
    game.portraitImage,
    game.coverImage,
    game.coverImageFallback,
  ]);
}

function GameArt({
  alt,
  sources,
  errorCount,
  onError,
  className,
  sizes,
}: {
  readonly alt: string;
  readonly sources: readonly string[];
  readonly errorCount: number;
  readonly onError: () => void;
  readonly className?: string;
  readonly sizes: string;
}) {
  const src = sources[errorCount];

  if (src) {
    return (
      <Image
        alt={alt}
        fill
        onError={onError}
        sizes={sizes}
        src={src}
        className={classnames("object-cover", className)}
      />
    );
  }

  // Generated fallback tile — no art available (or all candidates 404'd).
  return (
    <div
      className={classnames(
        "flex size-full items-center justify-center bg-linear-to-br from-white/25 to-white/5 text-white",
        className,
      )}
    >
      <span className="text-lg font-bold">{alt.charAt(0)}</span>
    </div>
  );
}

/** Circular Steam mark pinned to a tile's corner — marks the source platform. */
function SteamBadge() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute right-0.5 bottom-0.5 flex size-3.5 items-center justify-center rounded-full bg-[#171a21] text-white ring-1 ring-black/40"
    >
      <Icon iconClassName="size-2.5" name="steam" />
    </span>
  );
}

/** A rounded game tile: cropped square art + Steam corner badge. */
function GameTile({
  game,
  sizeClassName,
  sizes,
  interactive = false,
  errorCount,
  onError,
}: {
  readonly game: Game;
  readonly sizeClassName: string;
  readonly sizes: string;
  readonly interactive?: boolean;
  readonly errorCount: number;
  readonly onError: () => void;
}) {
  return (
    <span className={classnames("relative block shrink-0", sizeClassName)}>
      <span className="relative block size-full overflow-hidden rounded-lg shadow-md ring-1 ring-white/15">
        <GameArt
          alt={game.name}
          errorCount={errorCount}
          onError={onError}
          sizes={sizes}
          sources={tileCandidates(game)}
          className={
            interactive
              ? "transition-transform duration-200 group-hover:scale-110"
              : undefined
          }
        />
      </span>
      <SteamBadge />
    </span>
  );
}

const Games = ({ sizeKey, games }: GamesProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [artErrors, setArtErrors] = useState<Readonly<Record<string, number>>>(
    {},
  );
  const railRef = useRef<HTMLUListElement>(null);

  const markArtError = (key: string) =>
    setArtErrors((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));

  const featured = useMemo(
    () => games.find((game) => game.id === selectedId) ?? games[0],
    [games, selectedId],
  );

  const others = useMemo(
    () => games.filter((game) => game.id !== featured?.id),
    [games, featured],
  );

  // Vertical wheel input scrolls the rail horizontally (native wheel only pans
  // it via horizontal deltas). Non-passive because we suppress page scroll.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) {
      return;
    }
    const onWheel = (event: WheelEvent) => {
      if (rail.scrollWidth <= rail.clientWidth) {
        return;
      }
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      rail.scrollLeft += delta;
      event.preventDefault();
    };
    rail.addEventListener("wheel", onWheel, { passive: false });
    return () => rail.removeEventListener("wheel", onWheel);
  }, [others.length]);

  if (!featured) {
    return null;
  }

  const lastPlayed = formatLastPlayed(featured.lastPlayedUnix);
  const playtime = formatPlaytime(featured.playtimeMinutes);
  const subtitle = compact([lastPlayed, playtime]).join(" · ");

  // Featured game identity row — the sheet header links to the store page.
  const identity = (
    <div className="flex items-center gap-2.5">
      <GameTile
        errorCount={artErrors[`${featured.id}#tile`] ?? 0}
        game={featured}
        onError={() => markArtError(`${featured.id}#tile`)}
        sizeClassName="size-10"
        sizes="40px"
      />
      <div className="flex min-w-0 flex-col text-white">
        <p className="truncate text-sm font-semibold tracking-tight">
          {featured.name}
        </p>
        {subtitle && (
          <span className="truncate text-[11px] text-white/60 tabular-nums">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <Bento
      app="games"
      imageAlt="Games icon"
      sizes={bentos[sizeKey].sizes}
      className="relative z-0 bg-linear-to-b from-[#1c1c22] to-[#0b0b0f]"
    >
      {/* Full-bleed featured art — the poster is the tile */}
      <div aria-hidden="true" className="absolute inset-0 z-0">
        <GameArt
          alt={featured.name}
          errorCount={artErrors[featured.id] ?? 0}
          onError={() => markArtError(featured.id)}
          sizes="(min-width: 80rem) 22vw, 90vw"
          sources={coverCandidates(featured)}
        />
        {/* Grounding gradient under the glass sheet */}
        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-black/90 via-black/40 to-transparent" />
      </div>

      {/* Glass sheet — one floating surface holds identity + rail */}
      <div className="absolute inset-x-2 bottom-2 z-10 overflow-hidden rounded-xl">
        <Glass blur={12} intensity={1} radius={12} tint="dark" />
        <div className="relative z-10 flex flex-col gap-2.5 p-3">
          {featured.href ? (
            <Link href={featured.href} className="block min-w-0">
              {identity}
            </Link>
          ) : (
            identity
          )}

          {others.length > 0 && (
            <ul
              ref={railRef}
              className="-mx-3 flex gap-2.5 overflow-x-auto px-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {others.map((game) => (
                <li key={game.id} className="shrink-0">
                  <button
                    aria-label={`Show ${game.name}`}
                    onClick={() => setSelectedId(game.id)}
                    type="button"
                    className="group block rounded-lg focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
                  >
                    <GameTile
                      errorCount={artErrors[`${game.id}#tile`] ?? 0}
                      game={game}
                      interactive
                      onError={() => markArtError(`${game.id}#tile`)}
                      sizeClassName="size-9"
                      sizes="36px"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Bento>
  );
};

export default Games;
