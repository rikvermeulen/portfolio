export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** DOM `id` set on the spacer so Navigation can scroll to it. */
  readonly anchorId?: string;
}
