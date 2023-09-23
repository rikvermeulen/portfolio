import { FC, RefObject, useEffect, useRef } from 'react';

import cc from '@/lib/cc';

type IndicatorProps = {
  activeIndex: number;
  itemRefs: RefObject<HTMLDivElement>[];
  className?: string;
};

export const Indicator: FC<IndicatorProps> = ({ activeIndex, itemRefs, className }) => {
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeItemRef = itemRefs[activeIndex];
    if (activeItemRef && activeItemRef.current && indicatorRef.current) {
      const activeLinkElement = activeItemRef.current;
      const indicatorElement = indicatorRef.current;
      indicatorElement.style.transform = `translateX(${Math.max(
        activeLinkElement.offsetLeft,
        0,
      )}px)`;
      indicatorElement.style.width = `${activeLinkElement.offsetWidth}px`;
    }
  }, [activeIndex, itemRefs]);

  return (
    <div
      ref={indicatorRef}
      className={cc(
        className,
        'absolute -z-10 h-full rounded-full transition-transform duration-300 ease-in-out',
      )}
    />
  );
};
