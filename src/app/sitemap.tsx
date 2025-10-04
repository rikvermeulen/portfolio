import { env } from "@/env.ts";

import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = env.NEXT_PUBLIC_APP_URL;

  const routes: string[] = [];

  try {
    // @ts-ignore - Contentlayer generated file may not have proper types
    const { allProjects } = await import("@/.contentlayer/generated/index.mjs");
    if (allProjects && Array.isArray(allProjects)) {
      allProjects.forEach((project: { slugAsParams: string }) => {
        routes.push(`work/${project.slugAsParams}`);
      });
    }
  } catch {
    console.warn(
      "Contentlayer generated file not found, skipping project routes",
    );
  }

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
