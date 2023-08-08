import clsx from 'clsx';

export default function Bento({
  className,
  children,
  size,
}: {
  children: React.ReactNode;
  className?: string;
  size?: string;
}) {
  return (
    <div data-bento={size} className={clsx('h-full w-full', className)}>
      {children}
    </div>
  );
}
