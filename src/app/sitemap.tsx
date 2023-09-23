import type { MetadataRoute } from 'next';
import { allProjects } from '@/contentlayer/generated';

import { env } from '@/env.mjs';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = env.NEXT_PUBLIC_APP_URL;

  const routes: string[] = [];

  await allProjects.forEach((project) => {
    routes.push(`work/${project.slugAsParams}`);
  });

  return [
    {
      url: host,
      lastModified: new Date(),
    },
    {
      url: `${host}/work`,
      lastModified: new Date(),
    },
    {
      url: `${host}/archive`,
      lastModified: new Date(),
    },
    ...routes.map((path) => ({
      url: `${host}/${path}`,
      lastModified: new Date(),
    })),
  ];
}
