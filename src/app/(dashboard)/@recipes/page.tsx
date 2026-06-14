import {
  fetchSavedPicnicRecipes,
  toPicnicErrorMessage,
} from "@/lib/picnic/service.ts";
import { Recipes } from "@/modules/Bentos/index.ts";

async function loadRecipeCards() {
  try {
    const { recipeCards } = await fetchSavedPicnicRecipes();
    return { recipeCards, errorMessage: undefined };
  } catch (error) {
    return {
      recipeCards: [],
      errorMessage: toPicnicErrorMessage(error),
    };
  }
}

export default async function RecipesPage() {
  const { recipeCards, errorMessage } = await loadRecipeCards();

  return <Recipes errorMessage={errorMessage} recipes={recipeCards} />;
}
