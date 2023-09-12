import { DateTime } from 'luxon';

const getFormattedDate = (date: string) => {
  const localTime = DateTime.fromISO(date).setLocale('en-US').toFormat('h:mm');

  return localTime;
};

export default getFormattedDate;
