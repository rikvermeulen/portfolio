import { SITE, SITE_SAME_AS } from "./site.const.ts";

function toAbsolute(path: string): string {
  return `${SITE.url}${path}`;
}

export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.name,
    url: SITE.url,
    jobTitle: SITE.jobTitle,
    email: `mailto:${SITE.email}`,
    image: toAbsolute(SITE.image),
    knowsAbout: [...SITE.knowsAbout],
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE.location.city,
      addressRegion: SITE.location.region,
      addressCountry: SITE.location.countryCode,
    },
    sameAs: SITE_SAME_AS,
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    inLanguage: "en",
    author: {
      "@type": "Person",
      name: SITE.name,
      url: SITE.url,
    },
  };
}

export function siteStructuredData() {
  return [personSchema(), websiteSchema()];
}
