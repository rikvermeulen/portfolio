"use client";

import Image from "next/image";

import type { FindMeProps } from "./FindMe.types.ts";

import Bento, { bentoBoxSizes } from "@/components/Bento/index.ts";
import Glass from "@/components/Glass/index.ts";
import Icon from "@/components/Icon/index.ts";
import classnames from "@/utils/classnames/classnames.ts";

import FindMeWeatherBadge from "./FindMeWeatherBadge.tsx";
import { useFindMeConditions } from "./useFindMeConditions.ts";
import { useFindMeMap } from "./useFindMeMap.ts";

const FindMe = ({ className }: FindMeProps) => {
  const conditionsState = useFindMeConditions();
  const { containerRef, hasToken, zoomIn, zoomOut } = useFindMeMap();

  return (
    <Bento
      app="findme"
      sizes={bentoBoxSizes.findMe}
      className={classnames("relative z-0 size-full bg-ds-map", className)}
    >
      {hasToken ? (
        <div ref={containerRef} className="findme-map size-full" />
      ) : (
        <div className="flex size-full items-center justify-center p-6 text-center text-sm text-ds-gray">
          Add NEXT_PUBLIC_MAPBOX_TOKEN to enable this map.
        </div>
      )}

      <FindMeWeatherBadge state={conditionsState} />

      <div className="pointer-events-none absolute top-0 z-10">
        <Image
          alt="Cloud"
          height={267}
          src="/images/cloud.png"
          width={300}
          className="cloud-one h-auto w-auto -translate-x-full -translate-y-32 opacity-90 contrast-125 transition-transform ease-in-out"
        />
        <Image
          alt="Cloud"
          height={214}
          src="/images/cloud.png"
          width={240}
          className="cloud-two h-auto w-auto -translate-x-full -translate-y-32 opacity-80 contrast-125 transition-transform ease-in-out"
        />
      </div>

      <div className="group absolute right-5 bottom-5 z-20 flex h-9 overflow-hidden rounded-full">
        <Glass intensity={2} interactive radius={16} />
        <button
          aria-label="Zoom out"
          onClick={zoomOut}
          type="button"
          className="relative flex size-9 items-center justify-center text-black transition-transform active:scale-90 dark:text-white"
        >
          <Icon iconClassName="size-4" name="minus" />
        </button>
        <button
          aria-label="Zoom in"
          onClick={zoomIn}
          type="button"
          className="relative flex size-9 items-center justify-center text-black transition-transform active:scale-90 dark:text-white"
        >
          <Icon iconClassName="size-4" name="plus" />
        </button>
      </div>
    </Bento>
  );
};

export default FindMe;
