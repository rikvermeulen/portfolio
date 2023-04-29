import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const host = process.env.NEXT_PUBLIC_APP_URL as string;

  return [
    {
      url: host,
      lastModified: new Date(),
    },
  ];
}
