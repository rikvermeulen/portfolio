import cc from '@/lib/cc';

export default function Container({
  className,
  children,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cc(className, 'p-5 sm:p-8')}>{children}</div>;
}
