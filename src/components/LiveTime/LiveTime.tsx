"use client";

import { useCallback, useSyncExternalStore } from "react";

import type { LiveTimeProps } from "./LiveTime.types.ts";

function formatTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, "0");
  return `${displayHours}:${displayMinutes} ${ampm}`;
}

function getCurrentTime(): string {
  return formatTime(new Date());
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
