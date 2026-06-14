import type { TagVariant } from "@/components/Tag/index.ts";

export interface CategoryTag {
  readonly label: string;
  readonly variant?: TagVariant;
}

export interface CategoryProps {
  readonly label?: string;
  readonly tags?: readonly (string | CategoryTag)[];
  readonly className?: string;
}
