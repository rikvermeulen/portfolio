"use client";

import { useCallback, useSyncExternalStore } from "react";

import type { LiveTimeProps } from "./LiveTime.types.ts";

import { formatClock } from "@/utils/datetime/datetime.ts";

function getCurrentTime(): string {
  return formatClock(new Date());
}

/**
 * Displays the current time that updates at regular intervals.
 *
 * @example
 * ```tsx
 * <LiveTime updateInterval={5000} />
 * ```
 */
export default function LiveTime({ updateInterval = 1000 }: LiveTimeProps) {
  const subscribe = useCallback(
    (callback: () => void) => {
      const id = setInterval(callback, updateInterval);
      return () => clearInterval(id);
    },
    [updateInterval],
  );

  const time = useSyncExternalStore(subscribe, getCurrentTime, () => null);

  if (time === null) {
    return null;
  }
  return <>{time}</>;
}
