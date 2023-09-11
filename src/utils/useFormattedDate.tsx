import { DateTime } from 'luxon';

const useFormattedDate = () => {
  return DateTime.local().toFormat('HH:mm');
};

export default useFormattedDate;
