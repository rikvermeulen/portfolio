import type { MetadataRoute } from "next";

import { env } from "@env";

/**
 * Template metadata for app links
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 * @returns {MetadataRoute.Sitemap}
 */

const LAST_MODIFIED = "2026-07-17";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = env.NEXT_PUBLIC_APP_URL;

  return [
    {
      url: `${host}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
