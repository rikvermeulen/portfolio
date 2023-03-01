'use client';

import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';

export default function NewsCard({
  className,
  id,
  image,
  title,
  url,
  description,
  isOpen,
}: {
  className?: string;
  id: number;
  image: string;
  title: string;
  url: string;
  description: string;
  isOpen: boolean;
}) {
  return (
    <Link
      className={clsx(
        className,
        isOpen && 'translate-y-0 hover:bg-white',
        'group z-20 flex w-full gap-4 rounded-lg bg-header p-4 text-white backdrop-blur-lg transition-transform duration-500 '
      )}
      href={url}
    >
      <Image src={image} width={'40'} height={'40'} alt={title} className="h-16 w-16 rounded-md" />
      <div className="w-full">
        <div className="flex justify-between">
          <h3 className={clsx(isOpen && 'group-hover:text-black', 'text-sm ')}>{title}</h3>
          {id === 2 && (
            <span className={clsx(isOpen && 'opacity-0 transition-opacity', 'text-sm')}>
              +3 more
            </span>
          )}
        </div>
        <p className={clsx(isOpen && 'group-hover:text-black', 'text-sm opacity-60')}>
          {description}
        </p>
      </div>
    </Link>
  );
}
