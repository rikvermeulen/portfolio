'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DateTime } from 'luxon';

import Container from '@/components/Container';
import Icon from '@/components/Icons/Icon';
import Tooltip from '@/components/Tooltip';

import { FormattedDate } from '@/utils/FormattedDate';
import useProfile from '@/utils/getProfile';

export default function Header() {
  const { icon: profile, label } = useProfile();

  const [currentDate, setCurrentDate] = useState(DateTime.utc().toString());
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(DateTime.utc().toString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const liveTime = FormattedDate(currentDate, 'hh:mm a');

  return (
    <header className="absolute top-0 z-10 w-full">
      <Container className="grid grid-cols-3 items-center py-4 md:py-7">
        <Link href="/" className="flex items-center gap-2 justify-self-start text-black">
          <Image src={'/images/logo.png'} alt="logo" width="20" height="20" />
          <p className="hidden text-xs font-normal sm:block md:text-sm">Rik Vermeulen</p>
        </Link>
        <div className="justify-self-center">
          {profile && (
            <Tooltip content={label}>
              <div className="min-h-fit rounded-full bg-gray-100 p-2">
                <Icon type={profile} className="h-3 w-3" />
              </div>
            </Tooltip>
          )}
        </div>
        <p className="justify-self-end text-sm font-normal text-black">{liveTime}</p>
      </Container>
    </header>
  );
}
