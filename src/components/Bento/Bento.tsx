import clsx from 'clsx';

export default function Bento({
  className,
  children,
  size,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  size?: string;
  [key: string]: any;
}) {
  return (
    <div data-bento="2x2" className={clsx('h-full w-full', className)} {...props}>
      {children}
    </div>
  );
}
