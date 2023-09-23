'use client';

import { createRef, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Indicator } from '@/components/Indicator';

import cc from '@/lib/cc';

import Icon from './Icons/Icon';

type PillProps = {
  className?: string;
  items: { name: string; url?: string; icon?: string; onClick?: () => void }[];
  activeIndex?: number;
};

const getActiveLinkIndex = (
  items: { url?: string }[],
  activeIndex: number | undefined,
  pathName: string,
) => {
  if (activeIndex !== undefined) return activeIndex;

  const exactMatchIndex = items.findIndex((item) => pathName === item.url);
  if (exactMatchIndex !== -1) return exactMatchIndex;

  if (pathName === '/' && items[0].url === '/') return 0;

  return (
    items.reduce((bestMatch, item, index) => {
      const currentUrl = item.url || '';
      return pathName.startsWith(currentUrl) &&
        currentUrl.length > (items[bestMatch]?.url?.length || 0)
        ? index
        : bestMatch;
    }, -1) || undefined
  );
};

export default function Pill({ className, items, activeIndex }: PillProps) {
  const pathName = usePathname();

  const linkRefs = useRef(items.map(() => createRef<any>()));

  const activeLinkIndex = getActiveLinkIndex(items, activeIndex, pathName) || 0;

  return (
    <div
      className={cc(
        className,
        'rounded-full border border-solid border-[#DEDEDE] bg-primary/60 p-1.5 drop-shadow-sm backdrop-blur-xl',
      )}
    >
      <ul className="relative flex flex-row gap-4">
        <Indicator
          activeIndex={activeLinkIndex}
          itemRefs={linkRefs.current}
          className="h-full w-fit bg-white"
        />
        {items.map((item, index) => {
          const { url, name, icon, onClick } = item;
          const isActive = activeLinkIndex !== undefined ? index === activeLinkIndex : false;

          const handleClick = (e: { preventDefault: () => void }) => {
            if (isActive && url !== pathName && url !== '/') {
              e.preventDefault();
              window.location.href = url || '';
            } else if (onClick) {
              onClick();
            }
          };

          return (
            <li key={index} className="flex text-base text-white">
              {url ? (
                <Link
                  href={url}
                  ref={linkRefs.current[index]}
                  onClick={handleClick}
                  className={cc(
                    isActive ? 'text-black' : 'text-[#707070]',
                    'transition-colors duration-300 hover:text-black px-6 sm:px-9 py-3',
                  )}
                >
                  {name}
                </Link>
              ) : (
                <button
                  ref={linkRefs.current[index]}
                  onClick={handleClick}
                  className="flex cursor-pointer items-center justify-center px-5"
                  aria-label={`Album ${icon}`}
                >
                  {icon && (
                    <>
                      <Icon
                        className={cc(
                          isActive &&
                            'opacity-0 transition-opacity ease-in-out duration-200 delay-200',
                          'w-5 fill-[#707070]',
                        )}
                        type={icon}
                      />
                      {isActive && (
                        <Icon
                          className={'popin absolute w-5 hover:fill-black'}
                          type={`${icon}Fill`}
                        />
                      )}
                    </>
                  )}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
