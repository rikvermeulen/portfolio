'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DateTime } from 'luxon';

import Container from '@/components/Container';

import useFormattedDate from '@/utils/FormattedDate';
import { getProfile } from '@/utils/getProfile';

import Icon from './Icons/Icon';
import Tooltip from './Tooltip';

// const { icon: profile, label } = getProfile();

export default function Header() {
  const [currentDate, setCurrentDate] = useState(DateTime.utc().toString());
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(DateTime.utc().toString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const liveTime = useFormattedDate(currentDate);

  return (
    <header className="absolute top-0 z-10 w-full">
      <Container className="grid grid-cols-3 items-center py-4 md:py-7">
        <Link href="/" className="flex items-center gap-2 justify-self-start text-black">
          <Image src={'/images/logo.png'} alt="logo" width="20" height="20" />
          <p className="text-xs font-medium md:text-sm">Rik Vermeulen</p>
        </Link>
        <div className="justify-self-center">
          {/* {profile && (
            <Tooltip content={label}>
              <div className="min-h-fit rounded-full bg-gray-100 p-2">
                <Icon type={profile} className="h-3 w-3" />
              </div>
            </Tooltip>
          )} */}
        </div>
        <p className="justify-self-end text-sm text-dark_grey">{liveTime}</p>
      </Container>
    </header>
  );
}
