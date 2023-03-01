'use client';

import clsx from 'clsx';

export default function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={clsx(className, 'p-5 sm:p-8')}>{children}</div>;
}
