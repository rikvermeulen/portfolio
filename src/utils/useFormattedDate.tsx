'use client';

import { useEffect, useState } from 'react';

const useFormattedDate = () => {
  const [formattedDate, setFormattedDate] = useState<string>('');

  useEffect(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;
    setFormattedDate(currentTime);
  }, []);

  return formattedDate;
};

export default useFormattedDate;
