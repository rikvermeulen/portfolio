import { useMemo } from 'react';
import { DateTime } from 'luxon';

export function FormattedDate(date: string, format: string = 'h:mm') {
  const formattedDate = useMemo(() => {
    const localTime = DateTime.fromISO(date, { zone: 'utc' }).toLocal().toFormat(format);
    return localTime;
  }, [date, format]);

  return formattedDate;
}

export function FormattedTime(date: string) {
  const formattedTime = useMemo(() => {
    const localTime = DateTime.fromISO(date, { zone: 'utc' }).toLocal();
    return localTime;
  }, [date]);

  return formattedTime;
}
