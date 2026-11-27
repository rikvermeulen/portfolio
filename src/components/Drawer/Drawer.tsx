"use client";

import { useCallback, useId } from "react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";

import type {
  DrawerHandleProps,
  DrawerHeaderProps,
  DrawerProps,
} from "./Drawer.types.ts";

import { FocusTrap } from "@/components/FocusTrap/index.ts";
import Glass from "@/components/Glass/index.ts";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion/index.ts";
import { RADIUS } from "@/lib/radius/index.ts";
import classnames from "@/utils/classnames/index.ts";

import { getSheetVariants, SHEET_SPRING } from "./Drawer.animate.ts";
import { DISMISS_OFFSET, DISMISS_VELOCITY } from "./Drawer.const.ts";

/** Contained slide-up sheet. Fills the nearest positioned, overflow-hidden ancestor. */
export default function Drawer({
  isOpen,
  onOpenChange,
  title,
  description,
  header,
  children,
  footer,
  className,
  surfaceClassName,
}: DrawerProps) {
  const reduceMotion = usePrefersReducedMotion();
  const dragControls = useDragControls();
  const titleId = useId();
  // Memoised so FocusTrap's effect (which depends on onEscape) doesn't tear
  // down and re-run — and re-steal focus — on every Drawer render.
  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  const sheet = getSheetVariants(reduceMotion);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <button
            aria-label="Close"
            onClick={close}
            tabIndex={-1}
            type="button"
            className="absolute inset-0 z-20 cursor-default"
          />

          <motion.dialog
            key="drawer-sheet"
            animate={sheet.animate}
            aria-label={header ? title : undefined}
            aria-labelledby={header ? undefined : titleId}
            aria-modal="true"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragControls={dragControls}
            dragElastic={{ top: 0, bottom: 0.5 }}
            dragListener={false}
            exit={sheet.exit}
            initial={sheet.initial}
            onDragEnd={(_event, info) => {
              // Dismiss when dragged far enough or flicked down fast.
              if (
                info.offset.y > DISMISS_OFFSET ||
                info.velocity.y > DISMISS_VELOCITY
              ) {
                close();
              }
            }}
            open
            transition={SHEET_SPRING}
            className={classnames(
              "absolute inset-x-0 top-4 bottom-0 z-30 m-0 flex size-auto touch-none flex-col overflow-hidden rounded-tile bg-transparent p-0 shadow-2xl",
              !surfaceClassName && "text-white",
              className,
            )}
          >
            {surfaceClassName ? (
              <div
                aria-hidden="true"
                className={classnames(
                  "pointer-events-none absolute inset-0",
                  surfaceClassName,
                )}
              />
            ) : (
              <>
                <Glass
                  blur={16}
                  intensity={1}
                  radius={RADIUS.tile}
                  tint="dark"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-black/50"
                />
              </>
            )}

            <FocusTrap
              isActive={isOpen}
              onEscape={close}
              className="relative z-10 flex min-h-0 flex-1 flex-col"
            >
              <DrawerHandle dragControls={dragControls} onClose={close} />

              {header ? (
                <div className="shrink-0">{header}</div>
              ) : (
                <DrawerHeader
                  description={description}
                  title={title}
                  titleId={titleId}
                />
              )}

              <div className="min-h-0 flex-1 scrollbar-none overflow-y-auto px-5 pb-4 [&::-webkit-scrollbar]:hidden">
                {children}
              </div>

              {footer ? (
                <footer className="shrink-0 p-5">{footer}</footer>
              ) : null}
            </FocusTrap>
          </motion.dialog>
        </>
      )}
    </AnimatePresence>
  );
}

/** Grab handle under the top edge — both a drag affordance and a click-to-close target. */
function DrawerHandle({ dragControls, onClose }: DrawerHandleProps) {
  return (
    <button
      aria-label="Close"
      onClick={onClose}
      onPointerDown={(event) => dragControls.start(event)}
      type="button"
      className="group relative z-10 flex shrink-0 cursor-grab touch-none items-center justify-center pt-2.5 pb-1.5 focus-visible:outline-none active:cursor-grabbing"
    >
      <span className="h-1 w-9 rounded-full bg-current/35 transition-colors group-hover:bg-current/50 group-focus-visible:bg-current/70" />
    </button>
  );
}

/** Default title/description block, shown when no custom `header` is supplied. */
function DrawerHeader({ title, description, titleId }: DrawerHeaderProps) {
  return (
    <header className="shrink-0 px-5 pt-3 pb-4">
      <p id={titleId} className="text-ds-heading">
        {title}
      </p>
      {description ? <p className="text-xs opacity-50">{description}</p> : null}
    </header>
  );
}
