import type { RecipesProps } from "./Recipes.types.ts";
import type { PicnicRecipeCard } from "@/lib/recipes/types.ts";

export const mockRecipeCards: readonly PicnicRecipeCard[] = [
  {
    id: "recipe-1",
    title: "Creamy orzo with spinach",
    subtitle: "Fast family favorite",
    recipeUrl: "https://picnic.app/nl/recepten/recipe-1",
    servings: 4,
    totalMinutes: 25,
  },
  {
    id: "recipe-2",
    title: "Sticky gyoza stir fry",
    subtitle: "Big weeknight flavor",
    recipeUrl: "https://picnic.app/nl/recepten/recipe-2",
    servings: 2,
    totalMinutes: 20,
  },
  {
    id: "recipe-3",
    title: "One-pan yaki udon with beef",
    recipeUrl: "https://picnic.app/nl/recepten/recipe-3",
    servings: 3,
    totalMinutes: 30,
  },
];

export const mockRecipesProps = {
  sizeKey: "recipes",
  recipes: mockRecipeCards,
} satisfies RecipesProps;

export const mockRecipesWithImageProps = {
  sizeKey: "recipes",
  recipes: [
    {
      id: "recipe-1",
      title: "Creamy orzo with spinach",
      subtitle: "Fast family favorite",
      recipeUrl: "https://picnic.app/nl/recepten/recipe-1",
      servings: 4,
      totalMinutes: 25,
      imageUrl: "https://picsum.photos/seed/orzo/600/600",
    },
    ...mockRecipeCards.slice(1),
  ],
} satisfies RecipesProps;
