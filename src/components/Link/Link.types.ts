import type { LinkProps as NextLinkProps } from "next/link";

export type LinkProps = NextLinkProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    readonly children: React.ReactNode;
  };
