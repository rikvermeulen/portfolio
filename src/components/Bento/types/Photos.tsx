'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';

import Pill from '@/components/Pill';

import Bento from '../Bento';

interface AlbumsProps {
  albums: Record<string, string[]>;
}

const Photos: React.FC<AlbumsProps> = ({ albums }) => {
  const [activeAlbumIndex, setActiveAlbumIndex] = useState(0);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const albumNames = Object.keys(albums);
  const mediaFiles = albums[albumNames[activeAlbumIndex]];

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (mediaFiles.length) {
      intervalId = setInterval(() => {
        setActiveMediaIndex((prevIndex) => (prevIndex + 1) % mediaFiles.length);
      }, 5000);
    }

    return () => clearInterval(intervalId);
  }, [mediaFiles]);

  const handleAlbumClick = useCallback((index: number) => {
    setActiveAlbumIndex(index);
  }, []);

  const albumItems = albumNames.map((albumName, index) => ({
    name: albumName,
    icon: albumName, // Adjust this if needed
    onClick: () => handleAlbumClick(index),
  }));

  const renderMedia = (media: string, index: number) => (
    <div
      key={media}
      className={`absolute inset-0 transition-opacity duration-1000 ${
        activeMediaIndex === index ? 'opacity-100' : 'opacity-0'
      }`}
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
    <Bento size="1x1" className="bento group">
      <div className="group relative z-0 h-full w-full overflow-hidden">
        <div className="absolute right-0 z-10 p-5">
          <a href="" target="_blank">
            <Image
              src="/images/icons/photos.png"
              className={`drop-shadow-md transition-transform duration-300 hover:scale-105`}
              alt="media"
              width={32}
              height={32}
            />
          </a>
        </div>
        {mediaFiles.map(renderMedia)}
        <div className="z-10 flex items-center justify-center">
          <Pill
            className="absolute bottom-5 translate-y-20 transition-all duration-300 ease-in-out group-hover:-translate-y-0"
            items={albumItems}
            activeIndex={activeAlbumIndex}
          />
        </div>
      </div>
    </Bento>
  );
};

export default Photos;
