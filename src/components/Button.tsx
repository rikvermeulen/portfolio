import Link from 'next/link';

import cc from '@/lib/cc';

interface ButtonProps {
  label: string;
  className?: string;
  href?: string;
  onClick?: () => void;
}

export default function Button({ className, label, href, onClick }: ButtonProps) {
  const Node = href ? Link : 'button';

  return (
    <Node
      className={cc(
        'text-xs font-bold px-4 py-2 border border-solid border-[#D5D8DA] bg-[#F6F8FA] rounded-md drop-shadow-sm hover:bg-[#f3f4f6] transition-colors duration-200 ease-in-out',
        className,
      )}
      href={href || ''}
      onClick={onClick}
    >
      {label}
    </Node>
  );
}
