export type TagVariant =
  | "neutral"
  | "green"
  | "yellow"
  | "orange"
  | "red"
  | "purple"
  | "blue"
  | "dark"
  | "rested";

export interface TagProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly label: string;
  readonly variant?: TagVariant;
}
