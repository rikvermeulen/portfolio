'use client';

import { createRef, useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import cc from '@/lib/cc';

import Icon from './Icons/Icon';

type PillProps = {
  className?: string;
  items: { name: string; url?: string; icon?: string; onClick?: () => void }[];
  activeIndex?: number;
};

export default function Pill({ className, items, activeIndex }: PillProps) {
  const pathName = usePathname();
  const indicatorRef = useRef<HTMLDivElement>(null);

  const linkRefs = useRef(items.map(() => createRef<HTMLAnchorElement>()));

  useLayoutEffect(() => {
    const activeLinkIndex = getActiveLinkIndex(items, activeIndex, pathName);
    updateIndicator(linkRefs.current[activeLinkIndex]?.current, indicatorRef.current);
  }, [items, pathName, activeIndex]);

  const getActiveLinkIndex = (
    items: PillProps['items'],
    activeIndex: number | undefined,
    pathName: string,
  ) => {
    if (activeIndex !== undefined) return activeIndex;
    return items.findIndex((item) => item.url === pathName);
  };

  const updateIndicator = (
    activeLinkElement: HTMLAnchorElement | null,
    indicatorElement: HTMLDivElement | null,
  ) => {
    if (activeLinkElement && indicatorElement) {
      indicatorElement.style.transform = `translateX(${Math.max(
        activeLinkElement.offsetLeft,
        0,
      )}px)`;
      indicatorElement.style.width = `${activeLinkElement.offsetWidth}px`;
    }
  };

  return (
    <div
      className={cc(
        'z-50 rounded-full border border-solid border-[#DEDEDE] bg-primary/60 p-1.5 drop-shadow-sm backdrop-blur-xl',
        className,
      )}
    >
      <ul className="relative flex flex-row gap-4">
        <div
          ref={indicatorRef}
          className="absolute -z-10 h-full w-24 rounded-full bg-white transition-transform duration-300 sm:w-full"
        />
        {items.map((item, index) => {
          const { url, name, icon, onClick } = item;
          const isActive = activeIndex !== undefined ? index === activeIndex : pathName === url;

          return (
            <li key={index} className="flex text-base text-white">
              {url ? (
                <Link
                  href={url}
                  ref={linkRefs.current[index]}
                  onClick={onClick}
                  className={cc(
                    isActive ? 'text-black' : 'text-[#707070]',
                    'transition-colors duration-300 hover:text-black px-6 sm:px-9 py-3',
                  )}
                >
                  {name}
                </Link>
              ) : (
                <a
                  ref={linkRefs.current[index]}
                  onClick={onClick}
                  className="flex cursor-pointer items-center justify-center px-5"
                >
                  {icon && (
                    <>
                      <Icon
                        className={cc(
                          isActive && 'opacity-0 transition-opacity duration-200 delay-200',
                          'w-5 fill-[#707070]',
                        )}
                        type={icon}
                      />
                      {isActive && (
                        <Icon
                          className={'pop absolute w-5 hover:fill-black'}
                          type={`${icon}Fill`}
                        />
                      )}
                    </>
                  )}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
