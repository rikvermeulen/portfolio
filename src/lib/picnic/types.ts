/** Country code used by the Picnic storefront API. */
export type PicnicCountryCode = "nl" | "de";

/**
 * A recipe as extracted from the Picnic cookbook page.
 *
 * Carries raw data straight from the API — `imageAssetId` is the CDN asset
 * identifier (e.g. `recipes/HASH`), not yet transformed into a proxy URL.
 */
export interface PicnicRecipe {
  readonly id: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly savedAt?: string | null;
  readonly deeplink?: string;
  /** Direct image URL if the API supplies one; use `imageAssetId` otherwise. */
  readonly imageUrl?: string;
  readonly recipeUrl?: string;
  readonly imageAssetId?: string;
  readonly dietaryLabel?: string;
  readonly hookText?: string;
  readonly availabilityNotice?: string;
  readonly timeText?: string;
  readonly servings?: number;
  readonly totalMinutes?: number;
  /** Raw accessibility label used internally to derive `servings` / `totalMinutes`. */
  readonly accessibilityLabel?: string;
}

/**
 * Recipe data shaped for UI components.
 *
 * `imageUrl` is always a proxied path (`/api/picnic/image?url=…`) — never a
 * raw CDN URL. `recipeUrl` is always present (built from `id` when missing
 * from the API response).
 */
export interface PicnicRecipeCard {
  readonly id: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly savedAt?: string | null;
  readonly deeplink?: string;
  readonly recipeUrl: string;
  /** Proxied image URL, or `undefined` when no image is available. */
  readonly imageUrl?: string;
  readonly dietaryLabel?: string;
  readonly hookText?: string;
  readonly availabilityNotice?: string;
  readonly timeText?: string;
  readonly servings?: number;
  readonly totalMinutes?: number;
}
