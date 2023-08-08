import type { MetadataRoute } from 'next';

import { env } from '@/env.mjs';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = env.NEXT_PUBLIC_APP_URL;

  return [
    {
      url: host,
      lastModified: new Date(),
    },
  ];
}
