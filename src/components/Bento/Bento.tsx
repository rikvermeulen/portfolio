"use client";

import cc from "@/lib/cc";
import Image from "next/image";

export default function Bento({
  className,
  children,
  size,
  resize = false,
  icon,
  href,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  size: string;
  resize?: boolean;
  icon?: string;
  href?: string;
  [key: string]: any;
}) {
  return (
    <div
      data-bento={size}
      className={cc(className, "relative h-full w-full")}
      {...props}
    >
      {icon && (
        <div
          className={cc(
            href &&
              "cursor-pointer transition-transform duration-300 hover:scale-105",
            "absolute top-5 right-5 z-20",
          )}
        >
          <a {...(href ? { href, target: "_blank" } : {})}>
            <Image
              alt="media"
              height={32}
              src={`/images/icons/${icon}.png`}
              width={32}
              className="rounded-md drop-shadow-md"
            />
          </a>
        </div>
      )}
      {children}
    </div>
  );
}
