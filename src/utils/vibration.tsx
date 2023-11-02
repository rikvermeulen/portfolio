'use client';

type VibrationPattern = number | number[];

export function vibrate(pattern: VibrationPattern): void {
  const isVibrationSupported = 'vibrate' in navigator;

  if (isVibrationSupported) {
    console.log('Vibration API is supported in this browser/device.');
    navigator.vibrate(pattern);
  } else {
    console.warn('Vibration API is not supported in this browser/device.');
  }
}
