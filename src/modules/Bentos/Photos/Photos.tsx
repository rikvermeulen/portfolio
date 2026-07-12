"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import type { PhotosProps } from "./Photos.types.ts";
import type { ToggleOption } from "@/components/ToggleGroup/index.ts";

import Bento, {
  bentoBoxSizes,
  BentoEmptyState,
} from "@/components/Bento/index.ts";
import ToggleGroup from "@/components/ToggleGroup/index.ts";

const AUTO_ADVANCE_INTERVAL_MS = 3000 as const;
const ALBUM_LINK = "https://www.icloud.com/sharedalbum/#B0fGWZuqDFg0VA";

const isVideoFile = (url: string): boolean => url.endsWith(".mp4");

const getNextMediaIndex = (currentIndex: number, totalCount: number): number =>
  (currentIndex + 1) % totalCount;

/**
 * Photos component that displays a rotating gallery of photos and videos
 * from multiple albums with auto-advance functionality
 *
 * @param props - Component props containing album data
 * @returns A link element containing the photo gallery
 */
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const ALBUM_ICONS: Record<string, string> = {
  apps: "images",
  map: "map",
  heart: "heart",
  dog: "dog",
};

const Photos = ({ albums, errorMessage }: PhotosProps) => {
  const albumNames = Object.keys(albums);
  const [selectedAlbum, setSelectedAlbum] = useState(albumNames[0] ?? "");

  const mediaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeIndexRef = useRef(0);

  const mediaFiles = albums[selectedAlbum] ?? [];

  const albumOptions: readonly ToggleOption[] = albumNames.map((name) => ({
    value: name,
    label: capitalize(name),
    icon: ALBUM_ICONS[name],
  }));
  const hasMedia = mediaFiles.length > 0;

  const handleAlbumChange = (album: string) => {
    setSelectedAlbum(album);
  };

  useEffect(() => {
    // A single item (or none) has nothing to advance through.
    if (mediaFiles.length < 2) {
      return;
    }

    // The album (media set) just (re)mounted at index 0 via JSX; keep the ref
    // in sync so the first advance moves off the correct slide.
    activeIndexRef.current = 0;

    const interval = setInterval(() => {
      const items = mediaRefs.current;
      const previous = activeIndexRef.current;
      const next = getNextMediaIndex(previous, mediaFiles.length);

      items[previous]?.removeAttribute("data-active");
      items[next]?.setAttribute("data-active", "true");
      activeIndexRef.current = next;
    }, AUTO_ADVANCE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [mediaFiles.length, selectedAlbum]);

  if (errorMessage || !hasMedia) {
    return (
      <BentoEmptyState
        message={errorMessage ?? "No photos found."}
        sizes={bentoBoxSizes.photos}
      />
    );
  }

  return (
    <Bento
      href={ALBUM_LINK}
      image="/images/icons/photos.png"
      sizes={bentoBoxSizes.photos}
      className="group size-full"
    >
      {albumNames.length > 1 && (
        <div className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 translate-y-0 transition-transform duration-300 ease-in-out [@media(hover:hover)]:translate-y-[200%] [@media(hover:hover)]:group-hover:translate-y-0">
          <ToggleGroup
            onChange={handleAlbumChange}
            options={albumOptions}
            value={selectedAlbum}
          />
        </div>
      )}
      {mediaFiles.map((mediaUrl, index) => {
        const isVideoItem = isVideoFile(mediaUrl);

        return (
          <div
            key={mediaUrl}
            ref={(element) => {
              mediaRefs.current[index] = element;
            }}
            data-active={index === 0 ? true : undefined}
            className="absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out data-active:opacity-100"
          >
            {isVideoItem ? (
              <video
                aria-label={`Video ${index + 1} of ${mediaFiles.length} from ${selectedAlbum} album`}
                autoPlay
                loop
                muted
                playsInline
                src={mediaUrl}
                className="size-full object-cover"
              />
            ) : (
              <Image
                alt={`Photo ${index + 1} of ${mediaFiles.length} from ${selectedAlbum} album`}
                height={348}
                priority={index === 0}
                src={mediaUrl}
                width={348}
                className="size-full object-cover"
              />
            )}
          </div>
        );
      })}
    </Bento>
  );
};

export default Photos;
