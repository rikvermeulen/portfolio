import type { LinkProps as NextLinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

export type LinkProps = NextLinkProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    readonly children: ReactNode;
  };
