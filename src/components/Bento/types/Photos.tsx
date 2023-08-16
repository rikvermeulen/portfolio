'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import Pill from '@/components/Pill';

import Bento from '../Bento';

export default function Photos() {
  const [activeAlbumIndex, setActiveAlbumIndex] = useState(0);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [mediaFiles, setMediaFiles] = useState<string[]>([]);

  const supabase = createClientComponentClient();

  const albums = useMemo(() => {
    const onClick = (index: number) => () => setActiveAlbumIndex(index);
    return [
      { name: 'all', icon: 'apps', onClick: onClick(0) },
      { name: 'nature', icon: 'map', onClick: onClick(1) },
      { name: 'family', icon: 'heart', onClick: onClick(2) },
      { name: 'Syb', icon: 'dog', onClick: onClick(3) },
    ];
  }, []);

  useEffect(() => {
    async function fetchAlbumImages() {
      const albumName = albums[activeAlbumIndex].name.toLowerCase();
      const { data, error } = await supabase.storage.from('photos').list(albumName);

      if (error) {
        console.error('Failed to fetch album:', error);
        return;
      }

      const fetchPublicUrl = async (file: { name: string }) => {
        const fullPath = `${albumName}/${file.name}`;
        const { data: urlData } = await supabase.storage.from('photos').getPublicUrl(fullPath);

        return urlData.publicUrl;
      };

      const urls = await Promise.all(data.map(fetchPublicUrl));

      setMediaFiles(urls);
      setActiveMediaIndex(0);
    }

    fetchAlbumImages();
  }, [activeAlbumIndex]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (mediaFiles.length) {
      intervalId = setInterval(() => {
        setActiveMediaIndex((prevIndex) => (prevIndex + 1) % mediaFiles.length);
      }, 5000);
    }

    return () => clearInterval(intervalId);
  }, [mediaFiles]);

  const renderMedia = (media: string, index: number) => {
    return (
      <div
        key={media || index}
        className={`absolute left-0 top-0 h-full w-full transition-opacity duration-1000 ${
          activeMediaIndex === index ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {media?.endsWith('.mp4') ? (
          <video src={media} autoPlay loop muted className="h-full w-full object-cover"></video>
        ) : media ? (
          <Image
            src={media}
            alt="media"
            width={348}
            height={348}
            className="h-full w-full object-cover"
            priority
          />
        ) : (
          <div className="h-full w-full object-cover">Unsupported media type</div>
        )}
      </div>
    );
  };

  return (
    <Bento size="1x1" className="bento group">
      <div className="group relative h-full w-full overflow-hidden">
        <div className="absolute right-0 z-20 p-5">
          <Link href="">
            <Image
              src="/images/icons/photos.png"
              className={`drop-shadow-md transition-transform duration-300 hover:scale-105`}
              alt="media"
              width={32}
              height={32}
            />
          </Link>
        </div>
        {mediaFiles.map(renderMedia)}
        <div className="z-40 flex items-center justify-center">
          <Pill
            className="absolute bottom-5 translate-y-20 transition-all duration-300 ease-in-out group-hover:-translate-y-0"
            items={albums}
            activeIndex={activeAlbumIndex}
          />
        </div>
      </div>
    </Bento>
  );
}
