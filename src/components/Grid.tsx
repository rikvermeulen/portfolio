'use client';

import { useEffect, useRef, useState } from 'react';
import BentoGrid from '@bentogrid/core';

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
  useEffect(() => {
    new BentoGrid({
      target: 'grid-bento',
      columns: 1,
      breakpointReference: 'window',
      breakpoints: BREAKPOINTS,
    });
  }, []);

  return (
    <div
      className={`grid-bento ${className} gap-row m-auto grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4`}
    >
      {children}
    </div>
  );
}
