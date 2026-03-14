import Image from "next/image";

import type { HTMLAttributes } from "react";

import Link from "@/components/Link/Link.tsx";
import classnames from "@/utils/classnames/classnames.ts";

/**
 * Props for the Bento component
 */
interface BentoProps extends HTMLAttributes<HTMLElement> {
  readonly image?: string;
  readonly href?: string;
  readonly children: React.ReactNode;
}

/**
 * Bento component - A flexible container for bento grid layouts
 * with optional icon and link functionality
 *
 * @param props - Component props
 * @returns A styled article element for bento grid layouts
 */
const Bento = ({ image, href, children, className, ...props }: BentoProps) => {
  const hasLink = Boolean(href);

  return (
    <article
      className={classnames(
        "relative size-full overflow-hidden rounded-2xl",
        className,
      )}
      {...props}
    >
      {image && (
        <div
          className={classnames(
            "absolute top-5 right-5 z-20",
            hasLink &&
              "cursor-pointer transition-transform duration-300 hover:scale-105",
          )}
        >
          {hasLink ? (
            <Link href={href ?? ""}>
              <Image
                alt={image}
                height={32}
                src={image}
                width={32}
                className="rounded-md drop-shadow-md"
              />
            </Link>
          ) : (
            <Image
              alt={image}
              height={32}
              src={image}
              width={32}
              className="rounded-md drop-shadow-md"
            />
          )}
        </div>
      )}
      {children}
    </article>
  );
};

export default Bento;
