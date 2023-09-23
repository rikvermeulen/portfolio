'use client';

import { useRef } from 'react';
import Image from 'next/image';

import Bento from '@/components/Bento/Bento';

interface BookProps {
  book: {
    volumeInfo: {
      title: string;
      description?: string;
      authors: string[];
      imageLinks?: {
        medium?: string;
      };
      infoLink: string;
    };
  };
}

function Books({ book: { volumeInfo } }: BookProps) {
  const bookRef = useRef<HTMLDivElement>(null);

  const handleBookClick = () => {
    if (bookRef.current) {
      bookRef.current.classList.toggle('open');
    }
  };

  const { title = '', authors = '', imageLinks = {}, infoLink = '' } = volumeInfo;
  const { medium } = imageLinks;

  const image = medium?.replace('&edge=curl', '') || '';

  const lorem = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.`;

  return (
    <Bento
      size="1x1"
      className="bento relative z-0 bg-gradient-to-b from-[#ffa602] to-[#f9691e] p-5"
      icon="books"
      href={infoLink}
    >
      <div className="flex h-full flex-col justify-between">
        <h2 className="text-lg font-bold text-white">Reading now</h2>
        <div className="transition-transform duration-200 hover:scale-[1.02]">
          <div
            className="book relative mx-auto w-32 cursor-pointer shadow-lg"
            ref={bookRef}
            onClick={handleBookClick}
          >
            <div className="cover absolute -top-1 h-48 w-[8.5rem] origin-top-left rounded-r bg-[#23593c] shadow-sm">
              <Image
                src={image}
                className="h-full w-full overflow-hidden object-cover"
                alt="Book cover"
                width={128}
                height={184}
              />
              <div className="link absolute left-0 top-0 h-full w-full rounded-r"></div>
            </div>
            <div className="page absolute flex h-full w-full origin-top-left flex-col justify-between overflow-hidden p-3 text-xs leading-tight text-black shadow-sm">
              <Image
                src="/images/book-image.png"
                className="mb-2 h-full w-full overflow-hidden object-cover"
                alt="Book cover"
                width={128}
                height={192}
              />
              <h2 className="text-center font-serif text-4xs font-medium">The front gate</h2>
              <p className="text-justify font-serif text-4xs">{lorem}</p>
              <p className="mt-1 text-center text-4xs text-black/60">156</p>
            </div>
            <div className="page absolute flex h-full w-full origin-top-left flex-col justify-between overflow-hidden p-3 text-xs leading-tight text-black shadow-sm">
              <div className="max-h-36 overflow-hidden">
                <p className="text-justify font-serif text-4xs">{lorem}</p>
                <p className="mt-2 text-justify font-serif text-4xs">{lorem}</p>
              </div>
              <p className="mt-1 text-center text-4xs text-black/60">157</p>
            </div>
            <div className="absolute inset-0 -top-1 -z-10 h-[12rem] w-[8.5rem] origin-top-left rounded-r bg-[#23593c] shadow-sm">
              <div className="link absolute left-0 top-0 h-full w-full rounded-r"></div>
            </div>
          </div>
        </div>
        <div className="text-sm">
          <p className="font-bold text-white">{title}</p>
          <p className="text-white/70">{authors}</p>
        </div>
      </div>
    </Bento>
  );
}

export default Books;
