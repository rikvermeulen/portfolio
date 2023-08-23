'use client';

import { Children, useEffect, useRef, useState } from 'react';
import BentoGrid from '@bentogrid/core';

import { BentoSkeleton } from '@/components/BentoSkeleton';

interface GridProps {
  children: React.ReactNode;
  className?: string;
}

const BREAKPOINTS = {
  768: { columns: 2, cellGap: 16 },
  1280: { columns: 3, cellGap: 16 },
  1536: { columns: 4, cellGap: 16 },
};

export default function Grid({ className = '', children }: GridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const childrenArray = Children.toArray(children);

  useEffect(() => {
    if (!gridRef.current) return;

    const currentGrid = gridRef.current;

    new BentoGrid({
      target: currentGrid,
      columns: 1,
      breakpointReference: 'window',
      breakpoints: BREAKPOINTS,
    });

    setIsLoaded(true);
  }, []);

  return (
    <>
      {!isLoaded && (
        <div className="m-auto grid h-full w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {childrenArray.map((_, index) => (
            <BentoSkeleton
              key={index}
              className={index === 0 || index === 5 ? 'md:col-span-2' : 'col-span-1'}
            />
          ))}
        </div>
      )}
      <div
        ref={gridRef}
        className={`grid-bento ${className} gap-row m-auto grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 ${
          isLoaded ? '' : 'opacity-0'
        }`}
      >
        {children}
      </div>
    </>
  );
}
