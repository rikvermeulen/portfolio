import { buildMetadata, buildPageMetadata } from "./metadata.ts";
import { SITE } from "./site.const.ts";

jest.mock("@env", () => ({
  env: { NEXT_PUBLIC_APP_URL: "https://rikvermeulen.com" },
}));

describe("buildMetadata (root)", () => {
  const meta = buildMetadata();

  it("sets metadataBase from the app URL env", () => {
    expect(meta.metadataBase?.toString()).toBe("https://rikvermeulen.com/");
  });

  it("emits the title template with the site default", () => {
    expect(meta.title).toEqual({
      default: SITE.title,
      template: `%s — ${SITE.name}`,
    });
  });

  it("carries the shared description, keywords and root canonical", () => {
    expect(meta.description).toBe(SITE.description);
    expect(meta.keywords).toEqual([...SITE.keywords]);
    expect(meta.alternates?.canonical).toBe("/");
  });

  it("declares Open Graph and a large-image Twitter card", () => {
    expect(meta.openGraph).toMatchObject({
      type: "website",
      url: SITE.url,
      title: SITE.title,
    });
    expect(meta.twitter).toMatchObject({
      card: "summary_large_image",
      creator: SITE.twitterHandle,
      site: SITE.twitterHandle,
    });
  });

  it("declares an indexable robots policy", () => {
    expect(meta.robots).toMatchObject({ index: true, follow: true });
  });
});

describe("buildPageMetadata (per-route overrides)", () => {
  it("defaults to the root canonical and leaves social config to inherit", () => {
    const meta = buildPageMetadata();
    expect(meta.alternates?.canonical).toBe("/");
    expect(meta.openGraph).toBeUndefined();
    expect(meta.twitter).toBeUndefined();
  });

  it("passes a templated title through and sets its own canonical", () => {
    const meta = buildPageMetadata({ title: "Journal", path: "/journal" });
    expect(meta.title).toBe("Journal");
    expect(meta.alternates?.canonical).toBe("/journal");
  });

  it("bypasses the template with an absolute title", () => {
    const meta = buildPageMetadata({ titleAbsolute: SITE.title });
    expect(meta.title).toEqual({ absolute: SITE.title });
  });

  it("threads a custom description through", () => {
    const meta = buildPageMetadata({ description: "Custom description" });
    expect(meta.description).toBe("Custom description");
  });
});
