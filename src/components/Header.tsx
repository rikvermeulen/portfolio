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

import AudioControls from './AudioControls';
import Settings from './Settings';

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

  const { musicData } = useMusic();

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [pulsedButton, setPulsedButton] = useState<null | 'playPause' | 'previous' | 'next'>(null);
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
        <Settings />
      </Container>
    </header>
  );
}
