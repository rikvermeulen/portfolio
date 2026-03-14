/**
 *  Components Library file
 *  @memberOf components.Link
 */

import NextLink from "next/link";

import type { LinkProps } from "next/link";

import { isExternalUrl } from "@/utils/isExternalUrl/isExternalUrl.ts";

export type NextLinkProps = LinkProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: React.ReactNode;
  };

const Link = ({ children, ...props }: NextLinkProps) => {
  const isExternalLink =
    typeof props.href === "string" ? isExternalUrl(props.href) : false;

  return (
    <NextLink
      prefetch={!isExternalLink}
      rel={isExternalLink ? "noopener noreferrer" : undefined}
      target={isExternalLink ? "_blank" : undefined}
      {...props}
    >
      {children}
    </NextLink>
  );
};

export default Link;
