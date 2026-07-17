/**
 *  Components Library file
 *  @memberOf components.Link
 */

import NextLink from "next/link";

import type { LinkProps } from "./Link.types.ts";

import Icon from "@/components/Icon/index.ts";
import { isExternalUrl } from "@/utils/isExternalUrl/index.ts";
import { env } from "@env";

const Link = ({ children, ...props }: LinkProps) => {
  const isExternalLink =
    typeof props.href === "string"
      ? isExternalUrl(props.href, env.NEXT_PUBLIC_APP_URL)
      : false;

  const showExternalIcon = isExternalLink && typeof children === "string";

  return (
    <NextLink
      prefetch={!isExternalLink}
      rel={isExternalLink ? "noopener noreferrer" : undefined}
      target={isExternalLink ? "_blank" : undefined}
      {...props}
    >
      {showExternalIcon ? (
        <span className="inline-flex items-center gap-0.5 underline">
          {children}
          <Icon iconClassName="size-4 shrink-0" name="arrowUpRight" />
        </span>
      ) : (
        children
      )}
    </NextLink>
  );
};

export default Link;
