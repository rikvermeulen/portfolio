export type TagVariant =
  | "neutral"
  | "yellow"
  | "green"
  | "blue"
  | "orange"
  | "pink";

export interface TagProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly label: string;
  readonly variant?: TagVariant;
}
