import type { PicnicRecipeCard } from "./types.ts";
import type {
  PicnicCountryCode,
  PicnicRecipe,
} from "@/vendors/picnic/types.ts";

import {
  buildPicnicImageUrl,
  buildPicnicRecipeUrl,
  toPicnicProxyImageUrl,
} from "./image.ts";

/**
 * Maps a raw Picnic recipe to a UI-ready card: proxies the image URL and fills
 * in the recipe page URL when the API omits it.
 */
export const toRecipeCard = (
  recipe: PicnicRecipe,
  countryCode: PicnicCountryCode,
): PicnicRecipeCard => ({
  id: recipe.id,
  title: recipe.title,
  subtitle: recipe.subtitle,
  deeplink: recipe.deeplink,
  savedAt: recipe.savedAt,
  recipeUrl: recipe.recipeUrl ?? buildPicnicRecipeUrl(recipe.id, countryCode),
  imageUrl: toPicnicProxyImageUrl(
    recipe.imageUrl ?? buildPicnicImageUrl(recipe.imageAssetId, countryCode),
  ),
  dietaryLabel: recipe.dietaryLabel,
  hookText: recipe.hookText,
  availabilityNotice: recipe.availabilityNotice,
  timeText: recipe.timeText,
  servings: recipe.servings,
  totalMinutes: recipe.totalMinutes,
});
