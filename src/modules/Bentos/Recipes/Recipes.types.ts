import type { PicnicRecipeCard } from "@/lib/picnic/types.ts";

export interface RecipesProps {
  readonly recipes: readonly PicnicRecipeCard[];
  readonly errorMessage?: string;
}
