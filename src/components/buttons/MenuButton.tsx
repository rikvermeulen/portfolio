'use client';

import Link from 'next/link';
import clsx from 'clsx';

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
      href="/"
      className={clsx(
        classNode,
        'bg-header flex justify-center rounded-full px-4 py-2 text-sm text-white backdrop-blur-lg transition-[opacity,transform,width] duration-500 hover:bg-white hover:text-black',
      )}
      onClick={onClick}
    >
      <span className={classLabel}>{label}</span>
    </Node>
  );
}
