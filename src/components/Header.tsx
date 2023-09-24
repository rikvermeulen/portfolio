'use client';

import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DateTime } from 'luxon';

import Container from '@/components/Container';
import Icon from '@/components/Icons/Icon';

import cc from '@/lib/cc';
import { useMusic } from '@/utils/contextMusic';
import useFormattedDate from '@/utils/FormattedDate';
import useProfile from '@/utils/getProfile';
import truncateText from '@/utils/truncateText';

const useOutsideClick = (
  ref: React.RefObject<HTMLDivElement>,
  settingsRef: RefObject<HTMLDivElement>,
  callback: () => void,
) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && settingsRef.current.contains(event.target as Node)) return;

      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
};

export default function Header() {
  const { icon, label } = useProfile();

  const { musicData, playOrPause } = useMusic();

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState(DateTime.utc().toString());

  const menuRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const liveTime = useFormattedDate(currentDate, 'hh:mm a');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(DateTime.utc().toString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsMenuVisible((prev) => !prev);
  }, []);

  useOutsideClick(menuRef, settingsRef, () => setIsMenuVisible(false));

  const toggleDarkMode = () => {
    const current = parseInt(document.body.style.getPropertyValue('--dark-mode'), 10) - 0;
    document.body.style.setProperty('--dark-mode', (1 - current).toString());
    document.body.setAttribute('data-dark', 1 - current === 1 ? 'true' : 'false');
  };

  return (
    <header className="absolute top-0 z-50 w-full">
      <Container className="relative flex items-center justify-between py-4 md:py-7">
        <Link href="/" className="flex items-center gap-2 justify-self-start text-black">
          <Image src={'/images/logo.png'} alt="logo" width="20" height="20" />
          <p className="hidden text-xs font-normal sm:block md:text-sm">Rik Vermeulen</p>
        </Link>
        <div className="relative">
          <div className="flex w-fit items-center justify-center gap-2 rounded-full border-[0.5px] border-solid border-[#DEDEDE] bg-[#F4F4F4]/60 p-1.5 drop-shadow-sm backdrop-blur-xl">
            <p className="ml-2 justify-self-end text-xs font-semibold text-black/60">{liveTime}</p>
            <div
              ref={settingsRef}
              className="group cursor-pointer rounded-full p-2 transition-[transform,colors] hover:scale-110 hover:bg-white hover:shadow"
              onClick={toggleMenu}
            >
              <Icon
                type="settings"
                className="h-3 w-3 fill-black/60 transition-colors group-hover:fill-black"
              />
            </div>
            <Image
              src={'/images/profile.png'}
              width={28}
              height={28}
              className="rounded-full"
              alt="Profile"
            />
          </div>
          <Image
            src={'/images/profile.png'}
            width={38}
            height={38}
            className="absolute right-0.5 top-0 -z-10 rounded-full"
            alt="Profile"
          />
        </div>
        {/* menu */}
        <div
          className={cc(
            isMenuVisible ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
            'absolute right-8 top-20 w-full max-w-xs transition-transform origin-top-right duration-200 ease-in-out',
          )}
          ref={menuRef}
        >
          <div className="grid h-full w-full grid-cols-4 items-center justify-center gap-3 rounded-3xl border-[0.5px] border-solid border-[#DEDEDE] bg-[#F4F4F4]/60 p-3 shadow backdrop-blur-xl">
            <div className="col-span-1 h-16 w-full rounded-2xl bg-black/40"></div>
            <div className="col-span-1 flex h-16 w-full items-center justify-center rounded-2xl bg-black/40">
              <Icon type="darkmode" className="color-mode h-7 w-7" onClick={toggleDarkMode} />
            </div>
            <div className="col-span-2 row-span-2 h-36 w-full rounded-2xl  bg-black/40 p-3">
              <p className="text-xs text-white">{truncateText(musicData.albumName, 16)}</p>
              <p className="text-xs text-white/60">{truncateText(musicData.artist, 12)}</p>
              <div className="flex justify-between">
                <button
                  // onClick={() => handleChangeTrack('previous')}
                  className={cc('fill-white relative outline-none border-none')}
                  name="Previous song"
                  aria-label="Previous song"
                >
                  <Icon type="next" className={'relative -top-1 border-none outline-none'} />
                </button>
                <button
                  onClick={playOrPause}
                  className={cc('relative flex h-6 w-6 justify-center fill-white')}
                  name="Play / Pause"
                  aria-label="Play / Pause"
                >
                  <Icon
                    type="pause"
                    className={cc(
                      // isPlaying ? 'opacity-100 scale-100' : 'opacity-0 scale-0',
                      'h-full transition-[opacity,transform] duration-300 ease-in-out active:scale-90',
                    )}
                  />
                  <Icon
                    type="play"
                    className={cc(
                      // !isPlaying ? 'opacity-100 scale-100' : 'opacity-0 scale-0',
                      'transition-[opacity,transform] duration-300 ease-in-out absolute active:scale-90 h-full',
                    )}
                  />
                </button>
                <button
                  // onClick={() => handleChangeTrack('next')}
                  className={cc('-scale-x-100 fill-white border-none outline-none')}
                  name="Next song"
                  aria-label="Next song"
                >
                  <Icon type="next" className={'relative -top-1 border-none outline-none'} />
                </button>
              </div>
            </div>
            <div className="col-span-2 flex h-16 w-full items-center gap-2 rounded-2xl bg-black/40 p-3">
              <div className="rounded-full bg-white p-3">
                <Icon type={icon} className="h-4 w-4" />
              </div>
              <div className="w-full text-[11px]">
                <p className="text-white">{label}</p>
                <p className="-mt-0.5 text-white/60">Enabled</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
}
