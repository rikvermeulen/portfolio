/**
 *  Components Library file
 *  @memberOf components.Link
 */

import NextLink from "next/link";

import type { LinkProps } from "./Link.types.ts";

import { isExternalUrl } from "@/utils/isExternalUrl/index.ts";
import { env } from "@env";

const Link = ({ children, ...props }: LinkProps) => {
  const isExternalLink =
    typeof props.href === "string"
      ? isExternalUrl(props.href, env.NEXT_PUBLIC_APP_URL)
      : false;

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
