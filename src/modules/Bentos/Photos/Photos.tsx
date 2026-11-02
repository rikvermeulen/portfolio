"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import type { PhotosProps } from "./Photos.types.ts";
import type { ToggleOption } from "@/components/ToggleGroup/index.ts";

import Bento, { bentos } from "@/components/Bento/index.ts";
import ToggleGroup from "@/components/ToggleGroup/index.ts";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion/index.ts";

const AUTO_ADVANCE_INTERVAL_MS = 3000;
const ALBUM_LINK = "https://www.icloud.com/sharedalbum/#B0fGWZuqDFg0VA";

/** Album name → icon shown in the album toggle. */
const ALBUM_ICONS: Record<string, string> = {
  apps: "images",
  map: "map",
  heart: "heart",
  dog: "dog",
};

const isVideo = (url: string) => url.endsWith(".mp4");
const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const Photos = ({ sizeKey, albums }: PhotosProps) => {
  const reduceMotion = usePrefersReducedMotion();

  const albumNames = Object.keys(albums);
  const [selectedAlbum, setSelectedAlbum] = useState(albumNames[0] ?? "");
  const media = albums[selectedAlbum] ?? [];

  const slideRef = useRef<(HTMLDivElement | null)[]>([]);
  const activeIndexRef = useRef(0);

  const albumOptions: readonly ToggleOption[] = albumNames.map((name) => ({
    value: name,
    label: capitalize(name),
    icon: ALBUM_ICONS[name],
  }));

  useEffect(() => {
    // Nothing to advance through with a single slide, and reduced-motion users
    // hold on the first one — no auto-advancing cross-fade.
    if (reduceMotion || media.length < 2) {
      return;
    }

    // The album just (re)mounted at index 0 via JSX; sync the ref so the first
    // advance moves off the correct slide.
    activeIndexRef.current = 0;

    const timer = setInterval(() => {
      const slides = slideRef.current;
      const current = activeIndexRef.current;
      const next = (current + 1) % media.length;

      slides[current]?.removeAttribute("data-active");
      slides[next]?.setAttribute("data-active", "true");
      activeIndexRef.current = next;
    }, AUTO_ADVANCE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [selectedAlbum, media.length, reduceMotion]);

  return (
    <Bento
      app="photos"
      href={ALBUM_LINK}
      sizes={bentos[sizeKey].sizes}
      surfaceClassName="bg-ds-surface dark:bg-ds-surface-dark"
      className="group relative z-0 size-full"
    >
      <div className="absolute top-5 left-5 z-20 text-white">
        <h2 className="bento-title">My Memories</h2>
      </div>

      {albumNames.length > 1 && (
        <div className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 transition-transform duration-300 ease-in-out [@media(hover:hover)]:translate-y-[200%] [@media(hover:hover)]:group-hover:translate-y-0">
          <ToggleGroup
            ariaLabel="Select photo album"
            onChange={setSelectedAlbum}
            options={albumOptions}
            value={selectedAlbum}
          />
        </div>
      )}

      {media.map((url, index) => (
        <div
          key={url}
          ref={(element) => {
            slideRef.current[index] = element;
          }}
          aria-hidden
          data-active={index === 0 || undefined}
          className="absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out data-active:opacity-100"
        >
          {isVideo(url) ? (
            <video
              autoPlay={!reduceMotion}
              loop
              muted
              playsInline
              preload="metadata"
              src={url}
              className="size-full object-cover"
            />
          ) : (
            <Image
              alt=""
              fill
              priority={index === 0}
              sizes="(min-width: 768px) 25vw, 348px"
              src={url}
              className="object-cover"
            />
          )}
        </div>
      ))}
    </Bento>
  );
};

export default Photos;
