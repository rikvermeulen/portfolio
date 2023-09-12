import { DateTime } from 'luxon';

const getFormattedDate = (date: string) => {
  const localTime = DateTime.fromISO(date, { zone: 'utc' })
    .setZone('Europe/Amsterdam')
    .toFormat('h:mm');

  return localTime;
};

export default getFormattedDate;
