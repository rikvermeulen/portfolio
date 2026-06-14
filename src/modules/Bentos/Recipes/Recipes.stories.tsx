import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  mockRecipeCards,
  mockRecipesProps,
  mockRecipesWithImageProps,
} from "./Recipes.mock.ts";
import Recipes from "./Recipes.tsx";

const meta = {
  title: "Modules/Bentos/Recipes",
  component: Recipes,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100 p-10">
        <div className="size-80">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof Recipes>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: mockRecipesProps,
};

export const WithImage: Story = {
  args: mockRecipesWithImageProps,
};

export const TwoRecipes: Story = {
  args: { recipes: mockRecipeCards.slice(0, 2) },
};

export const SingleRecipe: Story = {
  args: { recipes: mockRecipeCards.slice(0, 1) },
};

export const Empty: Story = {
  args: { recipes: [] },
};

export const Error: Story = {
  args: {
    recipes: [],
    errorMessage: "Could not load saved recipes.",
  },
};
