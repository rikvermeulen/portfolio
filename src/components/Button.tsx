import Link from 'next/link';

import cc from '@/lib/cc';

interface ButtonProps {
  label: string;
  className?: string;
  href?: string;
  external?: boolean;
  onClick?: () => void;
}

export function ButtonPrimary({ className, label, href, onClick, external }: ButtonProps) {
  const Node = href ? Link : 'button';

  return (
    <Node
      className={cc(
        'text-xs font-bold px-4 py-2 border border-solid border-[#D5D8DA] bg-[#F6F8FA]/60 rounded-full drop-shadow-sm hover:bg-[#f3f4f6]/70 transition-colors duration-200 ease-in-out backdrop-blur-md',
        className,
      )}
      href={href || ''}
      onClick={onClick}
      target={external ? '_blank' : ''}
    >
      {label}
    </Node>
  );
}

export function ButtonSecondary({ className, label, href, onClick, external }: ButtonProps) {
  const Node = href ? Link : 'button';

  return (
    <Node
      className={cc(
        'text-sm font-medium px-4 py-2 border border-solid border-[#D5D8DA] bg-[#F6F8FA] rounded-full drop-shadow-sm hover:bg-[#f3f4f6] transition-colors duration-200 ease-in-out',
        className,
      )}
      href={href || ''}
      onClick={onClick}
      target={external ? '_blank' : ''}
    >
      {label}
    </Node>
  );
}
