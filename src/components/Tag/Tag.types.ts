export type TagVariant =
  | "neutral"
  | "yellow"
  | "green"
  | "blue"
  | "orange"
  | "pink"
  | "lavender"
  | "dark";

export interface TagProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly label: string;
  readonly variant?: TagVariant;
}
