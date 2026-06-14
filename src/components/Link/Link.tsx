/**
 *  Components Library file
 *  @memberOf components.Link
 */

import NextLink from "next/link";

import type { LinkProps } from "./Link.types.ts";

import { isExternalUrl } from "@/utils/isExternalUrl/isExternalUrl.ts";

const Link = ({ children, ...props }: LinkProps) => {
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
