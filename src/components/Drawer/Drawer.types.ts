import type { ReactNode } from "react";

export interface DrawerProps {
  /** Whether the drawer is visible. Controlled. */
  readonly isOpen: boolean;
  /** Called when the drawer requests to open/close (handle, backdrop, Escape). */
  readonly onOpenChange: (isOpen: boolean) => void;
  /** Accessible title (dialog aria-label). Also shown centered under the handle unless `header` is given. */
  readonly title: string;
  /** Optional supporting line under the title (ignored when `header` is given). */
  readonly description?: string;
  /** Full-bleed custom header rendered under the handle, replacing the default title/description block. */
  readonly header?: React.ReactNode;
  /** Drawer body. */
  readonly children: ReactNode;
  /** Optional pinned footer (e.g. a Close button). */
  readonly footer?: ReactNode;
  /** Extra classes for the sheet surface. */
  readonly className?: string;
}
