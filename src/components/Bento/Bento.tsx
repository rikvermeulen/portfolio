'use client';

import { useEffect, useState } from 'react';

import cc from '@/lib/cc';

export default function Bento({
  className,
  children,
  size,
  resize = false,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  size: string;
  resize?: boolean;
  [key: string]: any;
}) {
  return (
    <div data-bento={size} className={cc(className, 'h-full w-full')} {...props}>
      {children}
    </div>
  );
}
