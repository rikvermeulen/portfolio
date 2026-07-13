"use client";

import { useState } from "react";
import Image from "next/image";

import type { GameTileProps } from "./Games.types.ts";

import Icon from "@/components/Icon/index.ts";
import classnames from "@/utils/classnames/index.ts";
import { compact } from "@/utils/compact/index.ts";

/** Rounded game art with portrait → cover fallback chain and Steam corner badge. */
export function GameTile({ game, sizeClassName, sizes }: GameTileProps) {
  const [errorIndex, setErrorIndex] = useState(0);
  const sources = compact([
    game.portraitImage,
    game.coverImage,
    game.coverImageFallback,
  ]);
  const src = sources[errorIndex];

  return (
    <span className={classnames("relative block shrink-0", sizeClassName)}>
      <span className="relative block size-full overflow-hidden rounded-lg shadow-md ring-1 ring-white/15">
        {src ? (
          <Image
            alt={game.name}
            fill
            onError={() => setErrorIndex((i) => i + 1)}
            sizes={sizes}
            src={src}
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-linear-to-br from-white/25 to-white/5 text-white">
            <span className="text-lg font-bold">{game.name.charAt(0)}</span>
          </div>
        )}
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-0.5 bottom-0.5 flex size-3.5 items-center justify-center rounded-full bg-ds-steam text-white ring-1 ring-black/40"
      >
        <Icon iconClassName="size-2.5" name="steam" />
      </span>
    </span>
  );
}
