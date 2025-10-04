import cc from "@/lib/cc.ts";

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
        "m-auto max-w-[380px] px-4 md:max-w-[760px] md:px-6 xl:max-w-[1140px] xl:px-8 2xl:max-w-[1504px]",
      )}
    >
      {children}
    </div>
  );
}
