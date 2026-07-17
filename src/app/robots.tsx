import type { MetadataRoute } from "next";

import { env } from "@env";

/**
 * Template metadata for robots.txt
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 * @returns {MetadataRoute.Robots}
 */

export default function robots(): MetadataRoute.Robots {
  const host = env.NEXT_PUBLIC_APP_URL;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${host}/sitemap.xml`,
    host: host,
  };
}
