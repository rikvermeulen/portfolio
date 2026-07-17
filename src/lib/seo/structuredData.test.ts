import { SITE, SITE_SAME_AS } from "./site.const.ts";
import {
  personSchema,
  siteStructuredData,
  websiteSchema,
} from "./structuredData.ts";

describe("structuredData", () => {
  describe("personSchema", () => {
    const schema = personSchema();

    it("declares a schema.org Person", () => {
      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).toBe("Person");
    });

    it("carries identity, role and contact fields", () => {
      expect(schema.name).toBe(SITE.name);
      expect(schema.jobTitle).toBe(SITE.jobTitle);
      expect(schema.url).toBe(SITE.url);
      expect(schema.email).toBe(`mailto:${SITE.email}`);
    });

    it("resolves the relative image path to an absolute URL", () => {
      expect(schema.image).toBe(`${SITE.url}${SITE.image}`);
    });

    it("exposes every social profile as sameAs", () => {
      expect(schema.sameAs).toEqual(SITE_SAME_AS);
    });

    it("includes a postal address for the location", () => {
      expect(schema.address.addressLocality).toBe(SITE.location.city);
      expect(schema.address.addressRegion).toBe(SITE.location.region);
      expect(schema.address.addressCountry).toBe(SITE.location.countryCode);
    });

    it("lists areas of expertise via knowsAbout", () => {
      expect(schema.knowsAbout).toEqual([...SITE.knowsAbout]);
    });
  });

  describe("websiteSchema", () => {
    const schema = websiteSchema();

    it("declares a schema.org WebSite pointing at the canonical url", () => {
      expect(schema["@type"]).toBe("WebSite");
      expect(schema.url).toBe(SITE.url);
      expect(schema.author.name).toBe(SITE.name);
    });
  });

  describe("siteStructuredData", () => {
    it("combines the Person and WebSite graphs", () => {
      expect(siteStructuredData()).toEqual([personSchema(), websiteSchema()]);
    });
  });
});
