"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import Bento from "@/components/Bento/Bento.tsx";

/**
 * Props for the Photos component
 */
interface AlbumsProps {
  readonly albums: Record<string, readonly string[]>;
}

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
const Photos = ({ albums }: AlbumsProps) => {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const intervalId = useRef<NodeJS.Timeout | null>(null);

  const albumNames = Object.keys(albums);
  const currentAlbumName = albumNames[0];
  const mediaFiles = currentAlbumName ? (albums[currentAlbumName] ?? []) : [];
  const hasMedia = mediaFiles.length > 0;

  /**
   * Clears the current auto-advance interval
   */
  const clearAutoAdvanceInterval = () => {
    if (intervalId.current) {
      clearInterval(intervalId.current);
      intervalId.current = null;
    }
  };

  /**
   * Handles click on media to manually advance to next item
   */
  // const handleMediaClick = () => {
  //   if (!hasMedia) {
  //     return;
  //   }

  //   clearAutoAdvanceInterval();
  //   setActiveMediaIndex((prevIndex) =>
  //     getNextMediaIndex(prevIndex, mediaFiles.length),
  //   );
  // };

  // const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
  //   event.preventDefault();
  //   handleMediaClick();
  // };

  // const handleLinkKeyDown = (event: React.KeyboardEvent<HTMLAnchorElement>) => {
  //   if (event.key === "Enter" || event.key === " ") {
  //     event.preventDefault();
  //     handleMediaClick();
  //   }
  // };

  useEffect(() => {
    clearAutoAdvanceInterval();

    if (!hasMedia) {
      return;
    }

    intervalId.current = setInterval(() => {
      setActiveMediaIndex((prevIndex) =>
        getNextMediaIndex(prevIndex, mediaFiles.length),
      );
    }, AUTO_ADVANCE_INTERVAL_MS);

    return () => {
      clearAutoAdvanceInterval();
    };
  }, [mediaFiles.length, hasMedia]);

  if (!hasMedia) {
    return null;
  }

  const albumDisplayName = currentAlbumName ?? "unknown";

  return (
    <Bento
      href={ALBUM_LINK}
      image="/images/icons/photos.png"
      className="col-span-2 aspect-square size-full"
    >
      {mediaFiles.map((mediaUrl, index) => {
        const isActive = activeMediaIndex === index;
        const isVideoItem = isVideoFile(mediaUrl);

        return (
          <div
            key={mediaUrl}
            data-active={isActive ? true : undefined}
            className="absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out data-active:opacity-100"
          >
            {isVideoItem ? (
              <video
                aria-label={`Video ${index + 1} of ${mediaFiles.length} from ${albumDisplayName} album`}
                autoPlay
                loop
                muted
                playsInline
                src={mediaUrl}
                className="size-full object-cover"
              />
            ) : (
              <Image
                alt={`Photo ${index + 1} of ${mediaFiles.length} from ${albumDisplayName} album`}
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
