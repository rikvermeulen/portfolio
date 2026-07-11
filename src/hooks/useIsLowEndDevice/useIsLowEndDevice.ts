"use client";

import { useState } from "react";

export const DEFAULT_DEVICE_MEMORY_GB = 4;
export const LOW_END_MAX_DEVICE_MEMORY_GB = 2;
export const DEFAULT_HARDWARE_CONCURRENCY = 4;
export const LOW_END_MAX_HARDWARE_CONCURRENCY = 2;

/**
 * Custom hook to detect whether the device is classified as "low-end" based on
 * its memory and hardware concurrency.
 *
 * A device is considered low-end if either of the following conditions is met:
 * - Device memory (RAM) is less than or equal to `LOW_END_MAX_DEVICE_MEMORY_MB`.
 * - Hardware concurrency (logical processor cores) is less than or equal to
 *   `LOW_END_MAX_HARDWARE_CONCURRENCY`.
 *
 * @returns {boolean} `true` if the device is low-end, `false` otherwise.
 *
 * @example
 * const isLowEndDevice = useLowEndDevice();
 * console.log(isLowEndDevice ? "Low-end device" : "High-end device");
 */
export const useIsLowEndDevice = (): boolean => {
  const [isLowEndDevice] = useState(() => {
    const deviceMemory =
      typeof navigator !== "undefined"
        ? ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ??
          DEFAULT_DEVICE_MEMORY_GB)
        : DEFAULT_DEVICE_MEMORY_GB;
    const hardwareConcurrency =
      typeof navigator !== "undefined"
        ? (navigator.hardwareConcurrency ?? DEFAULT_HARDWARE_CONCURRENCY)
        : DEFAULT_HARDWARE_CONCURRENCY;

    return (
      deviceMemory <= LOW_END_MAX_DEVICE_MEMORY_GB ||
      hardwareConcurrency <= LOW_END_MAX_HARDWARE_CONCURRENCY
    );
  });

  return isLowEndDevice;
};
