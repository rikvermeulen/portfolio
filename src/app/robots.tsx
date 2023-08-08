import type { MetadataRoute } from 'next';

import { env } from '@/env.mjs';

export default function robots(): MetadataRoute.Robots {
  const host = env.NEXT_PUBLIC_APP_URL;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/',
      crawlDelay: 2,
    },
    sitemap: `${host}/sitemap.xml`,
    host: host,
  };
}
