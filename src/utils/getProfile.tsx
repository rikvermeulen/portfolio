'use client';

import { DateTime } from 'luxon';

import { profiles } from '@/types/const';
import { EProfileName } from '@/types/types';

import { FormattedTime } from './FormattedDate';

const isTimeWithinRange = (currentTime: number, startTime: number, endTime: number) => {
  if (startTime <= endTime) {
    return currentTime >= startTime && currentTime < endTime;
  } else {
    return currentTime >= startTime || currentTime < endTime;
  }
};

export default function useProfile(): { icon: string; label: string } {
  const time = DateTime.utc().toString();
  const now = FormattedTime(time);

  if (!now) return { icon: '', label: '' };

  const currentDay = now.toFormat('EEEE');
  const currentTime = now.hour * 60 + now.minute;

  const profileOrder = [
    EProfileName.Personal,
    EProfileName.Working,
    EProfileName.Sleeping,
    EProfileName.NotWorking,
  ];

  for (let profileName of profileOrder) {
    const profile = profiles[profileName];
    if (profile.days.has(currentDay)) {
      if (profile.startTime !== undefined && profile.endTime !== undefined) {
        if (isTimeWithinRange(currentTime, profile.startTime, profile.endTime)) {
          return {
            icon: profile.icon,
            label: profile.label,
          };
        }
      } else {
        return {
          icon: profile.icon,
          label: profile.label,
        };
      }
    }
  }

  return { icon: '', label: '' };
}
