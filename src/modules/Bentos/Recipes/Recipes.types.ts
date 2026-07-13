import type { BentoSizedProps } from "@/components/Bento/index.ts";
import type { PicnicRecipeCard } from "@/lib/picnic/types.ts";

export interface RecipesProps extends BentoSizedProps {
  readonly recipes: readonly PicnicRecipeCard[];
}

export interface RecipeStackProps {
  readonly recipes: RecipesProps["recipes"];
}
