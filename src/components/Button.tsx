import cc from "@/lib/cc.ts";
import Link from "next/link";

interface ButtonProps {
  label: string;
  className?: string;
  href?: string;
  external?: boolean;
  onClick?: () => void;
}

export function ButtonPrimary({
  className,
  label,
  href,
  onClick,
  external,
}: ButtonProps) {
  const Node = href ? Link : "button";

  return (
    <Node
      href={href || ""}
      onClick={onClick}
      target={external ? "_blank" : ""}
      className={cc(
        "rounded-full border border-solid border-[#D5D8DA] bg-[#F6F8FA]/60 px-4 py-2 text-xs font-bold drop-shadow-sm backdrop-blur-md transition-colors duration-200 ease-in-out hover:bg-[#f3f4f6]/70",
        className,
      )}
    >
      {label}
    </Node>
  );
}
