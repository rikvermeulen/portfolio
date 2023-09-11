import { DateTime } from 'luxon';

enum ProfileName {
  Working = 'Working',
  Sleeping = 'Sleeping',
  NotWorking = 'Not Working',
  Personal = 'Personal',
}

type Profile = {
  icon: string;
  label: string;
  days: Set<string>;
  startTime?: number;
  endTime?: number;
};

const profiles: { [key in ProfileName]: Profile } = {
  [ProfileName.Working]: {
    icon: 'suitcase',
    label: 'Working 💼',
    days: new Set(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
    startTime: 9 * 60,
    endTime: 18 * 60,
  },
  [ProfileName.Sleeping]: {
    icon: 'moon',
    label: 'Sleeping 😴',
    days: new Set(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
    startTime: 22 * 60,
    endTime: 7 * 60,
  },
  [ProfileName.NotWorking]: {
    icon: 'controller',
    label: 'Weekend 😊',
    days: new Set(['Saturday', 'Sunday']),
  },
  [ProfileName.Personal]: {
    icon: 'person',
    label: 'Time off 🏖️',
    days: new Set(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
    startTime: 18 * 60,
    endTime: 22 * 60,
  },
};

export function getProfile(): { icon: string; label: string } {
  const now = DateTime.local();
  const currentDay = now.toFormat('EEEE'); // Returns the full weekday name
  const currentTime = now.hour * 60 + now.minute;

  console.log(currentDay, currentTime);

  const profileOrder = [
    ProfileName.Personal,
    ProfileName.Working,
    ProfileName.Sleeping,
    ProfileName.NotWorking,
  ];

  for (let profileName of profileOrder) {
    const profile = profiles[profileName];
    if (profile.days.has(currentDay)) {
      if (profile.startTime !== undefined && profile.endTime !== undefined) {
        if (profile.startTime <= profile.endTime) {
          if (currentTime >= profile.startTime && currentTime < profile.endTime) {
            return {
              icon: profile.icon,
              label: profile.label,
            };
          }
        } else {
          if (currentTime >= profile.startTime || currentTime < profile.endTime) {
            return {
              icon: profile.icon,
              label: profile.label,
            };
          }
        }
      } else {
        return {
          icon: profile.icon,
          label: profile.label,
        };
      }
    }
  }

  return { icon: 'personal', label: 'Personal time' };
}
