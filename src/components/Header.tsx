'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DateTime } from 'luxon';

import Container from '@/components/Container';

import { getProfile } from '@/utils/getProfile';
import useFormattedDate from '@/utils/useFormattedDate';

import Icon from './Icons/Icon';
import Tooltip from './Tooltip';

export default function Header() {
  const { icon: profile, label } = getProfile();

  const creationDate = useFormattedDate();

  const [formattedTime, setFormattedTime] = useState(() =>
    creationDate ? DateTime.fromISO(creationDate).toFormat('HH:mm') : '',
  );

  useEffect(() => {
    if (!creationDate) return;
    const intervalId = setInterval(() => {
      setFormattedTime(DateTime.fromISO(creationDate).toFormat('HH:mm'));
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <header className="absolute top-0 z-10 w-full">
      <Container className="grid grid-cols-3 items-center py-4 md:py-7">
        <Link href="/" className="flex items-center gap-2 justify-self-start text-black">
          <Image src={'/images/logo.png'} alt="logo" width="20" height="20" />
          <p className="text-xs font-medium md:text-sm">Rik Vermeulen</p>
        </Link>
        <div className="justify-self-center">
          {profile && (
            <Tooltip content={label}>
              <Icon type={profile} className="w-3" />
            </Tooltip>
          )}
        </div>
        <p className="justify-self-end text-sm text-dark_grey">{formattedTime}</p>
      </Container>
    </header>
  );
}
