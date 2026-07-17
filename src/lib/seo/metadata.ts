import type { PageMetadataOptions } from "./metadata.types.ts";
import type { Metadata } from "next";

import { env } from "@env";

import { SITE } from "./site.const.ts";

export function buildMetadata(): Metadata {
  return {
    metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
    title: {
      default: SITE.title,
      template: `%s — ${SITE.name}`,
    },
    description: SITE.description,
    keywords: [...SITE.keywords],
    authors: [{ name: SITE.name, url: SITE.url }],
    creator: SITE.name,
    publisher: SITE.name,
    category: "technology",
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      url: SITE.url,
      siteName: SITE.name,
      title: SITE.title,
      description: SITE.description,
      locale: SITE.locale,
    },
    twitter: {
      card: "summary_large_image",
      title: SITE.title,
      description: SITE.description,
      site: SITE.twitterHandle,
      creator: SITE.twitterHandle,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export function buildPageMetadata(options: PageMetadataOptions = {}): Metadata {
  const { title, titleAbsolute, description, path = "/" } = options;

  return {
    title: titleAbsolute ? { absolute: titleAbsolute } : title,
    description,
    alternates: {
      canonical: path,
    },
  };
}
