import {
  buildPicnicImageUrl,
  buildPicnicRecipeUrl,
  parseAccessibilityLabel,
  stripMarkdownDecorators,
  toPicnicProxyImageUrl,
} from "./image.ts";

describe("stripMarkdownDecorators", () => {
  it("removes 6-digit color codes", () => {
    expect(stripMarkdownDecorators("#(#295813)Hello#")).toBe("Hello");
  });

  it("removes 3-digit color codes", () => {
    expect(stripMarkdownDecorators("#(#fff)World#")).toBe("World");
  });

  it("is a no-op on plain text", () => {
    expect(stripMarkdownDecorators("plain text")).toBe("plain text");
  });

  it("trims surrounding whitespace", () => {
    expect(stripMarkdownDecorators("  trimmed  ")).toBe("trimmed");
  });
});

describe("parseAccessibilityLabel", () => {
  it("parses servings and minutes from a full label", () => {
    expect(
      parseAccessibilityLabel(
        "Sticky gyoza roerbak gerecht voor 4 personen 20 Bereidingstijd.",
      ),
    ).toEqual({ servings: 4, totalMinutes: 20 });
  });

  it("parses servings only when minutes are absent", () => {
    expect(parseAccessibilityLabel("Gerecht voor 2 personen")).toEqual({
      servings: 2,
      totalMinutes: undefined,
    });
  });

  it("parses minutes only when servings are absent", () => {
    expect(parseAccessibilityLabel("30 Bereidingstijd")).toEqual({
      servings: undefined,
      totalMinutes: 30,
    });
  });

  it("returns empty object for undefined", () => {
    expect(parseAccessibilityLabel(undefined)).toEqual({});
  });

  it("returns empty object for an unrelated string", () => {
    expect(parseAccessibilityLabel("Geen informatie")).toEqual({
      servings: undefined,
      totalMinutes: undefined,
    });
  });
});

describe("buildPicnicRecipeUrl", () => {
  it("builds an nl recipe URL", () => {
    expect(buildPicnicRecipeUrl("abc-123", "nl")).toBe(
      "https://picnic.app/nl/recepten/abc-123",
    );
  });

  it("builds a de recipe URL", () => {
    expect(buildPicnicRecipeUrl("abc-123", "de")).toBe(
      "https://picnic.app/de/recepten/abc-123",
    );
  });

  it("encodes special characters in the recipe ID", () => {
    expect(buildPicnicRecipeUrl("id with spaces", "nl")).toBe(
      "https://picnic.app/nl/recepten/id%20with%20spaces",
    );
  });
});

describe("buildPicnicImageUrl", () => {
  it("returns undefined when imageAssetId is undefined", () => {
    expect(buildPicnicImageUrl(undefined, "nl")).toBeUndefined();
  });

  it("uses filled-600x600.webp for recipe cover images", () => {
    expect(buildPicnicImageUrl("recipes/abc123hash", "nl")).toBe(
      "https://storefront-prod.nl.picnicinternational.com/static/images/recipes/abc123hash/filled-600x600.webp",
    );
  });

  it("uses filled-600x600.webp for recipe covers in de storefront", () => {
    expect(buildPicnicImageUrl("recipes/abc123hash", "de")).toBe(
      "https://storefront-prod.de.picnicinternational.com/static/images/recipes/abc123hash/filled-600x600.webp",
    );
  });

  it("uses medium.png for plain product/ingredient images", () => {
    expect(buildPicnicImageUrl("bb79ee58abc", "nl")).toBe(
      "https://storefront-prod.nl.picnicinternational.com/static/images/bb79ee58abc/medium.png",
    );
  });

  it("uses medium.png for picnic-page prefixed images", () => {
    expect(buildPicnicImageUrl("picnic-page/hashvalue", "nl")).toBe(
      "https://storefront-prod.nl.picnicinternational.com/static/images/picnic-page/hashvalue/medium.png",
    );
  });
});

describe("toPicnicProxyImageUrl", () => {
  it("wraps a CDN URL in the local proxy path", () => {
    const cdn =
      "https://storefront-prod.nl.picnicinternational.com/static/images/recipes/abc/filled-600x600.webp";
    expect(toPicnicProxyImageUrl(cdn)).toBe(
      `/api/picnic/image?url=${encodeURIComponent(cdn)}`,
    );
  });

  it("returns undefined for undefined input", () => {
    expect(toPicnicProxyImageUrl(undefined)).toBeUndefined();
  });
});
