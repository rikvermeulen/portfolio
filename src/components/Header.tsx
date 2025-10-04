"use client";

import Container from "@/components/Container.tsx";
import Icon from "@/components/Icons/Icon.tsx";
import Tooltip from "@/components/Tooltip.tsx";
import useFormattedDate from "@/utils/FormattedDate.tsx";
import getProfile from "@/utils/getProfile.tsx";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const { icon: profile, label } = getProfile();

  const [currentDate, setCurrentDate] = useState(DateTime.utc().toString());
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(DateTime.utc().toString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const liveTime = useFormattedDate(currentDate, "hh:mm a");

  return (
    <header className="absolute top-0 z-10 w-full">
      <Container className="grid grid-cols-3 items-center py-4 md:py-7">
        <Link
          href="/"
          className="flex items-center gap-2 justify-self-start text-black"
        >
          <Image alt="logo" height="20" src="/images/logo.png" width="20" />
          <p className="hidden text-xs font-normal sm:block md:text-sm">
            Rik Vermeulen
          </p>
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
        <p className="justify-self-end text-sm font-normal text-black">
          {liveTime}
        </p>
      </Container>
    </header>
  );
}
