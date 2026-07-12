import type { PicnicRecipeCard } from "@/lib/picnic/types.ts";
import type { WithErrorMessage } from "@/types/index.ts";

export interface RecipesProps extends WithErrorMessage {
  readonly recipes: readonly PicnicRecipeCard[];
}
