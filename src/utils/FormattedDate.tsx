import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';

export default function FormattedDate(date: string, format: string = 'h:mm') {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    const localTime = DateTime.fromISO(date, { zone: 'utc' }).toLocal().toFormat(format);

    setFormattedDate(localTime);
  }, [date]);

  return formattedDate;
}

export function FormattedTime(date: string) {
  const [formattedTime, setFormattedTime] = useState<DateTime>();

  useEffect(() => {
    const localTime = DateTime.fromISO(date, { zone: 'utc' }).toLocal();

    setFormattedTime(localTime);
  }, [date]);

  return formattedTime;
}
