'use client';

import Image from 'next/image';

import cc from '@/lib/cc';

export default function Bento({
  className,
  children,
  size,
  resize = false,
  icon,
  href,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  size: string;
  resize?: boolean;
  icon?: string;
  href?: string;
  [key: string]: any;
}) {
  return (
    <div data-bento={size} className={cc(className, 'h-full w-full relative')} {...props}>
      {icon && (
        <div
          className={cc(
            href && 'cursor-pointer transition-transform duration-300 hover:scale-105',
            'absolute right-5 top-5 z-20',
          )}
        >
          <a {...(href ? { href, target: '_blank' } : {})}>
            <Image
              src={`/images/icons/${icon}.png`}
              className="rounded-md drop-shadow-md"
              alt="media"
              width={32}
              height={32}
            />
          </a>
        </div>
      )}
      {children}
    </div>
  );
}
