"use client";

import { Indicator } from "@/components/Indicator.tsx";
import cc from "@/lib/cc.ts";
import { createRef, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import type { RefObject } from "react";

import Icon from "./Icons/Icon.tsx";

interface PillProps {
  className?: string;
  items: { name: string; url?: string; icon?: string; onClick?: () => void }[];
  activeIndex?: number;
}

const getActiveLinkIndex = (
  items: { url?: string }[],
  activeIndex: number | undefined,
  pathName: string,
) => {
  if (activeIndex !== undefined) {
    return activeIndex;
  }

  const exactMatchIndex = items.findIndex((item) => pathName === item.url);
  if (exactMatchIndex !== -1) {
    return exactMatchIndex;
  }

  if (pathName === "/" && items?.[0]?.url === "/") {
    return 0;
  }

  return (
    items.reduce((bestMatch, item, index) => {
      const currentUrl = item.url || "";
      return pathName.startsWith(currentUrl) &&
        currentUrl.length > (items[bestMatch]?.url?.length || 0)
        ? index
        : bestMatch;
    }, -1) || undefined
  );
};

export default function Pill({ className, items, activeIndex }: PillProps) {
  const pathName = usePathname();

  const linkRefs = useRef(items.map(() => createRef<HTMLElement>()));

  const router = useRouter();

  const activeLinkIndex = getActiveLinkIndex(items, activeIndex, pathName) || 0;

  return (
    <div
      className={cc(
        className,
        "rounded-full border border-solid border-[#DEDEDE] bg-primary/60 p-1.5 drop-shadow-xs backdrop-blur-xl",
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
          const isActive =
            activeLinkIndex !== undefined ? index === activeLinkIndex : false;

          const handleClick = (e: { preventDefault: () => void }) => {
            if (isActive && url !== pathName && url !== "/") {
              e.preventDefault();
              router.push(url || "/");
            } else if (onClick) {
              onClick();
            }
          };

          return (
            <li key={index} className="flex text-base text-white">
              {url ? (
                <Link
                  ref={linkRefs.current[index] as RefObject<HTMLAnchorElement>}
                  href={url}
                  onClick={handleClick}
                  scroll={false}
                  className={cc(
                    isActive ? "text-black" : "text-dark_grey",
                    "px-6 py-3 transition-colors duration-300 hover:text-black sm:px-9",
                  )}
                >
                  {name}
                </Link>
              ) : (
                <button
                  ref={linkRefs.current[index] as RefObject<HTMLButtonElement>}
                  aria-label={`Album ${icon}`}
                  onClick={handleClick}
                  className="flex cursor-pointer items-center justify-center px-5"
                >
                  {icon && (
                    <>
                      <Icon
                        type={icon}
                        className={cc(
                          isActive &&
                            "opacity-0 transition-opacity delay-200 duration-200 ease-in-out",
                          "w-5 fill-dark_grey",
                        )}
                      />
                      {isActive && (
                        <Icon
                          type={`${icon}Fill`}
                          className="popin absolute w-5 hover:fill-black"
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
