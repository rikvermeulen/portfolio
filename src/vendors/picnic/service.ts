import "server-only";

import { unstable_cache } from "next/cache";

import type {
  PicnicRecipeCard,
  PicnicRecipeCardsData,
} from "@/lib/recipes/types.ts";
import type { Result } from "@/types/index.ts";

import { extractSavedRecipes } from "@/lib/recipes/extract.ts";
import { toRecipeCard } from "@/lib/recipes/toRecipeCard.ts";
import { env } from "@env";

import {
  createPicnicClientFromEnv,
  ensurePicnicAuth,
  PicnicError,
} from "./client.ts";

/**
 * Fetches the current user's saved Picnic recipes as UI-ready cards with
 * proxied image URLs.
 */
export const fetchSavedPicnicRecipes = async (): Promise<
  readonly PicnicRecipeCard[]
> => {
  const client = createPicnicClientFromEnv();
  await ensurePicnicAuth(client);
  // v5 made recipe.getCookbookPage private; this is the same request it wrapped
  const page = await client.app.getPage("cookbook-page-content");
  if (page.format !== "fusion") {
    throw new PicnicError(
      "Picnic served the cookbook page as RSC; saved-recipe extraction needs an update.",
    );
  }
  const countryCode = env.PICNIC_COUNTRY_CODE === "DE" ? "de" : "nl";

  return extractSavedRecipes(page.page).map((recipe) =>
    toRecipeCard(recipe, countryCode),
  );
};

/**
 * Forces a fresh Picnic login and returns the resulting auth key.
 *
 * Only call this when bootstrapping a new `PICNIC_AUTH_KEY` — it requires
 * `PICNIC_EMAIL` and `PICNIC_PASSWORD` to be set in the environment.
 */
export const fetchPicnicAuthKey = async (): Promise<string> => {
  const client = createPicnicClientFromEnv();
  const authKey = await ensurePicnicAuth(client, { forceLogin: true });

  if (!authKey) {
    throw new PicnicError(
      "Picnic login succeeded but no auth key was returned.",
    );
  }

  return authKey;
};

/**
 * Extracts a user-facing error message from an unknown thrown value.
 * Always returns a string safe to surface in the UI.
 */
export const toPicnicErrorMessage = (error: unknown): string => {
  if (error instanceof PicnicError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown Picnic error while loading recipes.";
};

/**
 * Cached projection of the saved recipe cards. `picnic-api` calls bare `fetch`
 * with no Next cache integration, so without this every dashboard render hits
 * Picnic live and blocks the `@recipes` slot. Saved recipes change rarely, so a
 * 1h revalidate is plenty. Only the serializable cards are cached — the wrapped
 * fn throws on failure, so errors propagate and aren't cached. (Per-slot route
 * `revalidate` can't be used here: parallel-route siblings must share one value.)
 */
const getCachedPicnicRecipeCards = unstable_cache(
  async (): Promise<readonly PicnicRecipeCard[]> => {
    return fetchSavedPicnicRecipes();
  },
  ["picnic-saved-recipes"],
  { revalidate: 3600, tags: ["picnic"] },
);

export const getPicnicRecipesResult = async (): Promise<
  Result<PicnicRecipeCardsData>
> => {
  try {
    const recipeCards = await getCachedPicnicRecipeCards();
    if (recipeCards.length === 0) {
      return { ok: false, errorMessage: "No saved recipes found." };
    }
    return { ok: true, data: { recipeCards } };
  } catch (error) {
    return { ok: false, errorMessage: toPicnicErrorMessage(error) };
  }
};
