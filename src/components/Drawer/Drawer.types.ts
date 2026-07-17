import type { DragControls, TargetAndTransition } from "framer-motion";
import type { ReactNode } from "react";

/** Enter/active/exit animation targets for the drawer sheet. */
export interface SheetVariants {
  readonly initial: TargetAndTransition;
  readonly animate: TargetAndTransition;
  readonly exit: TargetAndTransition;
}

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
  readonly header?: ReactNode;
  /** Drawer body. */
  readonly children: ReactNode;
  /** Optional pinned footer (e.g. a Close button). */
  readonly footer?: ReactNode;
  /** Extra classes for the sheet surface. */
  readonly className?: string;
}

export interface DrawerHandleProps {
  /** Drag controls shared with the sheet, started on pointer-down. */
  readonly dragControls: DragControls;
  /** Called when the handle is clicked (as opposed to dragged). */
  readonly onClose: () => void;
}

export interface DrawerHeaderProps {
  /** Title text rendered as the heading. */
  readonly title: string;
  /** Optional supporting line under the title. */
  readonly description?: string;
  /** Id wired to the heading so the dialog can reference it via `aria-labelledby`. */
  readonly titleId: string;
}
