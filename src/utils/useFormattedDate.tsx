import { DateTime } from 'luxon';

const getFormattedDate = (date: string) => {
  const localTime = DateTime.fromISO(date, { zone: 'utc' }).toLocal().toFormat('h:mm');

  return localTime;
};

export default getFormattedDate;
