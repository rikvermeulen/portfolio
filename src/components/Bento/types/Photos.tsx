'use client';

import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';

import Bento from '@/components/Bento/Bento';
import Pill from '@/components/Pill';

import { useSound } from '@/hooks/useSound';

interface AlbumsProps {
  albums: Record<string, string[]>;
}

const Photos: FC<AlbumsProps> = ({ albums }) => {
  const [activeAlbumIndex, setActiveAlbumIndex] = useState(0);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const albumNames = Object.keys(albums);
  const mediaFiles = albums[albumNames[activeAlbumIndex]];

  const { playSound } = useSound();

  const intervalId = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (mediaFiles.length) {
      intervalId.current = setInterval(() => {
        setActiveMediaIndex((prevIndex) => (prevIndex + 1) % mediaFiles.length);
      }, 3000);
    }

    return () => {
      if (intervalId.current) clearInterval(intervalId.current);
    };
  }, [mediaFiles]);

  const handleImageClick = () => {
    if (intervalId.current) clearInterval(intervalId.current);
    setActiveMediaIndex((prevIndex) => (prevIndex + 1) % mediaFiles.length);
    playSound('tap');
    intervalId.current = setInterval(() => {
      setActiveMediaIndex((prevIndex) => (prevIndex + 1) % mediaFiles.length);
    }, 3000);
  };

  const handleAlbumClick = useCallback((index: number) => {
    playSound('tap');
    setActiveAlbumIndex(index);
    setActiveMediaIndex(0);
  }, []);

  const albumItems = useMemo(
    () =>
      albumNames.map((albumName, index) => ({
        name: albumName,
        icon: albumName,
        onClick: () => handleAlbumClick(index),
      })),
    [albumNames, handleAlbumClick],
  );

  const renderMedia = (media: string, index: number) => (
    <div
      key={media}
      className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
        activeMediaIndex === index ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleImageClick}
    >
      {media?.endsWith('.mp4') ? (
        <video src={media} autoPlay loop muted className="h-full w-full object-cover"></video>
      ) : (
        <Image
          src={media}
          alt={`Media from ${albumNames[activeAlbumIndex]}`}
          width={348}
          height={348}
          className="h-full w-full object-cover"
          priority
        />
      )}
    </div>
  );

  return (
    <Bento
      size="1x1"
      className="bento group"
      icon="photos"
      href="https://www.icloud.com/sharedalbum/#B0fGWZuqDFg0VA"
    >
      <div className="group relative z-0 h-full w-full overflow-hidden">
        {mediaFiles.map(renderMedia)}
        <div className="z-20 flex items-center justify-center">
          <Pill
            className=" absolute -bottom-16 transition-[bottom] duration-300 ease-in-out will-change-contents group-hover:bottom-5"
            items={albumItems}
            activeIndex={activeAlbumIndex}
          />
        </div>
      </div>
    </Bento>
  );
};

export default Photos;
