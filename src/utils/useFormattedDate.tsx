import { DateTime } from 'luxon';

const useFormattedDate = () => {
  return DateTime.utc().toISO();
};

export default useFormattedDate;
