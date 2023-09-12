import { DateTime } from 'luxon';

const getFormattedDate = () => {
  return DateTime.utc().toISO();
};

export default getFormattedDate;
