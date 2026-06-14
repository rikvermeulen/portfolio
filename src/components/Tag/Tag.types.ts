import type { HTMLAttributes } from "react";

export type TagVariant =
  | "neutral"
  | "yellow"
  | "green"
  | "blue"
  | "orange"
  | "pink";

export interface TagProps extends HTMLAttributes<HTMLDivElement> {
  readonly label: string;
  readonly variant?: TagVariant;
}
