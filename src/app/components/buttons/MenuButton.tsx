'use client';

import clsx from 'clsx';
import Link from 'next/link';

export default function Menubutton({
  classNode,
  classLabel,
  onClick,
  label,
  href,
}: {
  classNode?: string;
  classLabel?: string;
  onClick?: () => void;
  label: string;
  href?: string;
}) {
  const Node = href ? Link : 'button';

  return (
    <Node
      href={href || ''}
      className={clsx(
        classNode,
        'flex justify-center rounded-full bg-header px-4 py-2 text-sm text-white backdrop-blur-lg transition-[opacity,transform,width] duration-500 hover:bg-white hover:text-black'
      )}
      onClick={onClick}
    >
      <span className={classLabel}>{label}</span>
    </Node>
  );
}
