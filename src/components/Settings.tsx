import { FC, RefObject, useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import Icon from '@/components/Icons/Icon';

import cc from '@/lib/cc';
import { useMusic } from '@/utils/contextMusic';
import useProfile from '@/utils/getProfile';
import truncateText from '@/utils/truncateText';

import AudioControls from './AudioControls';

const DARK_MODE_VAR = '--dark-mode';

const useOutsideClick = (
  ref: RefObject<HTMLDivElement>,
  settingsRef: RefObject<HTMLDivElement>,
  callback: () => void,
) => {
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current?.contains(e.target as Node)) return;
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
};

const Settings: FC = () => {
  const { musicData } = useMusic();
  const { icon, label } = useProfile();
  const { albumName, artist, isPlaying, handlePlayOrPause, handleChangeTrack, albumImage } =
    musicData;
  const [pulsedButton, setPulsedButton] = useState<null | 'playPause' | 'previous' | 'next'>(null);

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const menuRef = useRef(null);
  const settingsRef = useRef(null);

  const toggleMenu = useCallback(() => setIsMenuVisible((prev) => !prev), []);
  useOutsideClick(menuRef, settingsRef, () => setIsMenuVisible(false));

  const toggleDarkMode = () => {
    const current = parseInt(document.body.style.getPropertyValue(DARK_MODE_VAR), 10);
    const newValue = 1 - current;
    document.body.style.setProperty(DARK_MODE_VAR, newValue.toString());
    document.body.setAttribute('data-dark', newValue === 1 ? 'true' : 'false');
  };

  return (
    <>
      <div className="relative">
        <div className="flex w-fit items-center justify-center gap-2 rounded-full border-[0.5px] border-solid bg-[#272628] p-1.5 drop-shadow-sm backdrop-blur-xl">
          <p className="ml-2 justify-self-end text-xs font-semibold text-white/90">0303</p>
          <div
            ref={settingsRef}
            className="group cursor-pointer rounded-full bg-transparent p-2 transition-[transform,color] duration-500 hover:scale-110 hover:bg-white active:bg-white"
            onClick={toggleMenu}
          >
            <Icon
              type="settings"
              className="h-3 w-3 fill-white/90 transition-colors group-hover:fill-black"
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
      </div>
      <div
        className={cc(
          isMenuVisible ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
          'absolute right-8 top-20 z-40 w-full max-w-xs transition-transform origin-top-right duration-200 ease-in-out',
        )}
        ref={menuRef}
      >
        <div className="grid h-full w-full grid-cols-4 items-center justify-center gap-3 rounded-3xl border-[0.5px] border-solid border-[#DEDEDE] bg-[#F4F4F4]/60 p-3 shadow backdrop-blur-xl">
          <div className="col-span-1 h-16 w-full rounded-2xl bg-black/40"></div>
          <div className="col-span-1 flex h-16 w-full items-center justify-center rounded-2xl bg-black/40">
            <Icon type="darkmode" className="color-mode h-7 w-7" onClick={toggleDarkMode} />
          </div>
          <div className="col-span-2 row-span-2 flex h-36 w-full flex-col items-center justify-between rounded-2xl bg-black/40 p-3">
            <Image
              src={albumImage}
              width={40}
              height={40}
              className="rounded-md drop-shadow-md"
              alt="Profile"
            />
            <div className="text-center text-xs">
              <p className="text-white">{truncateText(albumName, 16)}</p>
              <p className="text-white/60">{truncateText(artist, 12)}</p>
            </div>
            <AudioControls
              isPlaying={isPlaying}
              pulsedButton={pulsedButton}
              handlePlayOrPause={handlePlayOrPause}
              handleChangeTrack={handleChangeTrack}
              className="!mt-0"
            />
          </div>
          <div className="col-span-2 flex h-16 w-full items-center gap-2 rounded-2xl bg-black/40 p-3">
            <div className="rounded-full bg-white p-3">
              <Icon type={icon} className="h-4 w-4" />
            </div>
            <div className="w-full text-[11px]">
              <p className="font-medium text-white">{label}</p>
              <p className="-mt-0.5 text-white/60">Enabled</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
