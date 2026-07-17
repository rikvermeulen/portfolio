export interface SlotProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "children"
> {
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
  ref?: React.Ref<HTMLElement>;
}
