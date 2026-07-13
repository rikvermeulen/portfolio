import type { CategoryProps } from "./Category.types.ts";

export const mockCategoryProps = {
  sizeKey: "category",
  tags: [{ label: "About me" }, { label: "Creative dev", variant: "blue" }],
} satisfies CategoryProps;
