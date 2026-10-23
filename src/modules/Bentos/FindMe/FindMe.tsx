"use client";

import Image from "next/image";

import type { FindMeProps } from "./FindMe.types.ts";

import Bento, { bentos } from "@/components/Bento/index.ts";
import Glass from "@/components/Glass/index.ts";
import Icon from "@/components/Icon/index.ts";
import { RADIUS } from "@/lib/radius/index.ts";
import classnames from "@/utils/classnames/index.ts";

import { useFindMeMap } from "./useFindMeMap.ts";

const CLOUDS = [
  { className: "cloud-one", width: 300, height: 267, opacity: "opacity-90" },
  { className: "cloud-two", width: 240, height: 214, opacity: "opacity-80" },
] as const;

const FindMe = ({ sizeKey, className, weatherBadge }: FindMeProps) => {
  const { containerRef, hasToken, zoomIn, zoomOut } = useFindMeMap();

  const zoomControls = [
    { label: "Zoom out", icon: "minus", onClick: zoomOut },
    { label: "Zoom in", icon: "plus", onClick: zoomIn },
  ] as const;

  return (
    <Bento
      app="findme"
      sizes={bentos[sizeKey].sizes}
      surfaceClassName="bg-ds-map"
      className={classnames("relative z-0 size-full", className)}
    >
      {hasToken ? (
        // The map is a WebGL canvas host; the location marker inside carries the
        // accessible name (see `createMarkerElement` in `useFindMeMap`).
        <div ref={containerRef} className="findme-map size-full" />
      ) : (
        <p className="bento-body flex size-full items-center justify-center p-6 text-center text-ds-gray">
          Map unavailable right now.
        </p>
      )}

      {weatherBadge}

      <div aria-hidden className="pointer-events-none absolute top-0 z-10">
        {CLOUDS.map(({ className: cloudClassName, width, height, opacity }) => (
          <Image
            key={cloudClassName}
            alt=""
            height={height}
            src="/images/cloud.png"
            width={width}
            className={classnames(
              cloudClassName,
              opacity,
              "h-auto w-auto -translate-x-full -translate-y-32 contrast-125 transition-transform ease-in-out",
            )}
          />
        ))}
      </div>

      <div className="absolute right-5 bottom-5 z-20 flex h-9 overflow-hidden rounded-full">
        <Glass intensity={2} interactive radius={RADIUS.pill} />
        {zoomControls.map(({ label, icon, onClick }) => (
          <button
            key={label}
            aria-label={label}
            onClick={onClick}
            type="button"
            className="relative flex size-9 cursor-pointer items-center justify-center text-black transition-transform active:scale-90 dark:text-white"
          >
            <Icon iconClassName="size-3" name={icon} />
          </button>
        ))}
      </div>
    </Bento>
  );
};

export default FindMe;
