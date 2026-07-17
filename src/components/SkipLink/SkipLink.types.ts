export interface SkipLinkProps {
  /** Fragment id of the landmark to jump to. Defaults to `main`. */
  readonly targetId?: string;
  readonly children?: React.ReactNode;
}
