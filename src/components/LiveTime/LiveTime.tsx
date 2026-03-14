"use client";

import { useEffect, useState } from "react";

/**
 * Formats a Date object to 12-hour format with AM/PM.
 *
 * @param {Date} date - The date to format.
 * @returns {string} Formatted time string (e.g., "3:45 PM").
 */
function formatTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, "0");
  return `${displayHours}:${displayMinutes} ${ampm}`;
}

/**
 * Gets the current time formatted as a string.
 *
 * @returns {string} Current time in 12-hour format with AM/PM.
 */
function getCurrentTime(): string {
  return formatTime(new Date());
}

export interface LiveTimeProps {
  updateInterval?: number;
}

/**
 * Displays the current time that updates at regular intervals.
 *
 * @param {LiveTimeProps} props - Component props.
 * @returns {JSX.Element} The live time display component.
 *
 * @example
 * ```tsx
 * <LiveTime className="text-lg" updateInterval={5000} />
 * ```
 */
export default function LiveTime({ updateInterval = 1000 }: LiveTimeProps) {
  const [time, setTime] = useState(getCurrentTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getCurrentTime());
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  return <>{time}</>;
}
