"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

import type { Game, GamesProps } from "./Games.types.ts";

import Bento, { bentoBoxSizes } from "@/components/Bento/index.ts";
import Glass from "@/components/Glass/index.ts";
import Link from "@/components/Link/index.ts";
import classnames from "@/utils/classnames/classnames.ts";

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

/** Cover-art URLs to try in order before giving up on the generated tile. */
function coverCandidates(game: Game): string[] {
  return [game.coverImage, game.coverImageFallback].filter(
    (url): url is string => Boolean(url),
  );
}

function GameCover({
  game,
  errorCount,
  onError,
  className,
  sizes,
}: {
  readonly game: Game;
  readonly errorCount: number;
  readonly onError: (id: string) => void;
  readonly className?: string;
  readonly sizes: string;
}) {
  const src = coverCandidates(game)[errorCount];

  if (src) {
    return (
      <Image
        alt={game.name}
        fill
        onError={() => onError(game.id)}
        sizes={sizes}
        src={src}
        className={classnames("object-cover", className)}
      />
    );
  }

  // Generated fallback tile — no cover art available (or all candidates 404'd).
  return (
    <div
      className={classnames(
        "flex size-full items-center justify-center bg-linear-to-br from-white/25 to-white/5 text-white",
        className,
      )}
    >
      <span className="text-lg font-bold">{game.name.charAt(0)}</span>
    </div>
  );
}

const Games = ({ games, errorMessage }: GamesProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [coverErrors, setCoverErrors] = useState<
    Readonly<Record<string, number>>
  >({});

  const markCoverError = (id: string) =>
    setCoverErrors((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));

  const featured = useMemo(
    () => games.find((game) => game.id === selectedId) ?? games[0],
    [games, selectedId],
  );

  const others = useMemo(
    () => games.filter((game) => game.id !== featured?.id),
    [games, featured],
  );

  if (!featured) {
    return (
      <Bento
        image="/images/icons/games.png"
        imageAlt="Games icon"
        sizes={bentoBoxSizes.games}
        className="relative z-0 bg-linear-to-b from-[#1c1c22] to-[#0b0b0f]"
      >
        {errorMessage ?? "No games to show right now"}
      </Bento>
    );
  }

  const playtime = formatPlaytime(featured.playtimeMinutes);
  const featuredBackdrop =
    coverCandidates(featured)[coverErrors[featured.id] ?? 0];

  // Full-bleed landscape art with the title + a glass chip overlaid at the base.
  const featuredCard = (
    <div className="relative size-full overflow-hidden rounded-2xl shadow-lg ring-1 ring-white/10">
      <GameCover
        errorCount={coverErrors[featured.id] ?? 0}
        game={featured}
        onError={markCoverError}
        sizes="(min-width: 80rem) 22vw, 90vw"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-black/90 via-black/25 to-transparent"
      />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3.5">
        <div className="flex min-w-0 flex-col gap-0.5 text-white">
          <span className="text-[10px] font-medium tracking-wide text-white/70 uppercase">
            Recently played
          </span>
          <p className="line-clamp-2 text-sm font-semibold tracking-tight">
            {featured.name}
          </p>
        </div>
        {playtime && (
          <div className="relative shrink-0 overflow-hidden rounded-full px-2.5 py-1">
            <Glass intensity={2} radius={999} tint="dark" />
            <span className="relative z-10 text-[11px] font-semibold text-white tabular-nums">
              {playtime}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Bento
      image="/images/icons/games.png"
      imageAlt="Games icon"
      sizes={bentoBoxSizes.games}
      className="relative z-0 bg-linear-to-b from-[#1c1c22] to-[#0b0b0f]"
    >
      {/* Blurred featured cover backdrop */}
      {featuredBackdrop && (
        <div
          aria-hidden="true"
          style={{ backgroundImage: `url(${featuredBackdrop})` }}
          className="absolute inset-0 z-0 size-full bg-cover bg-center opacity-40"
        >
          <div className="size-full backdrop-blur-2xl" />
        </div>
      )}

      <div className="relative z-10 flex h-full flex-col gap-3 p-4">
        {/* Featured game */}
        <div className="min-h-0 flex-1">
          {featured.href ? (
            <Link href={featured.href} className="block size-full">
              {featuredCard}
            </Link>
          ) : (
            featuredCard
          )}
        </div>

        {/* Continue playing */}
        {others.length > 0 && (
          <div className="flex shrink-0 flex-col gap-1.5">
            <span className="text-[10px] font-medium tracking-wide text-white/50 uppercase">
              Continue playing
            </span>
            <ul className="flex gap-2 overflow-x-auto pb-1">
              {others.map((game) => (
                <li key={game.id} className="shrink-0">
                  <button
                    aria-label={`Show ${game.name}`}
                    onClick={() => setSelectedId(game.id)}
                    type="button"
                    className="group relative block h-12 w-[5.5rem] overflow-hidden rounded-xl shadow-md ring-1 ring-white/10 transition-transform duration-200 hover:scale-105"
                  >
                    <GameCover
                      errorCount={coverErrors[game.id] ?? 0}
                      game={game}
                      onError={markCoverError}
                      sizes="88px"
                    />
                    <Glass intensity={0.05} radius={12} tint="none" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Bento>
  );
};

export default Games;
