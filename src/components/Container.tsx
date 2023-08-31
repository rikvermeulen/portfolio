import cc from '@/lib/cc';

export default function Container({
  className,
  children,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cc(
        className,
        'm-auto max-w-[380px] md:max-w-[760px] xl:max-w-[1140px] 2xl:max-w-[1504px] px-4 md:px-6 xl:px-8',
      )}
    >
      {children}
    </div>
  );
}
