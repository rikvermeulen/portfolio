import type { PicnicCountryCode } from "@/vendors/picnic/types.ts";

export interface ParsedAccessibilityInfo {
  readonly servings?: number;
  readonly totalMinutes?: number;
}

/**
 * Strips `#(#rrggbb)` color decorator tokens that Picnic embeds in markdown
 * strings, returning plain text.
 */
export const stripMarkdownDecorators = (value: string): string =>
  value
    .replace(/#\(#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\)/g, "")
    .replace(/#$/g, "")
    .trim();

/**
 * Parses a Picnic recipe accessibility label into structured fields.
 *
 * Example label: `"Sticky gyoza voor 4 personen 20 Bereidingstijd."`
 */
export const parseAccessibilityLabel = (
  label?: string,
): ParsedAccessibilityInfo => {
  if (!label) {
    return {};
  }

  const servings = label.match(/\b(\d+)\s+personen\b/i)?.[1];
  const minutes = label.match(/\b(\d+)\s+Bereidingstijd\b/i)?.[1];

  return {
    servings: servings ? Number(servings) : undefined,
    totalMinutes: minutes ? Number(minutes) : undefined,
  };
};

/**
 * Builds the canonical Picnic recipe page URL for a given recipe ID.
 *
 * @example
 * buildPicnicRecipeUrl("abc123", "nl")
 * // → "https://picnic.app/nl/recepten/abc123"
 */
export const buildPicnicRecipeUrl = (
  recipeId: string,
  countryCode: PicnicCountryCode,
): string =>
  `https://picnic.app/${countryCode}/recepten/${encodeURIComponent(recipeId)}`;

/**
 * Builds a direct Picnic CDN image URL from an asset ID and country code.
 *
 * Recipe cover images (`recipes/HASH`) use the `filled-600x600.webp` variant
 * served by the Picnic web storefront. All other asset IDs use `medium.png`.
 *
 * @example
 * buildPicnicImageUrl("recipes/abc123", "nl")
 * // → "https://storefront-prod.nl.picnicinternational.com/static/images/recipes/abc123/filled-600x600.webp"
 */
export const buildPicnicImageUrl = (
  imageAssetId: string | undefined,
  countryCode: PicnicCountryCode,
): string | undefined => {
  if (!imageAssetId) {
    return undefined;
  }
  const suffix = imageAssetId.startsWith("recipes/")
    ? "filled-600x600.webp"
    : "medium.png";
  return `https://storefront-prod.${countryCode}.picnicinternational.com/static/images/${imageAssetId}/${suffix}`;
};

/**
 * Converts an absolute Picnic CDN URL to a local proxy URL
 * (`/api/picnic/image?url=…`). Returns `undefined` when `url` is falsy.
 */
export const toPicnicProxyImageUrl = (
  url: string | undefined,
): string | undefined => {
  if (!url) {
    return undefined;
  }
  return `/api/picnic/image?url=${encodeURIComponent(url)}`;
};
