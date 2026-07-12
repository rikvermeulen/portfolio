import type { PicnicRecipeCard } from "@/lib/picnic/types.ts";

export interface RecipesProps {
  readonly recipes: readonly PicnicRecipeCard[];
}

export interface RecipeStackProps {
  readonly recipes: RecipesProps["recipes"];
}
