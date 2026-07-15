/**
 * Recipe data shaped for UI components.
 *
 * `imageUrl` is always a proxied path (`/api/picnic/image?url=…`) — never a
 * raw CDN URL. `recipeUrl` is always present (built from `id` when missing).
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

export interface PicnicRecipeCardsData {
  readonly recipeCards: readonly PicnicRecipeCard[];
}
