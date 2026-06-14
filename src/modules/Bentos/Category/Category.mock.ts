import type { CategoryProps } from "./Category.types.ts";

export const mockCategoryProps = {
  tags: [{ label: "About me" }, { label: "Creative dev", variant: "blue" }],
} satisfies CategoryProps;
