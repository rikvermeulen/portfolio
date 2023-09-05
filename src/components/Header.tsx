'use client';

import Image from 'next/image';
import Link from 'next/link';

import Container from '@/components/Container';

import cc from '@/lib/cc';
import { useMusic } from '@/utils/contextMusic';
import useFormattedDate from '@/utils/useFormattedDate';

import Icon from './Icons/Icon';

export default function Header() {
  const time = useFormattedDate();

  const { musicData } = useMusic();

  return (
    <header className="absolute top-0 z-10 w-full">
      <Container className="flex place-items-start items-center justify-between py-4 md:py-7">
        <div className="flex items-center gap-2 text-black">
          <Link href="/">
            <Image src={'/images/logo.png'} alt="logo" width="20" height="20" />
          </Link>
          <p className="text-xs sm:text-sm">Rik Vermeulen</p>
        </div>
        <div className="flex items-center justify-center gap-1 rounded-full border-solid p-1 text-[#707070] backdrop-blur-lg duration-300 xl:border  xl:border-[#DEDEDE] xl:bg-primary/60 xl:shadow-sm">
          <p className="hidden pl-2 text-sm font-medium">{time || '00:00'}</p>
          <div
            className={cc(
              musicData.isPlaying ? '' : 'hidden',
              'group rounded-full p-2 transition-colors hover:bg-white bg-transparent hover:shadow-2xl',
            )}
          >
            <Icon
              type="wave"
              className={cc(
                musicData.isPlaying ? 'scale-100' : 'scale-0',
                'h-auto w-3 fill-[#707070] hover:fill-white transition-[transform,width] duration-300 delay-300',
              )}
            />
          </div>
          <div className="group hidden rounded-full p-2 transition-colors hover:bg-white hover:shadow-2xl">
            <Icon
              type="settings"
              className="h-auto w-3.5 cursor-pointer fill-[#707070] transition-transform hover:fill-white group-hover:scale-110 group-hover:fill-black"
            />
          </div>
          <Image
            src={'/images/profile.png'}
            className=" rounded-full shadow-md"
            alt="profile"
            width="32"
            height="32"
          />
        </div>
      </Container>
    </header>
  );
}
